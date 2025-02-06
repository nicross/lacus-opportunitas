content.goods.luxury = engine.fn.extend(content.goods.base, {
  getBasePrice: function () {
    return engine.fn.srand('luxury', this.port, 'basePrice')(256, 768)
  },
  getBuyCost: function () {
    const basePrice = this.getBasePrice(),
      multiplier = content.goods.priceMultiplier()

    return Math.round(basePrice * multiplier)
  },
  getPort: function () {
    return content.ports.get(this.port)
  },
  getSellCost: function (port) {
    const basePrice = this.getBasePrice(),
      distance = engine.fn.distance(port, this.getPort()),
      multiplier = content.goods.priceMultiplier()

    return Math.round(basePrice * multiplier * (1 + (distance / 1000)))
  },
})
