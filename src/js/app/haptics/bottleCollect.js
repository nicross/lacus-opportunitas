content.bottles.on('collect', () => {
  app.haptics.enqueue({
    duration: 100,
    startDelay: 100,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })

  app.haptics.enqueue({
    duration: 100,
    startDelay: 250,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })
})
