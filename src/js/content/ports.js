content.ports = (() => {
  const ports = [],
    tree = engine.tool.quadtree.create()

  return {
    all: () => [...ports],
    closest: () => tree.find(engine.position.getVector(), Infinity),
    discovered: () => {
      const discovered = ports.filter((port) => port.isDiscovered)

      const distances = new Map(),
        position = engine.position.getVector()

      discovered.sort((a, b) => {
        if (!distances.has(a)) {
          distances.set(a, position.distance(a))
        }

        if (!distances.has(b)) {
          distances.set(b, position.distance(b))
        }

        return distances.get(a) - distances.get(b)
      })

      return discovered
    },
    export: () => ports.map((port) => port.export()),
    facing: (threshold = 1) => {
      const sorted = ports.map((port) => [port, port.getDot()])
      sorted.sort((a, b) => b[1] - a[1])

      return sorted.length && sorted[0][1] > (1 - threshold)
        ? sorted[0][0]
        : undefined
    },
    get: (index) => ports[index],
    import: function (exports) {
      for (const exported of exports) {
        const port = content.ports.model.instantiate(exported)
        ports.push(port)
        tree.insert(port)
      }

      return this
    },
    reset: function () {
      ports.length = []
      tree.clear()

      this.target.reset()

      return this
    },
  }
})()

engine.state.on('export', (data) => data.ports = content.ports.export())
engine.state.on('import', ({ports}) => content.ports.import(ports))
engine.state.on('reset', () => content.ports.reset())
