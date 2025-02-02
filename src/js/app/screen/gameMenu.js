app.screen.gameMenu = app.screenManager.invent({
  // Attributes
  id: 'gameMenu',
  parentSelector: '.a-app--gameMenu',
  rootSelector: '.a-gameMenu',
  transitions: {
    back: function () {
      this.change('game')
    },
    mainMenu: function () {
      this.change('mainMenu')
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
      back: root.querySelector('.a-gameMenu--back'),
      mainMenu: root.querySelector('.a-gameMenu--mainMenu'),
      quit: root.querySelector('.a-gameMenu--quit'),
      settings: root.querySelector('.a-gameMenu--settings'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    root.querySelector('.a-gameMenu--action-quit').hidden = !app.isElectron()
  },
  onEnter: function () {
    this.rootElement.querySelector('.a-gameMenu--action-quit').hidden = !app.isElectron()
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
