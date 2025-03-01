content.goods = (() => {
  const luxuries = new Map(),
    priceMultiplier = 5,
    registry = new Map()

  return {
    all: () => [...registry.values(), ...luxuries.values()],
    get: (id) => registry.get(id) || luxuries.get(id),
    getDiscoveredLuxuries: () => [...luxuries.values()].filter((good) => good.getPort().isDiscovered),
    getLuxuryForPort: function (port) {
      for (const good of luxuries.values()) {
        if (good.port == port) {
          return good
        }
      }
    },
    import: function (ports) {
      for (const port of ports) {
        if (port.luxuryGood) {
          const good = engine.fn.extend(this.luxury, {
            id: `luxury-${port.index}`,
            name: port.luxuryGood,
            port: port.index,
          })

          luxuries.set(good.id, good)
        }
      }

      return this
    },
    invent: function (definition) {
      const instance = engine.fn.extend(this.base, definition)
      registry.set(instance.id, instance)
      return instance
    },
    priceMultiplier: () => {
      const plus = content.plus.count()

      return priceMultiplier * (8 ** plus)
    },
    reset: function () {
      luxuries.clear()

      return this
    },
  }
})()

engine.state.on('import', ({ports}) => content.goods.import(ports))
engine.state.on('reset', () => content.goods.reset())
