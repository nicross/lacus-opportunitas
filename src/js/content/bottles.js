content.bottles = (() => {
  const collectRadius = 5,
    maxCount = 3,
    maxDistance = 250,
    pubsub = engine.tool.pubsub.create()

  let count = 0,
    isSpawned = false,
    timer = 0,
    vector

  function generateReward() {
    // Methodology: Collecting all bottles in an excursion is equivalent to trading an extra of the highest good in your inventory
    const totalReward = content.inventory.goods().reduce((max, good) => Math.max(max, good.getBaseCost()), 10)

    return [
      Math.ceil(1/6 * totalReward),
      Math.ceil(1/3 * totalReward),
      totalReward - Math.ceil(1/6 * totalReward) - Math.ceil(1/3 * totalReward),
    ][count]
  }

  function generateTimer() {
    return engine.fn.randomFloat(125, 375)
  }

  function generateVector() {
    // Generate a random vector ahead of current velocity
    const vector = engine.tool.vector3d.create(
      content.movement.velocity()
        .normalize()
        .scale(maxDistance - 1)
        .rotate(engine.const.tau * engine.fn.randomFloat(-1/8, 1/8))
    )

    if (vector.distance() >= content.lake.radius() - content.dock.radius()) {
      return
    }

    vector.z = content.surface.value(vector)

    return vector
  }

  function resetExcursion() {
    count = 0
    isSpawned = false
    timer = 0
    vector = undefined
  }

  return pubsub.decorate({
    export: () => content.dock.is() ? undefined : count,
    import: function ({bottles, dock}) {
      if (dock) {
        return this
      }

      count = bottles || 0
      timer = generateTimer()

      return this
    },
    isSpawned: () => isSpawned,
    onDock: function () {
      resetExcursion()

      return this
    },
    onUndock: function () {
      timer = generateTimer()

      return this
    },
    reset: function () {
      resetExcursion()

      return this
    },
    update: function () {
      if (content.dock.is()) {
        return this
      }

      const position = engine.position.getVector()
      const distance = position.distance(vector)

      // Handle the spawn timer
      if (!isSpawned && count < maxCount) {
        // Count down with distance traveled
        timer = engine.fn.accelerateValue(timer, 0, content.movement.velocity().distance())

        // Try to generate a vector to spawn, otherwise try again later
        if (!timer) {
          const nextVector = generateVector()

          if (nextVector) {
            isSpawned = true
            vector = nextVector
          } else {
            timer = 1
          }
        }
      }

      // Update vector position
      if (vector) {
        if (position.distance(vector) < maxDistance) {
          // Glue to surface when within range
          vector.z = content.surface.value(vector)
        } else {
          // Try to generate a new vector, otherwise despawn and try again
          const nextVector = generateVector()

          if (nextVector) {
            vector = nextVector
          } else {
            timer = 1
            isSpawned = false
            vector = undefined
          }
        }
      }

      // Handle collection
      if (isSpawned && position.distance(vector) <= collectRadius) {
        pubsub.emit('collect', generateReward())

        count += 1
        isSpawned = false
        timer = generateTimer()
      }


      return this
    },
    vector: () => vector,
  })
})()

engine.ready(() => {
  // XXX: Needed to support fast travel
  content.dock.on('change', () => content.bottles.onDock())

  content.dock.on('dock', () => content.bottles.onDock())
  content.dock.on('undock', () => content.bottles.onUndock())
})

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.bottles.update()
})

engine.state.on('export', (data) => data.bottles = content.bottles.export())
engine.state.on('import', (data) => content.bottles.import(data))
engine.state.on('reset', () => content.bottles.reset())
