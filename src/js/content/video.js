content.video = (() => {
  let isLoaded = false

  return {
    draw: function () {
      this.sky.draw()
      this.stars.draw()
      this.sun.draw()
      this.planet.draw()
      this.surface.draw()
      this.grain.draw()

      return this
    },
    load: function () {
      if (isLoaded) {
        return this
      }

      this.grain.load()
      this.planet.load()
      this.sky.load()
      this.stars.load()
      this.sun.load()
      this.surface.load()

      return this
    },
    unload: function () {
      if (!isLoaded) {
        return this
      }

      this.grain.unload()
      this.planet.unload()
      this.sky.unload()
      this.stars.unload()
      this.sun.unload()
      this.surface.unload()

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.video.draw()
})

engine.state.on('import', () => content.video.load())
engine.state.on('reset', () => content.video.unload())
