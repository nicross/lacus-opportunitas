content.goods.luxury = engine.fn.extend(content.goods.base, {
  getBaseCost: function () {
    return this.getBaseCostRaw() * content.goods.priceMultiplier()
  },
  getBaseCostRaw: function () {
    const power = {
      0: 4,
      1: 5,
      2: 3,
    }[
      Math.floor(this.port / 5)
    ]

    return 8 ** engine.fn.srand('luxury', this.port, 'basePrice')(power, power + 1)
  },
  getBuyCost: function (port) {
    const bonus = port.getTransactionLevel(false)

    return Math.max(
      1,
      Math.round(
        this.getBaseCost() - (2 ** bonus)
      ),
    )
  },
  getPort: function () {
    return content.ports.get(this.port)
  },
  getSellCost: function (port) {
    const base = this.getBaseCostRaw(),
      bonus = port.getTransactionLevel(false),
      distance = engine.fn.distance(port, this.getPort())

    // Up to 100% profit at optimal conditions
    const inflated = base * engine.fn.lerpExp(1, 2, engine.fn.clamp(
      distance / 1000 / 2.5
    ), 0.5)

    return Math.round(
      (inflated * content.goods.priceMultiplier()) + (2 ** bonus)
    )
  },
})
