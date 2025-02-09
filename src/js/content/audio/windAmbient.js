content.audio.windAmbient = (() => {
  const modDepthField = engine.fn.createNoise({
    octaves: 4,
    seed: ['windAmbient', 'modDepth'],
    type: '1d',
  })

  const modFrequencyField = engine.fn.createNoise({
    octaves: 4,
    seed: ['windAmbient', 'modFrequency'],
    type: '1d',
  })

  const playbackRateField = engine.fn.createNoise({
    octaves: 4,
    seed: ['windAmbient', 'playbackRate'],
    type: '1d',
  })

  let synth

  function calculateParameters() {
    const time = content.time.value(),
      velocity = content.wind.velocity()

    const modDepth = engine.fn.fromDb(engine.fn.lerp(-12, -6, modDepthField.value(time / 19)))

    return {
      carrierGain: 1 - modDepth,
      frequency: engine.fn.lerpExp(20000, 15000, velocity),
      gain: engine.fn.fromDb(-21) * engine.fn.fromDb(engine.fn.lerp(0, -6, velocity)),
      modDepth,
      modFrequency: 1 / engine.fn.lerp(8, 1, modFrequencyField.value(time / 17)),
      playbackRate: playbackRateField.value(time / 13),
      Q: engine.fn.lerpExp(1, 0.005, velocity, 2),
    }
  }

  function createSynth() {
    if (synth) {
      return
    }

    const bus = content.audio.channel.default.createBus()

    const {
      carrierGain,
      frequency,
      gain,
      modDepth,
      modFrequency,
      playbackRate,
      Q,
    } = calculateParameters()

    synth = engine.synth.amBuffer({
      buffer: content.audio.buffer.brownNoise.get(0),
      carrierGain,
      gain,
      modDepth,
      modFrequency,
      playbackRate,
    }).filtered({
      frequency,
      Q,
      type: 'bandpass',
    }).connect(bus)
  }

  function destroySynth() {
    if (!synth) {
      return
    }

    const release = 1/8

    engine.fn.rampLinear(synth.param.gain, engine.const.zeroGain, release)
    synth.stop(engine.time(release))
    synth = undefined
  }

  function updateSynth() {
    if (!synth) {
      return
    }

    const {
      carrierGain,
      frequency,
      gain,
      modDepth,
      modFrequency,
      playbackRate,
      Q,
    } = calculateParameters()

    engine.fn.setParam(synth.param.carrierGain, carrierGain)
    engine.fn.setParam(synth.filter.frequency, frequency)
    engine.fn.setParam(synth.param.gain, gain)
    engine.fn.setParam(synth.param.mod.depth, modDepth)
    engine.fn.setParam(synth.param.mod.frequency, modFrequency)
    engine.fn.setParam(synth.param.playbackRate, playbackRate)
    engine.fn.setParam(synth.filter.Q, Q)
  }

  return {
    load: function () {
      engine.ephemera
        .add(modDepthField)
        .add(modFrequencyField)
        .add(playbackRateField)

      createSynth()

      return this
    },
    unload: function () {
      engine.ephemera
        .remove(modDepthField)
        .remove(modFrequencyField)
        .remove(playbackRateField)

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

  content.audio.windAmbient.update()
})

engine.state.on('import', () => content.audio.windAmbient.load())
engine.state.on('reset', () => content.audio.windAmbient.unload())
