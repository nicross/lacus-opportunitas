app.screen.settings = app.screenManager.invent({
  // Attributes
  id: 'settings',
  parentSelector: '.a-app--settings',
  rootSelector: '.a-settings',
  transitions: {
    back: function () {
      this.change(app.screen.settings.state.previousState)
    },
  },
  // State
  state: {
    // Handles whether accessed by mainMenu or gameMenu
    previousState: undefined,
  },
  useBasicFocusMemory: false,
  // Hooks
  onReady: function () {
    const root = this.rootElement

    // Buttons
    Object.entries({
      back: root.querySelector('.a-settings--back'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    // Sliders
    this.sliders = [
      ['.a-settings--gamepadVibration', app.settings.raw.gamepadVibration, app.settings.setGamepadVibration],
      ['.a-settings--mainVolume', app.settings.raw.mainVolume, app.settings.setMainVolume],
      ['.a-settings--mouseSensitivity', app.settings.raw.mouseSensitivity, app.settings.setMouseSensitivity],
      ['.a-settings--turningSpeed', app.settings.raw.turningSpeed, app.settings.setTurningSpeed],
    ].map(([selector, initialValue, setter]) => {
      const component = app.component.slider.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValueAsFloat()))
      return component
    })

    // Toggles
    this.toggles = [
      ['.a-settings--darkModeOn', app.settings.raw.darkModeOn, app.settings.setDarkModeOn],
      ['.a-settings--graphicsOn', app.settings.raw.graphicsOn, app.settings.setGraphicsOn],
    ].map(([selector, initialValue, setter]) => {
      const component = app.component.toggle.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValue()))
      return component
    })

    // Reset tutorial button
    const resetTutorial = root.querySelector('.a-settings--resetTutorial')

    resetTutorial.addEventListener('click', () => {
      app.storage.tutorial.clear()
      resetTutorial.ariaDisabled = 'true'
    })
  },
  onEnter: function (e) {
    this.state.previousState = e.previousState

    this.rootElement.querySelector('.a-settings--resetTutorial').ariaDisabled = app.storage.tutorial.hasAny() ? 'false' : 'true'
  },
  onExit: function () {
    app.settings.save()
  },
  onFrame: function () {
    if (this.handleBasicInput()) {
      return
    }

    const ui = app.controls.ui()

    if (ui.left) {
      for (const slider of this.sliders) {
        if (app.utility.focus.isWithin(slider.rootElement)) {
          return slider.decrement()
        }
      }
    }

    if (ui.right) {
      for (const slider of this.sliders) {
        if (app.utility.focus.isWithin(slider.rootElement)) {
          return slider.increment()
        }
      }
    }
  },
})
