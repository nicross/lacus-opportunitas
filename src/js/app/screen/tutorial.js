app.screen.tutorial = app.screenManager.invent({
  // Attributes
  id: 'tutorial',
  parentSelector: '.a-app--tutorial',
  rootSelector: '.a-tutorial',
  transitions: {
    continue: function () {
      const tutorial = app.screen.tutorial.state.tutorial

      app.storage.tutorial.add(tutorial.screen, tutorial.index)
      this.change(tutorial.screen)
    },
  },
  // State
  state: {
    tutorial: undefined,
  },
  useBasicFocusMemory: false,
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      continue: root.querySelector('.a-tutorial--continue'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    //root.querySelector('.a-tutorial--text').addEventListener('click', () => app.screenManager.dispatch('continue'))
  },
  onEnter: function (e) {
    this.state.tutorial = e.tutorial
    this.rootElement.querySelector('.a-tutorial--text').innerHTML = e.tutorial.tutorial.text
  },
  onFrame: function () {
    const ui = app.controls.ui()

    if (ui.confirm) {
      return app.screenManager.dispatch('continue')
    }

    if (this.handleBasicInput()) {
      return
    }
  },
})
