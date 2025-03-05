content.audio.facing = (() => {
  const bus = content.audio.channel.default.createBus()

  let previous

  function play(port) {
    const noteRatio = engine.fn.clamp(engine.fn.scale(
      port.rootNote,
      52, 86,
      0, 1,
    ))

    const synth = engine.synth.pwm({
      gain: engine.fn.fromDb(engine.fn.lerp(-7.5, -13.5, noteRatio)),
      frequency: port.rootFrequency,
      width: 0.75,
    }).filtered({
      frequency: port.rootFrequency * engine.fn.lerp(4, 2, noteRatio),
    }).connect(bus)

    const now = engine.time(),
      release = 1/32

    synth.param.gain.linearRampToValueAtTime(0, now + release)
    synth.stop(now + release)
  }

  return {
    load: function () {
      previous = content.ports.facing(1/32)

      return this
    },
    unload: function () {
      previous = undefined

      return this
    },
    update: function () {
      const facing = !content.dock.is()
        ? content.ports.facing(1/32)
        : undefined

      if (facing && previous !== facing) {
        play(facing)
      }

      previous = facing

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.facing.update()
})

engine.loop.on('pause', () => content.audio.facing.unload())
engine.loop.on('resume', () => content.audio.facing.load())
