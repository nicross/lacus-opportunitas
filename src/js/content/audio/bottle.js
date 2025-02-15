content.audio.bottle = (() => {
  const bus = content.audio.channel.default.createBus()

  let synth

  return {
    reset: function () {
      if (synth) {
        synth.destroy()
        synth = undefined
      }

      return this
    },
    update: function () {
      if (content.bottles.isSpawned()) {
        if (!synth) {
          synth = this.synth.create({
            bus,
          })
        } else {
          synth.update()
        }
      } else if (synth) {
        synth.destroy()
        synth = undefined
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.bottle.update()
})

content.dock.on('change', () => content.audio.bottle.reset())
content.dock.on('dock', () => content.audio.bottle.reset())
engine.state.on('reset', () => content.audio.bottle.reset())
