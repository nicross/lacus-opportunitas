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
    const discount = 1 - (0.05 * port.getTransactionLevel(true))

    return Math.max(
      1,
      Math.round(
        this.getBaseCost() * engine.fn.lerp(1, 0.75, supply) * discount
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
    const bonus = engine.fn.scale(Math.log(this.baseCost) / Math.log(8), 0, 6, 2, 1.125) ** port.getTransactionLevel(true)

    return Math.round(
      this.getBaseCost() * engine.fn.lerp(1, 1.5, demand) * bonus
    )
  },
}
