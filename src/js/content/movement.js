content.movement = (() => {
  const acceleration = 25,
    angularVelocity = engine.const.tau / 2,
    deceleration = 25,
    maxVelocity = 50

  let rawInput = {},
    turningSpeed = 1,
    velocity = engine.tool.vector2d.create()

  function calculateSpeedLimit() {
    const majorRadius = content.lake.radius() - 1,
      minorRadius = majorRadius - content.dock.radius()

    const position = engine.position.getVector()
    const distance = position.distance()

    if (distance < minorRadius) {
      return maxVelocity
    }

    // When facing away from center, scale max velocity by dot product with position (facing away from center is slower)
    const distanceRatio = engine.fn.clamp(engine.fn.scale(
      distance,
      minorRadius, majorRadius,
      1, 0
    ))

    const dot = engine.tool.vector2d.create(position)
      .normalize()
      .dotProduct(velocity.normalize())

    return maxVelocity * engine.fn.scale(
      dot,
      -1, 1,
      1, distanceRatio,
    )
  }

  return {
    calculateSpeedLimit,
    export: () => velocity.clone(),
    import: function (value) {
      velocity = engine.tool.vector2d.create(value)

      return this
    },
    maxVelocity: () => maxVelocity,
    rawInput: () => ({...rawInput}),
    reset: function () {
      velocity = engine.tool.vector2d.create()

      return this
    },
    setTurningSpeed: function (value) {
      turningSpeed = value

      return this
    },
    update: function (input = {}) {
      // Process input
      const {
        move,
        turn,
      } = input

      rawInput = {...input}

      const delta = engine.loop.delta(),
        position = engine.position.getVector()

      const isAccelerate = move > 0,
        isBrake = move < 0

      let {yaw} = engine.position.getEuler()

      // Calculate next yaw
      yaw += (turn * turningSpeed * angularVelocity * delta)
      yaw %= engine.const.tau

      // Apply next yaw
      engine.position.setEuler({
        yaw,
      })

      // Apply acceleration
      if (isAccelerate) {
        const thrust = engine.tool.vector2d.create({
          x: move * delta * acceleration,
        }).rotate(yaw)

        velocity = velocity.add(thrust)
      }

      // Apply brakes
      if (isBrake) {
        velocity = engine.tool.vector2d.create(
          engine.fn.accelerateVector(
            velocity,
            {x: 0, y: 0},
            deceleration,
          )
        )
      }

      // Enforce the speed limit
      const speedLimit = calculateSpeedLimit()
      let magnitude = velocity.distance()

      if (magnitude > speedLimit) {
        velocity = velocity.scale(speedLimit / magnitude)
        magnitude = speedLimit
      }

      // Apply extra turning force (proportional to dot product with target vector)
      if (isAccelerate) {
        const target = engine.tool.vector2d.unitX().scale(magnitude).rotate(yaw)

        const dot = engine.fn.scale(
          target.dotProduct(),
          -1, 1,
          0, 1
        )

        velocity = engine.tool.vector2d.create(
          engine.fn.accelerateVector(
            velocity,
            target,
            dot * acceleration,
          )
        )
      }

      // Calculate next velocity
      const next = position.add(
        velocity.scale(delta)
      )

      // Enforce boundary
      const lakeRadius = content.lake.radius() - 1
      const centerDistance = engine.fn.distance({x: next.x, y: next.y})

      if (centerDistance > lakeRadius) {
        const scalar = lakeRadius / centerDistance
        next.x *= scalar
        next.y *= scalar
      }

      // Glue to surface
      next.z = content.surface.value(next)

      engine.position.setVector(next)

      return this
    },
    velocity: () => velocity.clone(),
    velocityMax: () => maxVelocity,
    velocityValue: () => engine.fn.clamp(velocity.distance() / maxVelocity),
  }
})()

engine.state.on('export', (data) => data.movement = content.movement.export())
engine.state.on('import', ({movement}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())

engine.ready(() => {
  // XXX: Needed to support fast travel
  content.dock.on('change', () => content.movement.reset())

  content.dock.on('dock', () => content.movement.reset())
})
