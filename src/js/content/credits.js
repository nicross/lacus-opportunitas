content.credits = (() => {
  let credits = 0

  return {
    adjust: function (value) {
      credits += Math.max(Number(value) || 0, -credits)

      return this
    },
    has: (value) => value <= credits,
    import: function (value) {
      credits = Number(value) || 0

      return this
    },
    reset: function () {
      credits = 0

      return this
    },
    value: () => credits,
  }
})()

engine.state.on('export', (data) => data.credits = content.credits.value())
engine.state.on('import', ({credits}) => content.credits.import(credits))
engine.state.on('reset', () => content.credits.reset())
