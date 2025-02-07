content.goods.luxury = engine.fn.extend(content.goods.base, {
  getBaseCost: function () {
    return engine.fn.srand('luxury', this.port, 'basePrice')(256, 768) * content.goods.priceMultiplier()
  },
  getBuyCost: function () {
    return Math.round(this.getBaseCost())
  },
  getPort: function () {
    return content.ports.get(this.port)
  },
  getSellCost: function (port) {
    const base = this.getBaseCost(),
      distance = engine.fn.distance(port, this.getPort())

    return Math.round(base * (1 + (distance / 1000)))
  },
})
