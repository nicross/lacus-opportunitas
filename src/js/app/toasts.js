app.toasts = (() => {
  const pubsub = engine.tool.pubsub.create(),
    queue = []

  let rootElement,
    timeout = 0

  engine.ready(() => {
    rootElement = document.querySelector('.a-toasts')
  })

  return pubsub.decorate({
    enqueue: function (value) {
      queue.push(value)

      throttledToast()

      return this
    },
    update: function () {
      if (timeout > 0) {
        timeout -= engine.loop.delta()
        return
      }

      for (const child of rootElement.children) {
        if (!child.hasAttribute('aria-hidden')) {
          child.setAttribute('aria-hidden', 'true')
          child.setAttribute('role', 'presentation')
          child.onanimationend = () => child.remove()
        }
      }

      if (!queue.length) {
        return
      }

      const message = queue.shift()

      rootElement.appendChild(
        app.utility.dom.toElement(
          `<div class="a-toasts--toast" id="${engine.fn.uuid()}">${message}</div>`
        )
      )

      timeout = 2

      pubsub.emit('toast')

      return this
    },
  })
})()

engine.loop.on('frame', () => app.toasts.update())

content.bottles.on('collect', (reward) => {
  const numberFormat = Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  })

  app.toasts.enqueue(`<strong>Bottles recovered</strong><br />+${numberFormat.format(reward)} credit${reward != 1 ? 's' : ''}`)
})
