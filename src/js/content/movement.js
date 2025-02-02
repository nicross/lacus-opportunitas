content.movement = (() => {
  const acceleration = 5,
    angularVelocity = engine.const.tau / 4,
    deceleration = 5,
    maxVelocity = 25

  let rawInput = {},
    turningSpeed = 1,
    velocity = engine.tool.vector2d.create()

  return {
    export: () => velocity.clone(),
    import: function (value) {
      velocity = engine.tool.vector2d.create(value)

      return this
    },
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
      let magnitude = velocity.distance()

      if (magnitude > maxVelocity) {
        velocity = velocity.scale(maxVelocity / magnitude)
        magnitude = maxVelocity
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

      // Apply next velocity, gluing to surface
      const next = position.add(
        velocity.scale(delta)
      )

      next.z = content.surface.value(position)

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
