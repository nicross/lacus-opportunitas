content.movement.on('surface', (strength) => {
  app.haptics.enqueue({
    duration: 125,
    startDelay: 0,
    strongMagnitude: strength,
    weakMagnitude: strength ** 0.5,
  })

  for (let i = 1; i < 3; i += 1) {
    app.haptics.enqueue({
      duration: engine.fn.lerpRandom([50, 75], [100, 125], strength),
      startDelay: i * 125,
      strongMagnitude: strength * Math.random(),
      weakMagnitude: strength * Math.random(),
    })
  }
})
