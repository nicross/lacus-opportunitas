app.screen.inventory = app.screenManager.invent({
  // Attributes
  id: 'inventory',
  parentSelector: '.a-app--inventory',
  rootSelector: '.a-inventory',
  transitions: {
    back: function () {
      this.change('gameMenu')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      back: root.querySelector('.a-inventory--back'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    this.statusComponent = app.component.status.hydrate(
      root.querySelector('.c-status')
    )
  },
  onEnter: function () {
    this.statusComponent.update()
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
