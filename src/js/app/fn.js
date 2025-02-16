app.fn = {}

app.fn.generateSeed = () => [
  engine.fn.randomInt(16**3, 16**4 - 1).toString(16),
  engine.fn.randomInt(16**3, 16**4 - 1).toString(16),
].join('-').toUpperCase()

app.fn.throttled = (fn, timeout = 0) => {
  let throttle = 0

  return (...args) => {
    const now = performance.now()

    if (throttle > now) {
      return
    }

    fn(...args)
    throttle = now + timeout
  }
}
