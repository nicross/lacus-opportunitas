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
    name = '',
  } = {}) {
    this.angle = angle
    this.behavior = behavior
    this.economy = content.economies.get(economy)
    this.index = index
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
      name: this.name,
    }
  },
}
