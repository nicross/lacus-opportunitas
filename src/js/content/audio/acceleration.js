content.audio.acceleration = (() => {
  const bus = content.audio.channel.default.createBus(),
    rootFrequency = engine.fn.fromMidi(24)

  let binaural,
    stressAccelerated = 0,
    synth

  function calculateParameters() {
    const value = content.movement.velocityValue()

    stressAccelerated = engine.fn.accelerateValue(stressAccelerated, calculateStress(), 2)

    const amodDepth = 0.5

    return {
      amodDepth,
      amodFrequency: engine.fn.lerp(1, 12, value),
      carrierGain: 1 - amodDepth,
      color: 8,
      detune: engine.fn.lerp(0, 1200, value + (stressAccelerated * 0.5)),
      gain: engine.fn.fromDb(-12) * (value ** 0.5),
      vector: content.movement.velocity().normalize().rotate(-engine.position.getEuler().yaw).inverse(),
      width: engine.fn.randomFloat(0.125, 0.875),
    }
  }

  function calculateStress() {
    const move = content.movement.rawInput().move || 0

    if (move == 0) {
      return 0
    }

    if (move < 0) {
      return content.movement.velocityValue()
    }

    const targetVelocity = engine.tool.vector2d.create({
      x: content.movement.calculateSpeedLimit(),
    }).rotate(
      engine.position.getEuler().yaw
    )

    return engine.fn.scale(
      content.movement.velocity().normalize().dotProduct(targetVelocity.normalize()),
      -1, 1,
      1, 0
    )
  }

  function createSynth() {
    const attack = 1/8,
      context = engine.context(),
      now = engine.time()

    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      color,
      detune,
      gain,
      vector,
      width,
    } = calculateParameters()

    synth = engine.synth.pwm({
      frequency: rootFrequency,
      detune,
      gain,
      type: 'sawtooth',
      width,
    }).chainAssign(
      'carrierGain', context.createGain()
    ).chainAssign(
      'fader', context.createGain()
    ).filtered({
      detune,
      frequency: rootFrequency * color,
    })

    synth.assign('amod', engine.synth.lfo({
      depth: amodDepth,
      frequency: amodFrequency,
      type: 'sawtooth',
    }).shaped(engine.shape.triple()))

    synth.amod.connect(synth.carrierGain.gain)
    synth.chainStop(synth.amod)
    synth.carrierGain.gain.value = carrierGain

    synth.fader.gain.setValueAtTime(0, now)
    synth.fader.gain.linearRampToValueAtTime(1, now + attack)

    if (binaural) {
      binaural.destroy()
    }

    binaural = engine.ear.binaural.create({
      filterModel: engine.ear.filterModel.musical.instantiate({
        coneRadius: engine.const.tau * 0.25,
        frequency: rootFrequency,
        minColor: 2,
        maxColor: 16,
        power: 1,
      }),
      gainModel: engine.ear.gainModel.normalize,
      ...vector,
    }).from(synth).to(bus)
  }

  function destroySynth() {
    const now = engine.time(),
      release = 1/8

    engine.fn.rampLinear(synth.fader.gain, 0, release)
    synth.stop(now + release)
    synth = undefined
  }

  function updateSynth() {
    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      color,
      detune,
      gain,
      vector,
      width,
    } = calculateParameters()

    engine.fn.setParam(synth.carrierGain.gain, carrierGain)
    engine.fn.setParam(synth.filter.detune, detune)
    engine.fn.setParam(synth.filter.frequency, rootFrequency * color)
    engine.fn.setParam(synth.param.amod.depth, amodDepth)
    engine.fn.setParam(synth.param.amod.frequency, amodFrequency)
    engine.fn.setParam(synth.param.detune, detune)
    engine.fn.setParam(synth.param.gain, gain)
    engine.fn.setParam(synth.param.width, width)

    binaural.update(vector)
  }

  return {
    reset: function () {
      stressAccelerated = 0

      if (synth) {
        destroySynth()
      }

      return this
    },
    update: function () {
      if (content.movement.velocityValue()) {
        if (!synth) {
          createSynth()
        } else {
          updateSynth()
        }
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.acceleration.update()
})

engine.state.on('reset', () => content.audio.acceleration.reset())
