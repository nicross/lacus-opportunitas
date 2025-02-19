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
    } = {}, noEdge = false) {
      const lakeRadius = content.lake.radius()
      let centerRatio = 1 - (engine.fn.distance({x, y}) / lakeRadius)

      if (centerRatio <= 0) {
        if (noEdge) {
          return 0
        }

        return engine.fn.clamp(
          engine.fn.scale(
            centerRatio,
            0, -(5 / lakeRadius),
            0, 1
          )
        ) * (content.camera.height() * 0.75)
      }

      centerRatio = (centerRatio ** 0.5) * engine.fn.clamp(engine.fn.scale(
        centerRatio,
        0, (100 / lakeRadius),
        0, 1
      ))

      const skewFactor = engine.tool.simplex3d.prototype.skewFactor

      const v1 = noise1.value(
        x / 10 * skewFactor,
        y / 10 * skewFactor,
        time / 5 * skewFactor
      ) * 0.5

      const v2 = noise2.value(
        ((x + (time * -5)) / 25) * skewFactor,
        y / 25 * skewFactor,
        time / 15 * skewFactor
      ) * 10

      const v3 = (noise3.value(
        ((x + (time * -10)) / 75) * skewFactor,
        y / 300 * skewFactor,
        time / 60 * skewFactor
      ) ** 5) * 50

      return v1 + (centerRatio * (v2 + v3))
    },
  }
})()

engine.state.on('import', () => content.surface.load())
engine.state.on('reset', () => content.surface.unload())
