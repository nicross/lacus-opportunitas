content.goods.base = {
  getBuyCost: function (port) {
    const srand = engine.fn.srand('port', port.index, 'buy', this.id)

    const noise = engine.fn.createNoise({
      octaves: Math.round(srand(1, 4)),
      seed: ['port', port.index, 'buy', this.id, 'noise'],
      type: '1d',
    })

    const exponent = srand(1, 2),
      multiplier = content.goods.priceMultiplier(),
      rate = 1 / (60 * srand(15, 45)),
      time = content.time.value()

    const supply = noise.value(time * rate) ** exponent

    return Math.round(
      this.baseCost * multiplier * engine.fn.lerp(1, 0.5, supply)
    )
  },
  getSellCost: function (port) {
    const srand = engine.fn.srand('port', port.index, 'sell', this.id)

    const noise = engine.fn.createNoise({
      octaves: Math.round(srand(1, 4)),
      seed: ['port', port.index, 'sell', this.id, 'noise'],
      type: '1d',
    })

    const exponent = srand(1, 2),
      multiplier = content.goods.priceMultiplier(),
      rate = 1 / (60 * srand(15, 45)),
      time = content.time.value()

    const demand = noise.value(time * rate) ** exponent

    return Math.round(
      this.baseCost * multiplier * engine.fn.lerp(1, 2, demand)
    )
  },
}
