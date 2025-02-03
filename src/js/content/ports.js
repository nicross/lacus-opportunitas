content.ports = (() => {
  const ports = [],
    tree = engine.tool.quadtree.create()

  return {
    all: () => [...ports],
    closest: () => tree.find(engine.position.getVector(), Infinity),
    export: () => ports.map((port) => port.export()),
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

      return this
    },
  }
})()

engine.state.on('export', (data) => data.ports = content.ports.export())
engine.state.on('import', ({ports}) => content.ports.import(ports))
engine.state.on('reset', () => content.ports.reset())
