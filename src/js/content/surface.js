content.surface = (() => {
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

  const noise3 = engine.fn.createNoise({
    octaves: 1,
    seed: ['surface', 'noise2'],
    type: 'simplex3d',
  })

  return {
    load: function () {
      engine.ephemera
        .add(noise1)
        .add(noise2)
        .add(noise3)

      return this
    },
    unload: function () {
      engine.ephemera
        .remove(noise1)
        .remove(noise2)
        .remove(noise3)

      return this
    },
    value: function ({
      time = content.time.value(),
      x = 0,
      y = 0,
    } = {}) {
      const lakeRadius = content.lake.radius()
      const centerRatio = 1 - (engine.fn.distance({x, y}) / lakeRadius)

      if (centerRatio <= 0) {
        return engine.fn.clamp(
          engine.fn.scale(
            centerRatio,
            0, -(5 / lakeRadius),
            0, 1
          )
        ) * (content.camera.height() * 0.75)
      }

      const v1 = noise1.value(
        x / 10 * engine.tool.simplex3d.prototype.skewFactor,
        y / 10 * engine.tool.simplex3d.prototype.skewFactor,
        time / 5 * engine.tool.simplex3d.prototype.skewFactor
      ) * 0.5

      const v2 = noise2.value(
        x / 25 * engine.tool.simplex3d.prototype.skewFactor,
        y / 25 * engine.tool.simplex3d.prototype.skewFactor,
        time / 15 * engine.tool.simplex3d.prototype.skewFactor
      ) * 10

      const v3 = (noise3.value(
        ((x + (time * -10)) / 100) * engine.tool.simplex3d.prototype.skewFactor,
        y / 500 * engine.tool.simplex3d.prototype.skewFactor,
        time / 60 * engine.tool.simplex3d.prototype.skewFactor
      ) ** 4) * 40

      return (v1 * (centerRatio ** 0.0625)) + (centerRatio * (v2 + v3))
    },
  }
})()

engine.state.on('import', () => content.surface.load())
engine.state.on('reset', () => content.surface.unload())
