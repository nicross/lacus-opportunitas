content.camera = (() => {
  const height = 2.5,
    lookMaxVelocity = engine.const.tau / 4,
    lookRange = engine.const.tau * 63/256

  let look = engine.const.zero,
    projectionMatrix = engine.tool.matrix4d.identity(),
    quaternion = engine.tool.quaternion.identity(),
    vector = engine.tool.vector3d.create()

  function updateProjectionMatrix() {
    // Calculate perspective
    const aspect = content.gl.aspect(),
      fov = content.gl.vfov()

    const far = content.gl.drawDistance() * 2,
      near = 0.1

    const top = near * Math.tan(fov / 2)
    const bottom = -top
    const right = top * aspect
    const left = -right

    // Calculate frustum from perspective
    const sx = 2 * near / (right - left),
      sy = 2 * near / (top - bottom)

    var c2 = -(far + near) / (far - near),
      c1 = 2 * near * far / (near - far)

    const tx = -near * (left + right) / (right - left),
      ty = -near * (bottom + top) / (top - bottom)

    const projection = engine.tool.matrix4d.create([
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, c2, -1,
      tx, ty, c1, 0,
    ])

    // Swapper (rotate from Z-up to Y-up)
    const swapper = engine.tool.matrix4d.create([
      0, 0, -1, 0,
      -1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 0, 1,
    ])

    // Camera rotation
    const rotation = engine.tool.matrix4d.fromQuaternion(
      quaternion.conjugate()
    ).transpose()

    // Putting it all together
    projectionMatrix = projection
      .multiply(swapper)
      .multiply(rotation)
  }

  return {
    applyLook: function (value) {
      const target = lookRange * Math.sign(value),
        velocity = lookMaxVelocity * Math.abs(value)

      look = engine.fn.accelerateValue(look, target, velocity)

      return this
    },
    projectionMatrix: () => projectionMatrix,
    quaternion: () => quaternion.clone(),
    reset: function () {
      // FIXME: When look is EXACTLY zero it causes issues with rotations?
      look = engine.const.zero
      projectionMatrix = engine.tool.matrix4d.identity()
      quaternion = engine.tool.quaternion.identity()
      vector = engine.tool.vector3d.create()

      return this
    },
    update: function () {
      vector = engine.position.getVector().add({
        z: height,
      })

      quaternion = engine.position.getQuaternion().multiply(
        engine.tool.quaternion.fromEuler({
          pitch: look,
        })
      )

      updateProjectionMatrix()

      return this
    },
    vector: () => vector.clone(),
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.camera.update()
})

engine.state.on('import', () => content.camera.update())
engine.state.on('reset', () => content.camera.reset())
