content.ports.target = (() => {
  const pubsub = engine.tool.pubsub.create()

  let target

  return pubsub.decorate({
    get: () => target,
    is: (value) => target === value || target?.index == value,
    reset: function () {
      target = undefined

      return this
    },
    set: function (value) {
      if (!value) {
        pubsub.emit('unset', target)
      }

      target = value ? value : undefined

      if (value) {
        pubsub.emit('set', target)
      }

      return this
    },
  })
})()
