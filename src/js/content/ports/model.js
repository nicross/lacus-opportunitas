content.ports.model = {}

content.ports.model.instantiate = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.ports.model.prototype = {
  construct: function ({
    angle = 0,
    economy = '',
    index = 0,
    isDiscovered = false,
    luxuryGood = undefined,
    name = '',
  } = {}) {
    this.angle = angle
    this.economy = content.economies.get(economy)
    this.index = index
    this.isDiscovered = isDiscovered
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
      isDiscovered: this.isDiscovered,
      luxuryGood: this.luxuryGood,
      name: this.name,
    }
  },
  getDistance: function () {
    const value = engine.tool.vector3d.create(this)
      .subtract(engine.position.getVector())
      .zeroZ()
      .distance()

    return engine.fn.scale(value, 0, content.lake.radius() * 2, 0, 1)
  },
  getDot: function() {
    const value = engine.tool.vector3d.create(this)
      .subtract(engine.position.getVector())
      .zeroZ()
      .normalize()
      .dotProduct(engine.position.getQuaternion().forward())

    return engine.fn.scale(value, -1, 1, 0, 1)
  },
  getBuying: function () {
    const goods = this.economy.getBuying(),
      inventory = content.inventory.goods()

    for (const good of inventory) {
      if (good.id != this.luxuryGood && content.goods.luxury.isPrototypeOf(good)) {
        goods.push(good)
      }
    }

    goods.sort((a, b) => a.name.localeCompare(b.name))

    return goods
  },
  getSelling: function () {
    const goods = this.economy.getSelling()

    if (this.luxuryGood) {
      goods.push(
        content.goods.getLuxuryForPort(this.index)
      )

      console.log(content.goods.getLuxuryForPort(this.index))
    }

    goods.sort((a, b) => a.name.localeCompare(b.name))

    return goods
  },
}
