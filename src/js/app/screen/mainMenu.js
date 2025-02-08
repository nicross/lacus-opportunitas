app.screen.mainMenu = app.screenManager.invent({
  // Attributes
  id: 'mainMenu',
  parentSelector: '.a-app--mainMenu',
  rootSelector: '.a-mainMenu',
  transitions: {
    back: function () {
      this.change('splash')
    },
    continue: function () {
      app.screen.mainMenu.clearFocusMemory()
      app.storage.game.load()
      this.change(content.dock.is() ? 'dock' : 'game')
    },
    newGame: function () {
      if (app.storage.game.has()) {
        return this.change('newGame')
      }

      app.screen.mainMenu.clearFocusMemory()
      app.storage.game.new()
      this.change(content.dock.is() ? 'dock' : 'game')
    },
    quit: function () {
      app.quit()
    },
    settings: function () {
      this.change('settings')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      continue: root.querySelector('.a-mainMenu--continue'),
      newGame: root.querySelector('.a-mainMenu--newGame'),
      quit: root.querySelector('.a-mainMenu--quit'),
      settings: root.querySelector('.a-mainMenu--settings'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    root.querySelector('.a-mainMenu--action-quit').hidden = !app.isElectron()
  },
  onEnter: function () {
    this.rootElement.querySelector('.a-mainMenu--action-continue').hidden = !app.storage.game.has()
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
