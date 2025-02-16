app.screen.splash = app.screenManager.invent({
  // Attributes
  id: 'splash',
  parentSelector: '.a-app--splash',
  rootSelector: '.a-splash',
  transitions: {
    interact: function () {
      this.change('mainMenu')
    },
  },
  // State
  state: {},
  useBasicFocusMemory: false,
  // Hooks
  onReady: function () {
    const root = this.rootElement

    root.addEventListener('click', () => {
      app.screenManager.dispatch('interact')
    })

    root.querySelector('.a-splash--version').innerHTML = `v${app.version()}`
  },
  onEnter: function () {
    content.audio.theme.unduck()
  },
  onFrame: function () {
    const ui = app.controls.ui()

    if (ui.confirm || ui.enter || ui.space || ui.start || ui.select) {
      app.screenManager.dispatch('interact')
    }
  },
  onExit: function () {
    content.audio.theme.duck()
  },
})
