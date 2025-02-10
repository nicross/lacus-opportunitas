content.audio.facing = (() => {
  const bus = content.audio.channel.default.createBus()

  let previous

  function play(port) {
    const synth = engine.synth.pwm({
      gain: engine.fn.fromDb(-12),
      frequency: port.rootFrequency,
      width: 0.75,
    }).filtered({
      frequency: port.rootFrequency * 2,
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
      const facing = content.ports.facing(1/32)

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
