engine.loop.on('frame', ({
  delta,
  paused,
}) => {
  if (paused || content.movement.isJump()) {
    return
  }

  let value = content.movement.velocityValue()

  if (value < 0) {
    return
  }

  const stress = content.audio.acceleration.stressAccelerated()

  value *= Math.random()
  value **= engine.fn.lerp(2, 1, Math.max(stress, value))
  value *= engine.fn.lerp(1/100, 1/4, stress)

  app.haptics.enqueue({
    duration: delta * 1000,
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: value,
  })
})
