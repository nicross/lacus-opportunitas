content.audio.target = (() => {
  const bus = content.audio.channel.default.createBus()

  function play({
    color,
    duration,
    frequency,
    gain,
    when,
    width,
  }) {
    const synth = engine.synth.pwm({
      gain,
      frequency,
      type: 'square',
      when,
      width,
    }).filtered({
      frequency: frequency * color,
    }).connect(bus)

    synth.param.gain.linearRampToValueAtTime(0, when + duration)
    synth.stop(when + duration)
  }

  return {
    onSet: function () {
      const port = content.ports.target.get()
      const frequencies = engine.fn.shuffle(port.triadFrequencies)

      for (const i in frequencies) {
        play({
          color: 4,
          duration: 1/16,
          gain: engine.fn.fromDb(engine.fn.lerp(-7.5, -13.5, port.rootRatio)),
          frequency: frequencies[i],
          when: engine.time() + (i * 1/32),
          width: 0.5,
        })
      }

      return this
    },
    onUnset: function () {
      const port = content.ports.target.get()
      const frequencies = [...port.triadFrequencies].reverse()

      for (const i in frequencies) {
        play({
          color: 4,
          duration: 1/64,
          gain: engine.fn.fromDb(engine.fn.lerp(-7.5, -13.5, port.rootRatio)),
          frequency: frequencies[i],
          when: engine.time() + (i * 1/64),
          width: 0.25,
        })
      }

      return this
    },
  }
})()

engine.ready(() => {
  content.ports.target.on('set', () => content.audio.target.onSet())
  content.ports.target.on('unset', () => content.audio.target.onUnset())
})
