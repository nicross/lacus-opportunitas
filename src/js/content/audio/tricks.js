content.audio.tricks = (() => {
  const bus = content.audio.channel.default.createBus(),
    delays = {}

  let lastTrick,
    synth

  bus.gain.value = engine.fn.fromDb(-6)

  swapDelays()

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
        Math.atan2(input.trickY, -input.trickX)
      ) / engine.const.tau * 5
    )

    return content.audio.theme.slice(start, start + 40)[(index + run[trick.type].count) % 40]
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

  function swapDelays() {
    const types = [
      ['trick1', 0.333],
      ['trick2', 0.5],
      ['trick3', 0.75],
    ]

    for (const [type, delay] of types) {
      if (delays[type]) {
        const previous = delays[type]
        engine.fn.rampLinear(previous.param.gain, 0, 1/16)
        setTimeout(125, () => previous.output.disconnect())
      }

      delays[type] = engine.effect.pingPongDelay({
        delay,
        dry: 1,
        feedback: engine.fn.fromDb(-1.5),
        wet: engine.fn.fromDb(-1.5),
      })

      delays[type].output.connect(bus)
    }
  }

  function triggerSynth() {
    const context = engine.context(),
      frequency = getFrequency(),
      trick = content.tricks.trick()

    synth = engine.synth.simple({
      frequency,
      gain: engine.fn.fromDb(-6),
      type: 'sawtooth',
    }).chainAssign(
      'panner', context.createStereoPanner()
    ).filtered({
      detune: -600,
      frequency: frequency,
    }).connect(bus).connect(delays[trick.type].input)

    synth.randomPan = engine.fn.randomFloat(-0.125, 0.125)
    synth.panner.pan.value = engine.fn.clamp(-content.tricks.rawInput().trickX + synth.randomPan, -1, 1)

    const now = engine.time()

    synth.filter.detune.linearRampToValueAtTime(2400, now + 1/32)
    synth.filter.detune.linearRampToValueAtTime(-600, now + 1/2)
  }

  function updateSynth() {
    if (!synth) {
      return
    }

    const frequency = getFrequency()

    engine.fn.setParam(synth.panner.pan, engine.fn.clamp(-content.tricks.rawInput().trickX + synth.randomPan, -1, 1))
    engine.fn.rampExp(synth.filter.frequency, frequency, 1/64)
    engine.fn.rampExp(synth.param.frequency, frequency, 1/64)
  }

  return {
    onDisallowed: function () {
      const frequency = engine.fn.fromMidi(36)

      const synth = engine.synth.pwm({
        frequency,
        gain: 1,
        type: 'sawtooth',
      }).filtered({
        frequency: frequency * 8,
      }).connect(bus)

      const now = engine.time(),
        release = 1/32

      engine.fn.rampLinear(synth.param.gain, 0, release)
      synth.stop(now + release)

      return this
    },
    onEnterTrick: function () {
      killSynth()
      triggerSynth()

      return this
    },
    onTrickFail: function () {
      killSynth()
      swapDelays()

      return this
    },
    onTrickSuccess: function () {
      killSynth(true)

      return this
    },
    reset: function () {
      lastTrick = undefined

      killSynth()
      swapDelays()

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

  content.tricks.on('disallowed', () => content.audio.tricks.onDisallowed())
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
