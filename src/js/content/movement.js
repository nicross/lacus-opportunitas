content.movement = (() => {
  const acceleration = 25,
    angularVelocity = engine.const.tau / 2,
    deceleration = 25,
    maxVelocity = 50,
    pubsub = engine.tool.pubsub.create()

  let isJump = false,
    previousPosition = engine.tool.vector3d.create(),
    rawInput = {},
    surfaceLaunchVelocity = 0,
    turningSpeed = 1,
    velocity = engine.tool.vector3d.create()

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

  function handleJump() {
    const delta = engine.loop.delta(),
      gravity = 7.5,
      position = engine.position.getVector()

    // Calculate next position
    velocity.z -= gravity * delta

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

    // Handle transitions to
    const surface = content.surface.value(next),
      velocityZ = velocity.z

    if (next.z <= surface) {
      isJump = false
      next.z = surface
      velocity.z = 0
    }

    previousPosition = position
    engine.position.setVector(next)

    if (!isJump) {
      pubsub.emit('surface', engine.fn.clamp(-velocityZ / gravity))
    }
  }

  function handleSurface(move) {
    const delta = engine.loop.delta(),
      isAccelerate = move > 0,
      isBrake = move < 0,
      position = engine.position.getVector()

    const {yaw} = engine.position.getEuler()

    // Apply acceleration
    if (isAccelerate) {
      const thrust = engine.tool.vector2d.create({
        x: move * delta * acceleration,
      }).rotate(yaw)

      velocity = velocity.add(thrust)
    }

    // Apply brakes
    if (isBrake) {
      velocity = engine.tool.vector3d.create(
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

      velocity = engine.tool.vector3d.create(
        engine.fn.accelerateVector(
          velocity,
          target,
          dot * acceleration,
        )
      )
    }

    // Calculate next position
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

    // Handle jumps (emit event at end)
    // There is probably a more elegant way to handle this
    // Essentially the launch velocity is a value that gets accelerated based on the slope of the terrain
    next.z = content.surface.value(next)

    const nextLaunchVelocity = magnitude
      * Math.max(0, (position.z - previousPosition.z) / previousPosition.zeroZ().distance(position.zeroZ()) || 0)

    if (!isAccelerate && !isBrake && magnitude/maxVelocity > 0.5 && nextLaunchVelocity/surfaceLaunchVelocity < 0.5) {
      isJump = true
      next.z = position.z
      velocity.z = surfaceLaunchVelocity
      surfaceLaunchVelocity = 0
    }

    // Otherwise glue to surface
    surfaceLaunchVelocity = engine.fn.accelerateValue(surfaceLaunchVelocity, nextLaunchVelocity, magnitude * 0.5)
    previousPosition = position
    engine.position.setVector(next)

    if (isJump) {
      pubsub.emit('jump')
    }
  }

  function handleTurn(turn) {
    const delta = engine.loop.delta()

    let {yaw} = engine.position.getEuler()

    // Calculate next yaw
    yaw += (turn * turningSpeed * angularVelocity * delta)
    yaw %= engine.const.tau

    // Apply next yaw
    engine.position.setEuler({
      yaw,
    })
  }

  return pubsub.decorate({
    calculateSpeedLimit,
    export: () => velocity.clone(),
    import: function (value) {
      previousPosition = engine.position.getVector()
      velocity = engine.tool.vector3d.create(value)

      return this
    },
    isJump: () => isJump,
    maxVelocity: () => maxVelocity,
    rawInput: () => ({...rawInput}),
    reset: function () {
      isJump = false
      previousPosition = engine.tool.vector3d.create()
      surfaceLaunchVelocity = 0
      velocity = engine.tool.vector3d.create()

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

      handleTurn(turn)

      if (isJump) {
        handleJump()
      } else {
        handleSurface(move)
      }

      return this
    },
    velocity: () => velocity.clone(),
    velocityMax: () => maxVelocity,
    velocityValue: () => engine.fn.clamp(velocity.zeroZ().distance() / maxVelocity),
  })
})()

engine.state.on('export', (data) => data.movement = content.movement.export())
engine.state.on('import', ({movement}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())

engine.ready(() => {
  // XXX: Needed to support fast travel
  content.dock.on('change', () => content.movement.reset())

  content.dock.on('dock', () => content.movement.reset())
})
