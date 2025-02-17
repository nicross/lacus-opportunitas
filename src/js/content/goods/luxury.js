content.goods.luxury = engine.fn.extend(content.goods.base, {
  getBaseCost: function () {
    return this.getBaseCostRaw() * content.goods.priceMultiplier()
  },
  getBaseCostRaw: function () {
    return 6 ** engine.fn.srand('luxury', this.port, 'basePrice')(4, 5)
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

    // Up to 6^6 at optimal conditions
    const inflated = base * (6 ** (distance / 1000 / 2.5))

    return Math.round(
      (inflated * content.goods.priceMultiplier()) + (2 ** bonus)
    )
  },
})
