content.fn = {}

content.fn.throttled = (fn, timeout = 0) => {
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
