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
    setNext: function () {
      return this.set(
        content.ports.get(
          target
            ? target.index + 1
            : 0
        )
      )
    },
    setPrevious: function () {
      return this.set(
        content.ports.get(
          target
            ? target.index - 1
            : content.ports.count() - 1
        )
      )
    },
  })
})()
