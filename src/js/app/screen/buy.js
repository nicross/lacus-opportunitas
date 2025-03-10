app.screen.buy = app.screenManager.invent({
  // Attributes
  id: 'buy',
  parentSelector: '.a-app--buy',
  rootSelector: '.a-buy',
  transitions: {
    back: function () {
      this.change('dock')
    },
  },
  // State
  state: {
    components: [],
  },
  useBasicFocusMemory: false,
  // Tutorials
  tutorials: [
    {
      text: `Each port sells goods based on their economy. Agricultural ports tend to sell <strong>essentials</strong>. Click on them to purchase one with your credits.`,
    },
  ],
  // Hooks
  onReady: function () {
    const root = this.rootElement

    this.tableElement = this.rootElement.querySelector('.a-buy--table')

    Object.entries({
      back: root.querySelector('.a-buy--back'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    this.statusComponent = app.component.status.hydrate(
      root.querySelector('.c-status')
    )
  },
  onEnter: function () {
    app.toasts.memory.remember()

    this.statusComponent.update()

    this.state.components = []
    this.tableElement.innerHTML = ''

    this.state.components = content.dock.getPort().getSelling().map((good) => {
      const component = app.component.buyable.create(good)
        .attach(this.tableElement)

      component.on('click', () => {
        content.credits.adjust(-component.cost)
        content.inventory.adjust(good.id, 1)
        content.dock.getPort().logTransaction(good.id, 1)

        app.toasts.memory.check()

        window.requestAnimationFrame(() => {
          this.statusComponent.update()

          for (const component of this.state.components) {
            component.update()
          }
        })
      })

      return component
    })

    this.rootElement.querySelector('.c-screen--scrollable').scrollTop = 0
  },
  onExit: function () {
    this.statusComponent.setLive(false)
  },
  onFrame: function () {
    this.handleBasicInput()
  },
})
