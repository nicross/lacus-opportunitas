content.bottles = (() => {
  const collectRadius = 10,
    maxCount = 3,
    maxDistance = 250,
    pubsub = engine.tool.pubsub.create()

  let count = 0,
    isSpawned = false,
    timer = 0,
    vector

  function generateReward() {
    // Methodology: Collecting all bottles in an excursion is equivalent to 1x the highest good you can afford
    // The reward can jump up to higher tiers within the same excursion
    const netWorth = content.credits.calculateNetWorth()

    const totalReward = content.goods.all().reduce((max, good) => {
      const cost = good.getBaseCost()

      return cost >= max && cost <= netWorth
        ? cost
        : max
    }, 10)

    // Always add up to total reward, rounding up the smaller amounts
    // TODO: Make dynamic to support different maxCount values
    return [
      Math.ceil(1/6 * totalReward),
      Math.ceil(1/3 * totalReward),
      totalReward - Math.ceil(1/6 * totalReward) - Math.ceil(1/3 * totalReward),
    ][count]
  }

  function generateTimer() {
    // Lake radius at maxCount
    // TODO: Make dynamic to support different maxCount values
    return (250 * count) + engine.fn.randomFloat(250, 500)
  }

  function generateVector() {
    if (content.movement.velocity().isZero()) {
      return
    }

    // Generate a random vector ahead of current velocity
    const vector = content.movement.velocity()
      .zeroZ()
      .normalize()
      .scale(maxDistance - 1)
      .rotateEuler({yaw: engine.const.tau * engine.fn.randomSign() * engine.fn.randomFloat(1/36, 1/16)})
      .add(engine.position.getVector().zeroZ())

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
    relativeVector: () => vector.subtract(engine.position.getVector()).rotateQuaternion(engine.position.getQuaternion().conjugate()),
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
            vector = undefined
          }
        }
      }

      // Update vector position
      if (isSpawned) {
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
      if (isSpawned && position.zeroZ().distance(vector.zeroZ()) <= collectRadius) {
        pubsub.emit('collect', generateReward())

        count += 1
        isSpawned = false
        timer = generateTimer()
        vector = undefined
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
