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
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

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
