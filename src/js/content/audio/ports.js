content.audio.ports = (() => {
  const bus = content.audio.channel.default.createBus(),
    synths = []

  return {
    load: function () {
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
      for (const synth of synths) {
        synth.destroy()
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

engine.state.on('import', ({dock}) => {
  if (!dock) {
    content.audio.ports.load()
  }
})

content.dock.on('dock', () => content.audio.ports.unload())
content.dock.on('undock', () => content.audio.ports.load())
engine.state.on('reset', () => content.audio.ports.unload())
