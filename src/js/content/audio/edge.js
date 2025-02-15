content.audio.edge = (() => {
  const rootFrequency = engine.fn.fromMidi(36)

  let binaural,
    synth

  function calculateParameters() {
    const lakeRadius = content.lake.radius(),
      position = engine.position.getVector()

    const value = engine.fn.clamp(
      engine.fn.scale(
        position.distance(),
        lakeRadius - content.dock.radius(), lakeRadius,
        0, 1,
      )
    )

    const amodDepth = engine.fn.fromDb(engine.fn.lerp(-9, -3, value))

    return {
      amodDepth,
      amodFrequency: engine.fn.lerp(4, 12, value),
      carrierGain: 1 - amodDepth,
      gain: engine.fn.fromDb(-15) * value,
      vector: position.normalize().rotateQuaternion(engine.position.getQuaternion().conjugate()),
    }
  }

  function createSynth() {
    const bus = content.audio.channel.default.createBus(),
      context = engine.context()

    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      gain,
      vector,
    } = calculateParameters()

    synth = engine.synth.pwm({
      detune: -600,
      frequency: rootFrequency,
      gain,
      type: 'sawtooth'
    }).chainAssign(
      'carrierGain', context.createGain()
    ).filtered({
      frequency: rootFrequency * 8,
      type: 'highpass',
    }).chainAssign(
      'fader', context.createGain()
    )

    synth.assign('amod', engine.synth.lfo({
      depth: amodDepth,
      frequency: amodFrequency,
    }))

    synth.amod.connect(synth.carrierGain.gain)
    synth.chainStop(synth.amod)
    synth.carrierGain.gain.value = carrierGain

    binaural = engine.ear.binaural.create({
      filterModel: engine.ear.filterModel.musical.instantiate({
        coneRadius: engine.const.tau * 0.25,
        frequency: rootFrequency,
        minColor: 6,
        maxColor: 12,
        power: 2,
      }),
      gainModel: engine.ear.gainModel.normalize,
      ...vector,
    }).from(synth).to(bus)

    synth.fader.gain.value = engine.const.zeroGain
    engine.fn.rampLinear(synth.fader.gain, 1, 1/32)
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

    synth = undefined
  }

  function updateSynth() {
    if (!synth) {
      return
    }

    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      gain,
      vector,
    } = calculateParameters()

    engine.fn.setParam(synth.carrierGain.gain, carrierGain)
    engine.fn.setParam(synth.param.amod.depth, amodDepth)
    engine.fn.setParam(synth.param.amod.frequency, amodFrequency)
    engine.fn.setParam(synth.param.gain, gain)

    binaural.update(vector)
  }

  return {
    reset: function () {
      destroySynth()

      return this
    },
    update: function () {
      const isAudible = engine.position.getVector().distance() > content.lake.radius() - content.dock.radius()

      if (isAudible) {
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

  content.audio.edge.update()
})

content.dock.on('change', () => content.audio.edge.reset())
content.dock.on('dock', () => content.audio.edge.reset())
engine.state.on('reset', () => content.audio.edge.reset())
