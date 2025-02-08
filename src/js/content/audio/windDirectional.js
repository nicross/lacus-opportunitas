content.audio.windDirectional = (() => {
  const rootFrequency = engine.fn.fromMidi(36),
    windStrength = 1/12

  let binaural,
    synth

  const amplitudeField = engine.fn.createNoise({
    octaves: 4,
    seed: ['windDirectional', 'amplitude'],
    type: '1d',
  })

  const angleField = engine.fn.createNoise({
    octaves: 4,
    seed: ['windDirectional', 'angle'],
    type: '1d',
  })

  function calculateParameters() {
    const time = content.time.value(),
      velocity = content.movement.velocity(),
      velocityValue = content.movement.velocityValue(),
      windVector = content.wind.vector(),
      windVelocity = content.wind.velocity()

    const value = engine.fn.clamp(
      (windVelocity * windStrength) + velocityValue + (engine.fn.lerp(-velocityValue, 1, amplitudeField.value(time / 1)) * 1/16)
    )

    const vector = engine.tool.vector3d.create(velocity)
      .normalize()
      .scale(velocityValue)
      .add(windVector.scale(windStrength * (1 - velocityValue)))
      .normalize()
      .rotateQuaternion(engine.position.getQuaternion().conjugate())
      .rotateEuler({
        yaw: engine.fn.lerp(-1, 1, amplitudeField.value(time / 1)) * 1/16 * engine.const.tau,
      })

    return {
      color: engine.fn.lerpExp(0.5, 4, value, 2),
      gain: engine.fn.fromDb(-12) * engine.fn.fromDb(engine.fn.lerp(0, -6, value)),
      playbackRate: value,
      vector,
    }
  }

  function createSynth() {
    const bus = content.audio.channel.default.createBus(),
      context = engine.context()

    const {
      color,
      gain,
      playbackRate,
      vector,
    } = calculateParameters()

    synth = engine.synth.buffer({
      buffer: content.audio.buffer.brownNoise.get(1),
      gain,
      playbackRate,
    }).filtered({
      frequency: rootFrequency * color,
    }).chainAssign(
      'fader', context.createGain()
    )

    binaural = engine.ear.binaural.create({
      filterModel: engine.ear.filterModel.musical.instantiate({
        coneRadius: engine.const.tau * 0.25,
        frequency: rootFrequency,
        minColor: 1,
        maxColor: 8,
        power: 1,
      }),
      gainModel: engine.ear.gainModel.normalize,
      ...vector,
    }).from(synth).to(bus)

    synth.fader.gain.value = engine.const.zeroGain
    engine.fn.rampLinear(synth.fader.gain, 1, 1/8)
  }

  async function destroySynth() {
    if (!synth) {
      return
    }

    const release = 1/8

    synth.stop(engine.time() + release)
    engine.fn.rampLinear(synth.fader.gain, release)

    await engine.fn.promise(release * 1000)
    binaural.destroy()
  }

  function updateSynth() {
    if (!synth) {
      return
    }

    const {
      color,
      gain,
      playbackRate,
      vector,
    } = calculateParameters()

    engine.fn.setParam(synth.filter.frequency, rootFrequency * color)
    engine.fn.setParam(synth.param.gain, gain)
    engine.fn.setParam(synth.param.playbackRate, playbackRate)

    binaural.update(vector)
  }

  return {
    load: function () {
      engine.ephemera
        .add(angleField)
        .add(amplitudeField)

      createSynth()

      return this
    },
    unload: function () {
      engine.ephemera
        .remove(angleField)
        .remove(amplitudeField)

      destroySynth()

      return this
    },
    update: function () {
      updateSynth()

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.windDirectional.update()
})

engine.state.on('import', () => content.audio.windDirectional.load())
engine.state.on('reset', () => content.audio.windDirectional.unload())
