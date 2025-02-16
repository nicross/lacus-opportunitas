content.audio.dock = (() => {
  const bus = content.audio.channel.bypass.createBus(),
    synths = []

  return {
    load: function () {
      const port = content.dock.getPort()

      for (let i = 0; i < 3; i += 1) {
        synths.push(
          this.synth.create({
            bus,
            index: i,
            port,
          })
        )
      }

      return this
    },
    unload: function (release) {
      for (const synth of synths) {
        synth.destroy(release)
      }

      synths.length = 0

      return this
    },
  }
})()

content.dock.on('change', () => content.audio.dock.unload(2).load())
content.dock.on('dock', () => content.audio.dock.load())
content.dock.on('undock', () => content.audio.dock.unload(4))

engine.state.on('import', ({dock}) => {
  if (dock) {
    engine.loop.once('frame', () => {
      content.audio.dock.load()
    })
  }
})

engine.state.on('reset', () => content.audio.dock.unload(1/8))
