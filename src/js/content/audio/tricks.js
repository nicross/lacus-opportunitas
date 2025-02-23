content.audio.tricks = (() => {
  const bus = content.audio.channel.default.createBus()

  let delay = createDelay(),
    lastTrick,
    synth

  bus.gain.value = engine.fn.fromDb(-6)

  function createDelay() {
    const effect = engine.effect.pingPongDelay({
      delay: 0.5,
      dry: 1,
      feedback: engine.fn.fromDb(-3),
      wet: engine.fn.fromDb(-3),
    })

    effect.output.connect(bus)

    return effect
  }

  function getFrequency() {
    const input = content.tricks.rawInput(),
      run = content.tricks.run(),
      trick = content.tricks.trick()

    lastTrick = trick.type

    const typeOffsets = {
      trick1: 80,
      trick2: 40,
      trick3: 0,
    }

    const start = run.themeIndex + typeOffsets[trick.type] + run.themeIndexOffset

    const index = Math.floor(
      engine.fn.normalizeAngle(
        Math.atan2(input.trickY, input.trickX)
      ) / engine.const.tau * 5
    )

    return content.audio.theme.slice(start, start + 40)[index]
  }

  function killSynth(isSuccess = false) {
    if (!synth) {
      return
    }

    const now = engine.time(),
      release = isSuccess ? 1/32 : 1/8

    engine.fn.rampLinear(synth.param.detune, isSuccess ? 1200 : -1200, release/4)
    engine.fn.rampLinear(synth.param.gain, 0, release)
    synth.stop(now + release)

    synth = undefined
  }

  function triggerSynth() {
    const context = engine.context(),
      frequency = getFrequency()

    synth = engine.synth.simple({
      frequency,
      gain: engine.fn.fromDb(-6),
      type: 'sawtooth',
    }).chainAssign(
      'panner', context.createStereoPanner()
    ).filtered({
      detune: -600,
      frequency: frequency,
    }).connect(bus).connect(delay.input)

    synth.randomPan = engine.fn.randomFloat(-0.125, 0.125)
    synth.panner.pan.value = engine.fn.clamp(content.tricks.rawInput().trickX + synth.randomPan, -1, 1)

    const now = engine.time()

    synth.filter.detune.linearRampToValueAtTime(2400, now + 1/32)
    synth.filter.detune.linearRampToValueAtTime(-600, now + 1/2)
  }

  function updateSynth() {
    if (!synth) {
      return
    }

    const frequency = getFrequency()

    engine.fn.setParam(synth.panner.pan, engine.fn.clamp(content.tricks.rawInput().trickX + synth.randomPan, -1, 1))
    engine.fn.rampExp(synth.filter.frequency, frequency, 1/64)
    engine.fn.rampExp(synth.param.frequency, frequency, 1/64)
  }

  return {
    onEnterTrick: function () {
      triggerSynth()

      return this
    },
    onTrickFail: function () {
      killSynth()

      return this
    },
    onTrickSuccess: function () {
      killSynth(true)

      return this
    },
    reset: function () {
      lastTrick = undefined

      killSynth()

      if (delay) {
        delay.output.disconnect()
      }

      delay = createDelay()

      return this
    },
    update: function () {
      if (synth) {
        updateSynth()
      }

      return this
    },
  }
})()

engine.ready(() => {
  content.dock.on('change', () => content.audio.tricks.reset())
  content.dock.on('dock', () => content.audio.tricks.reset())
  content.tricks.on('end-run', () => content.audio.tricks.reset())

  content.tricks.on('enter-trick', () => content.audio.tricks.onEnterTrick())
  content.tricks.on('before-trick-fail', () => content.audio.tricks.onTrickFail())
  content.tricks.on('before-trick-success', () => content.audio.tricks.onTrickSuccess())
})

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.tricks.update()
})

engine.loop.on('reset', () => content.audio.tricks.reset())
