app.screen.gameMenu = app.screenManager.invent({
  // Attributes
  id: 'gameMenu',
  parentSelector: '.a-app--gameMenu',
  rootSelector: '.a-gameMenu',
  transitions: {
    back: function () {
      this.change(content.dock.is() ? 'dock' : 'game')
    },
    inventory: function () {
      this.change('inventory')
    },
    mainMenu: function () {
      app.autosave.trigger()
      this.change('mainMenu')
    },
    ports: function () {
      this.change('ports')
    },
    quit: function () {
      app.autosave.trigger()
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
      inventory: root.querySelector('.a-gameMenu--inventory'),
      mainMenu: root.querySelector('.a-gameMenu--mainMenu'),
      ports: root.querySelector('.a-gameMenu--ports'),
      quit: root.querySelector('.a-gameMenu--quit'),
      settings: root.querySelector('.a-gameMenu--settings'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    root.querySelector('.a-gameMenu--action-quit').hidden = !app.isElectron()
  },
  onEnter: function () {
    this.rootElement.ariaLabel = content.dock.is() ? 'Miscellaneous' : 'Game paused'
    this.rootElement.querySelector('.c-screen--title').innerHTML = content.dock.is() ? 'Miscellaneous' : 'Game paused'
    this.rootElement.querySelector('.a-gameMenu--back').innerHTML = content.dock.is() ? 'Return to dock' : 'Resume game'
    this.rootElement.querySelector('.a-gameMenu--action-quit').hidden = !app.isElectron()
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
