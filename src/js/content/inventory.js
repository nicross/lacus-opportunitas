content.inventory = (() => {
  const capacity = 8

  let inventory = {}

  return {
    adjust: function (id, value) {
      value = value > 0
        ? Math.min(value, this.remaining())
        : Math.max(value, -this.count())

      inventory[id] = inventory[id]
        ? inventory[id] + value
        : Math.max(value, 0)

      if (!inventory[id]) {
        delete inventory[id]
      }

      return this
    },
    capacity: () => capacity,
    count: () => Object.values(inventory).reduce((sum, value) => sum + value, 0),
    export: () => ({...inventory}),
    get: (id) => inventory[id] || 0,
    goods: () => Object.entries(inventory).reduce((goods, [id, value]) => {
      if (value) {
        const good = content.goods.get(id)

        if (good) {
          goods.push(good)
        }
      }

      return goods
    }, []).sort((a, b) => a.name.localeCompare(b.name)),
    has: (id) => inventory[id] > 0,
    import: function (data) {
      inventory = {...data}

      return this
    },
    isFull: function () {
      return this.count() >= this.capacity()
    },
    remaining: function () {
      return this.capacity() - this.count()
    },
    reset: function () {
      inventory = {}

      return this
    },
  }
})()

engine.state.on('export', (data) => data.inventory = content.inventory.export())
engine.state.on('import', ({inventory}) => content.inventory.import(inventory))
engine.state.on('reset', () => content.inventory.reset())
