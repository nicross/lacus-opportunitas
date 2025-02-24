content.goods.base = {
  getBaseCost: function () {
    return this.baseCost * content.goods.priceMultiplier()
  },
  getBuyCost: function (port) {
    const srand = engine.fn.srand('port', port.index, 'buy', this.id)

    const noise = engine.fn.createNoise({
      octaves: Math.round(srand(1, 4)),
      seed: ['port', port.index, 'buy', this.id, 'noise'],
      type: '1d',
    })

    const exponent = srand(1, 2),
      rate = 1 / (60 * srand(15, 45)),
      time = content.time.value()

    const supply = noise.value(time * rate) ** exponent
    const bonus = port.getTransactionLevel(false)

    return Math.max(
      1,
      Math.round(
        (this.getBaseCost() - (2 ** bonus)) * engine.fn.lerp(1, 0.75, supply)
      ),
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
      rate = 1 / (60 * srand(15, 45)),
      time = content.time.value()

    const demand = noise.value(time * rate) ** exponent
    const bonus = port.getTransactionLevel(false)

    return Math.round(
      (this.getBaseCost() + (2 ** bonus)) * engine.fn.lerp(1, 1.5, demand)
    )
  },
}
