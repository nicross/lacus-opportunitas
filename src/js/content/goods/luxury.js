content.goods.luxury = engine.fn.extend(content.goods.base, {
  getBaseCost: function () {
    return this.getBaseCostRaw() * content.goods.priceMultiplier()
  },
  getBaseCostRaw: function () {
    const origin = this.getPort()

    const power = {
      0: 5,
      1: 6,
      2: 4,
    }[
      Math.floor(origin.index / 5) % 3
    ]

    return 8 ** engine.fn.srand('luxury', this.port, 'basePrice')(power, power + 1)
  },
  getBuyCost: function (port) {
    const origin = this.getPort()

    const discount = 1 - (0.05 * origin.getTransactionLevel(true))

    return Math.max(
      1,
      Math.round(
        this.getBaseCost() * discount
      ),
    )
  },
  getPort: function () {
    return content.ports.get(this.port)
  },
  getSellCost: function (port) {
    const origin = this.getPort()

    const base = this.getBaseCostRaw(),
      bonus = engine.fn.scale(Math.log(base) / Math.log(8), 6, 4, 1.375, 1.125) ** origin.getTransactionLevel(true),
      distance = engine.fn.distance(port, origin)

    // Up to 100% profit at optimal conditions
    const inflated = base * engine.fn.lerpExp(1, 2, engine.fn.clamp(
      distance / 1000 / 2.5
    ), 0.5)

    return Math.round(
      inflated * content.goods.priceMultiplier() * bonus
    )
  },
})
