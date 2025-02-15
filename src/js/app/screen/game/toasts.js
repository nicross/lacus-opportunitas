app.screen.game.toasts = {
  // State
  queue: [],
  timeout: 0,
  // Methods
  enqueue: function (value) {
    this.queue.push(value)

    return this
  },
  onReady: function () {
    this.rootElement = document.querySelector('.a-game--toasts')

    return this
  },
  onEnter: function () {
    this.rootElement.innerHTML = ''
    this.rootElement.setAttribute('aria-live', 'assertive')

    return this
  },
  onFrame: function () {
    if (this.timeout > 0) {
      this.timeout -= engine.loop.delta()
      return
    }

    for (const child of this.rootElement.children) {
      if (!child.hasAttribute('aria-hidden')) {
        child.setAttribute('aria-hidden', 'true')
        child.setAttribute('role', 'presentation')
        child.onanimationend = () => child.remove()
      }
    }

    if (!this.queue.length) {
      return
    }

    const message = this.queue.shift()

    this.rootElement.appendChild(
      app.utility.dom.toElement(
        `<div class="a-game--toast" id="${engine.fn.uuid()}">${message}</div>`
      )
    )

    // Reset timer
    this.timeout = 3

    return this
  },
  onExit: function () {
    this.queue.length = 0
    this.rootElement.removeAttribute('aria-live')

    return this
  },
}

engine.ready(() => {
  content.bottles.on('collect', (reward) => {
    app.screen.game.toasts.enqueue(`<strong>Bottles recovered</strong><br />+${reward} credit${reward != 1 ? 's' : ''}`)
  })
})
