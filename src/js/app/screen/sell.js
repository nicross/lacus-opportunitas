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
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

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
    this.statusComponent.update().setLive(true)
  },
  onExit: function () {
    this.statusComponent.setLive(false)
  },
  onFrame: function () {
    this.handleBasicInput()

    // this.statusComponent.update()
  },
})
