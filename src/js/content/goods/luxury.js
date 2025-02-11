content.goods.luxury = engine.fn.extend(content.goods.base, {
  getBaseCost: function () {
    return this.getBaseCostRaw() * content.goods.priceMultiplier()
  },
  getBaseCostRaw: function () {
    return 8 ** engine.fn.srand('luxury', this.port, 'basePrice')(3, 4)
  },
  getBuyCost: function () {
    return Math.round(this.getBaseCost())
  },
  getPort: function () {
    return content.ports.get(this.port)
  },
  getSellCost: function (port) {
    const base = this.getBaseCostRaw(),
      distance = engine.fn.distance(port, this.getPort())

    // Up to 8^7 at optimal conditions
    const inflated = base * (8 ** (0.5 + (distance / 1000 / 2)))

    return Math.round(inflated * content.goods.priceMultiplier())
  },
})
