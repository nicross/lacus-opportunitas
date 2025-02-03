app.fn = {}

app.fn.generateSeed = () => [
  engine.fn.randomInt(16**3, 16**4 - 1).toString(16),
  engine.fn.randomInt(16**3, 16**4 - 1).toString(16),
].join('-').toUpperCase()
