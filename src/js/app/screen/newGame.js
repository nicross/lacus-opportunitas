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
      app.storage.game.new()
      this.change(content.dock.is() ? 'dock' : 'game')
    },
  },
  // State
  state: {},
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
