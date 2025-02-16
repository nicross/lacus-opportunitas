app.gameState = (() => {
  const pubsub = engine.tool.pubsub.create()

  let isLoaded = false

  return pubsub.decorate({
    isLoaded: () => isLoaded,
    setLoaded: function (value) {
      isLoaded = Boolean(value)

      if (isLoaded) {
        pubsub.emit('load')
      } else {
        pubsub.emit('unload')
      }

      return this
    },
  })
})()
