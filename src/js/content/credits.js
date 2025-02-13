content.credits = (() => {
  let credits = 0

  return {
    adjust: function (value) {
      credits += Math.max(value, -credits)

      return this
    },
    calculateNetWorth: () => credits + content.inventory.goods().reduce((sum, good) => sum + good.getBaseCost() * content.inventory.get(good.id), 0),
    has: (value) => value <= credits,
    import: function (value) {
      credits = value || 0

      return this
    },
    reset: function () {
      credits = 0

      return this
    },
    value: () => credits,
  }
})()

engine.ready(() => {
  content.bottles.on('collect', (reward) => content.credits.adjust(reward))
})

engine.state.on('export', (data) => data.credits = content.credits.value())
engine.state.on('import', ({credits}) => content.credits.import(credits))
engine.state.on('reset', () => content.credits.reset())
