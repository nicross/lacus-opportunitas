app.screen.sell = app.screenManager.invent({
  // Attributes
  id: 'sell',
  parentSelector: '.a-app--sell',
  rootSelector: '.a-sell',
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
      text: `Each port buys goods based on their economy. Click on a good to sell it from your available cargo for credits. Don't forget to <em>buy low, and sell high!</em>`,
    },
  ],
  // Hooks
  onReady: function () {
    const root = this.rootElement

    this.tableElement = this.rootElement.querySelector('.a-sell--table')

    Object.entries({
      back: root.querySelector('.a-sell--back'),
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

    this.state.components = content.dock.getPort().getBuying().map((good) => {
      const component = app.component.sellable.create(good)
        .attach(this.tableElement)

      component.on('click', () => {
        content.credits.adjust(component.cost)
        content.inventory.adjust(good.id, -1)
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
