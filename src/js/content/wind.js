content.wind = (() => {
  const directionField = engine.fn.createNoise({
    octaves: 8,
    seed: ['wind','direction'],
    type: '1d',
  })

  const velocityField = engine.fn.createNoise({
    octaves: 8,
    seed: ['wind','velocity'],
    type: '1d',
  })

  let direction = engine.const.tau / 2,
    velocity = 0

  return {
    direction: () => direction,
    load: function () {
      engine.ephemera
        .add(directionField)
        .add(velocityField)

      this.update()

      return this
    },
    unload: function () {
      engine.ephemera
        .remove(directionField)
        .remove(velocityField)

      return this
    },
    update: function () {
      const time = content.time.value()

      direction = (0.5 + engine.fn.lerp(-1/8, 1/8, directionField.value(time / 29))) * engine.const.tau
      velocity = velocityField.value(time / 31)

      return this
    },
    vector: function () {
      return engine.tool.vector2d.unitX()
        .rotate(direction)
        .scale(velocity)
    },
    velocity: () => velocity,
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.wind.update()
})

engine.state.on('import', () => content.wind.load())
engine.state.on('reset', () => content.wind.unload())
