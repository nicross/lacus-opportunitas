content.dock = (() => {
  const pubsub = engine.tool.pubsub.create(),
    radius = 50

  let index

  return pubsub.decorate({
    export: () => index || undefined,
    getPort: () => content.ports.get(index),
    import: function (value = undefined) {
      index = value

      return this
    },
    is: () => typeof index != 'undefined',
    radius: () => radius,
    reset: function () {
      index = undefined

      return this
    },
    set: function (value) {
      const isChange = index != value,
        isUndock = typeof value == 'undefined'

      if (isUndock) {
        pubsub.emit('undock')
      }

      index = value

      if (isChange && !isUndock) {
        pubsub.emit('change')
      }

      return this
    },
    update: function () {
      // Require application UI to undock
      if (index) {
        return this
      }

      const closest = content.ports.closest(),
        distance = engine.position.getVector().distance(closest)

      if (closest && distance < radius && !content.tricks.isActive()) {
        index = closest.index
        closest.isDiscovered = true
        pubsub.emit('dock')
      }

      return this
    },
  })
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.dock.update()
})

engine.state.on('export', (data) => data.dock = content.dock.export())
engine.state.on('import', ({dock}) => content.dock.import(dock))
engine.state.on('reset', content.dock.reset())
