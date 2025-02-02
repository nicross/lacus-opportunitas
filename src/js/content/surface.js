content.surface = (() => {
  const radius = 2500

  const noise1 = engine.fn.createNoise({
    octaves: 1,
    seed: ['surface', 'noise1'],
    type: 'simplex3d',
  })

  const noise2 = engine.fn.createNoise({
    octaves: 1,
    seed: ['surface', 'noise2'],
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

      const v1 = noise1.value(
        x / 25 * engine.tool.simplex3d.prototype.skewFactor,
        y / 25 * engine.tool.simplex3d.prototype.skewFactor,
        time / 15 * engine.tool.simplex3d.prototype.skewFactor
      ) * 10

      const v2 = (noise2.value(
        ((x + (time * -10)) / 100) * engine.tool.simplex3d.prototype.skewFactor,
        y / 500 * engine.tool.simplex3d.prototype.skewFactor,
        time / 60 * engine.tool.simplex3d.prototype.skewFactor
      ) ** 4) * 40

      return centerRatio * (
          v1
        + v2
      )
    },
  }
})()

engine.state.on('import', () => content.surface.load())
engine.state.on('reset', () => content.surface.unload())
