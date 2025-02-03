content.ports.model = {}

content.ports.model.instantiate = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.ports.model.prototype = {
  construct: function ({
    angle = 0,
    behavior = 0,
    economy = '',
    index = 0,
    luxuryGood = undefined,
    name = '',
  } = {}) {
    this.angle = angle
    this.behavior = behavior
    this.economy = content.economies.get(economy)
    this.index = index
    this.luxuryGood = luxuryGood
    this.name = name
    this.x = Math.cos(angle) * content.lake.radius()
    this.y = Math.sin(angle) * content.lake.radius()

    return this
  },
  export: function () {
    return {
      angle: this.angle,
      economy: this.economy.id,
      index: this.index,
      luxuryGood: this.luxuryGood,
      name: this.name,
    }
  },
  getSelling: function () {
    const goods = this.economy.sells.map(
      (id) => content.goods.get(id)
    )

    if (this.luxuryGood) {
      goods.push(
        content.goods.getLuxuryForPort(this.index)
      )
    }

    goods.sort((a, b) => a.name.localeCompare(b.name))

    return goods
  },
}
