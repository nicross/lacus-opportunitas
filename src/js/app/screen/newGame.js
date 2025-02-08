app.screen.newGame = app.screenManager.invent({
  // Attributes
  id: 'newGame',
  parentSelector: '.a-app--newGame',
  rootSelector: '.a-newGame',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
    confirm: function () {
      app.screen.mainMenu.clearFocusMemory()
      app.storage.game.new()
      app.storage.tutorial.clear()

      this.change(content.dock.is() ? 'dock' : 'game')
    },
  },
  // State
  state: {},
  useBasicFocusMemory: false,
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      back: root.querySelector('.a-newGame--back'),
      confirm: root.querySelector('.a-newGame--confirm'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })
  },
  onEnter: function () {},
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
