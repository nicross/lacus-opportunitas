content.inventory = (() => {
  const baseCapacity = 4

  let inventory = {}

  function calculateCapacity() {
    const averageLevel = cotnent.ports.averageTransactionLevel()

    return baseCapacity + Math.round(averageLevel * 2)
  }

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
    capacity: () => calculateCapacity(),
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
    has: (id, value = 1) => inventory[id] >= value,
    import: function (data) {
      inventory = {...data}

      return this
    },
    isFull: function () {
      return this.count() >= calculateCapacity()
    },
    remaining: function () {
      return calculateCapacity() - this.count()
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
