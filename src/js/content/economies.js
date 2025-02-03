content.economies = (() => {
  const registry = new Map()

  return {
    all: () => [...registry.values()],
    get: (id) => registry.get(id),
    invent: function (definition) {
      const instance = engine.fn.extend(this.base, definition)
      registry.set(instance.id, instance)
      return instance
    },
  }
})()
