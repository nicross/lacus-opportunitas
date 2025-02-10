app.audio = (() => {
  const baseGain = engine.fn.fromDb(-12),
    bus = content.audio.channel.bypass.createBus()

  bus.gain.value = baseGain

  const delay = engine.effect.feedbackDelay({
    delay: 1/4,
    dry: 1,
    feedback: 1/2,
    wet: 1/2,
  })

  delay.output.connect(bus)

  let clickIndex = 0,
    clickSynth,
    ignoreFocus = false

  function killClickSynth() {
    if (!clickSynth) {
      return
    }

    const release = 1/2

    engine.fn.rampLinear(clickSynth.param.gain, 0, release)
    clickSynth.stop(engine.time(release))

    clickSynth = undefined
  }

  return {
    click: engine.fn.debounced(function (direction = 1) {
      if (!clickSynth) {
        clickIndex = clickIndex
          ? ((clickIndex % 5) + engine.fn.randomInt(1, 4)) % 5
          : engine.fn.randomInt(0, 4)
      } else {
        clickIndex = (clickIndex + (Math.sign(direction) || 1))
        clickIndex = clickIndex >= 0 ? (clickIndex % 10) : 10 + clickIndex
      }

      killClickSynth()

      const frequency = engine.fn.fromMidi(
        [60, 62, 64, 67, 69][clickIndex % 5]
      ) * (1 + Math.floor(clickIndex / 5))

      clickSynth = engine.synth.pwm({
        frequency,
        width: engine.fn.randomFloat(0.25, 0.75),
      }).filtered({
        frequency: 0,
      }).connect(delay.input)

      const attack = 1/32,
        decay = 1/16,
        now = engine.time(),
        release = 8

      clickSynth.filter.frequency.linearRampToValueAtTime(frequency, now + attack)
      clickSynth.filter.frequency.linearRampToValueAtTime(frequency * 0.5, now + decay)
      clickSynth.filter.frequency.linearRampToValueAtTime(0, now + release)
      clickSynth.param.gain.linearRampToValueAtTime(1, now + attack)
      clickSynth.param.gain.linearRampToValueAtTime(1/4, now + decay)
      clickSynth.param.gain.exponentialRampToValueAtTime(engine.const.zero, now + release)
      clickSynth.stop(engine.time(release))

      return this
    }),
    duck: function () {
      engine.fn.rampLinear(bus.gain, 0, 1/4)

      return this
    },
    focus: function ({
      enabled,
    }) {
      killClickSynth()

      const frequency = engine.fn.fromMidi(
        engine.fn.choose(enabled ? [36,38,40,43,45] : [24,26,28,31,33], Math.random())
      )

      const synth = engine.synth.pwm({
        frequency,
        gain: 1,
      }).filtered({
        frequency: frequency,
      }).connect(bus)

      const now = engine.time(),
        release = 1/32

      engine.fn.rampLinear(synth.param.gain, 0, release)
      synth.stop(now + release)

      return this
    },
    unavailable: function () {
      killClickSynth()

      const frequency = engine.fn.fromMidi(
        engine.fn.choose([36,38,40,43,45], Math.random())
      )

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
    unduck: function () {
      engine.fn.rampLinear(bus.gain, baseGain, 1/32)

      return this
    },
    value: function (value) {
      killClickSynth()

      const frequency = engine.fn.fromMidi(
        engine.fn.lerp(48, 72, value)
      )

      const synth = engine.synth.pwm({
        frequency,
        gain: 1,
        type: 'sawtooth',
      }).filtered({
        frequency: frequency * 2,
      }).chainAssign(
        'panner', engine.context().createStereoPanner(),
      ).connect(bus)

      synth.panner.pan.value = engine.fn.lerp(-0.5, 0.5, value)

      const now = engine.time(),
        release = 1/16

      engine.fn.rampLinear(synth.param.gain, 0, release)
      synth.stop(now + release)

      return this
    },
  }
})()

engine.loop.on('pause', () => app.audio.unduck())
engine.loop.on('resume', () => app.audio.duck())

// Clicking
engine.ready(() => {
  app.screenManager.on('enter', (e) =>  {
    if (['splash'].includes(e.currentState)) {
      return
    }

    app.audio.click()
  })
})

document.addEventListener('click', (e) => {
  if (e.target.matches('.c-toggle, .c-toggle *')) {
    const button = e.target.closest('.c-toggle').querySelector('.c-toggle--button')
    return app.audio.value(button.getAttribute('aria-checked') == 'true' ? 1 : 0)
  }

  const button = e.target.closest('button, [role="button"]') || e.target

  if (button.getAttribute('aria-disabled') == 'true') {
    return app.audio.unavailable()
  }

  app.audio.click()
})

// Focusing
document.addEventListener('focusin', (e) => {
  if (e.target.matches('.a-app--game *, .a-app--splash *')) {
    return
  }

  if (e.target.matches('.c-slider input')) {
    return app.audio.value(engine.fn.scale(e.target.value, e.target.min, e.target.max, 0, 1))
  }

  if (e.target.matches('.c-toggle, .c-toggle *')) {
    const button = e.target.closest('.c-toggle').querySelector('.c-toggle--button')
    return app.audio.value(button.getAttribute('aria-checked') == 'true' ? 1 : 0)
  }

  app.audio.focus({
    enabled: e.target.getAttribute('aria-disabled') != 'true',
  })
})

// Sliders
document.addEventListener('input', (e) => {
  if (!e.target.matches('.c-slider input')) {
    return
  }

  app.audio.value(engine.fn.scale(e.target.value, e.target.min, e.target.max, 0, 1))
})
