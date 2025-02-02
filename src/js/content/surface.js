content.surface = (() => {
  const radius = 2500

  const noise1 = engine.fn.createNoise({
    octaves: 1,
    seed: ['surface', 'noise'],
    type: 'simplex3d',
  })

  return {
    load: function () {
      engine.ephemera
        .add(noise1)

      return this
    },
    unload: function () {
      engine.ephemera
        .remove(noise1)

      return this
    },
    value: function ({
      time = content.time.value(),
      x = 0,
      y = 0,
    } = {}) {
      const centerRatio = 1 - engine.fn.clamp(
        engine.fn.distance({x, y}) / radius
      )

      return noise1.value(
        x / 20 * engine.tool.simplex3d.prototype.skewFactor,
        y / 20 * engine.tool.simplex3d.prototype.skewFactor,
        time / 10 * engine.tool.simplex3d.prototype.skewFactor
      ) * 10 * centerRatio
    },
  }
})()

engine.state.on('import', () => content.surface.load())
engine.state.on('reset', () => content.surface.unload())
