content.audio.ports = (() => {
  const synths = []
  let bus

  return {
    load: function () {
      bus = content.audio.channel.default.createBus()

      for (const port of content.ports.all()) {
        synths.push(
          this.synth.create({
            bus,
            port,
          })
        )
      }

      return this
    },
    unload: function () {
      if (bus) {
        bus.disconnect()
        bus = undefined
      }

      for (const synth of synths) {
        synth.update()
      }

      synths.length = 0

      return this
    },
    update: function () {
      for (const synth of synths) {
        synth.update()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.ports.update()
})

engine.state.on('import', () => content.audio.ports.load())
engine.state.on('reset', () => content.audio.ports.unload())
