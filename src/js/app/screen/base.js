app.screen.base = {
  // Attributes
  id: undefined,
  parentSelector: undefined,
  rootSelector: undefined,
  transitions: {},
  // State
  state: {},
  useBasicFocusMemory: true,
  // Tutorials
  tutorials: [],
  // Hooks
  onReady: function () {},
  onEnter: function () {},
  onExit: function () {},
  onFrame: function () {},
  onImport: function () {},
  onReset: function () {},
  // Lifecycle methods
  enter: function (...args) {
    this.parentElement.removeAttribute('aria-hidden')
    this.parentElement.removeAttribute('hidden')

    window.requestAnimationFrame(() => {
      this.parentElement.onanimationend = undefined
      this.parentElement.classList.add('a-app--screen-active')
      this.parentElement.classList.remove('a-app--screen-inactive')
    })

    this.onEnter(...args)
    this.focusWithin()

    return this
  },
  exit: function (...args) {
    this.parentElement.setAttribute('aria-hidden', 'true')

    window.requestAnimationFrame(() => {
      this.parentElement.classList.remove('a-app--screen-active')
      this.parentElement.classList.add('a-app--screen-inactive')

      this.parentElement.onanimationend = () => {
        this.parentElement.classList.remove('a-app--screen-inactive')
        this.parentElement.hidden = true
      }
    })

    this.onExit(...args)

    if (this.useBasicFocusMemory) {
      // XXX: Needs engine.tool.fsm.prototype.dispatch override
      if (['back','dock','mainMenu','quit','resume'].includes(args[0].event)) {
        this.clearFocusMemory()
      } else {
        this.rememberBasicFocus()
      }
    }

    return this
  },
  import: function (...args) {
    this.onImport(...args)

    return this
  },
  ready: function (...args) {
    this.parentElement = document.querySelector(this.parentSelector)
    this.parentElement.setAttribute('aria-hidden', 'true')
    this.parentElement.hidden = true

    this.rootElement = document.querySelector(this.rootSelector)
    app.utility.focus.trap(this.rootElement)

    this.onReady(...args)

    return this
  },
  reset: function () {
    this.onReset()

    return this
  },
  // Custom methods
  clearFocusMemory: function () {
    this.state.focusMemory = undefined

    return this
  },
  focusWithin: function () {
    const target = this.getFocusWithinTarget()

    if (app.utility.focus.isFocusable(target) || target.getAttribute('tabindex') == -1) {
      app.utility.focus.set(target)
    } else {
      app.utility.focus.setWithin(target)
    }

    return this
  },
  getFocusWithinTarget: function () {
    return (this.useBasicFocusMemory ? this.state.focusMemory : undefined) || this.rootElement
  },
  handleBasicInput: function () {
    const root = this.rootElement,
      ui = app.controls.ui()

    if (ui.back) {
      app.screenManager.dispatch('back')
      return true
    }

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        focused.click()
        return true
      }
    }

    if (ui.up) {
      app.utility.focus.setPreviousFocusable(root)
      return true
    }

    if (ui.down) {
      app.utility.focus.setNextFocusable(root)
      return true
    }

    if ('focus' in ui) {
      const toFocus = app.utility.focus.selectFocusable(root)[ui.focus]

      if (toFocus) {
        if (app.utility.focus.is(toFocus)) {
          toFocus.click()
        } else {
          app.utility.focus.set(toFocus)
        }

        return true
      }
    }

    return false
  },
  nextTutorial: function () {
    for (const i in this.tutorials) {
      if (app.storage.tutorial.has(this.id, i)) {
        continue
      }

      const tutorial = this.tutorials[i]

      if (tutorial.criteria && !tutorial.criteria()) {
        continue
      }

      return {
        index: i,
        screen: this.id,
        tutorial,
      }
    }
  },
  rememberBasicFocus: function () {
    this.state.focusMemory = this.rootElement.querySelector('button:focus, [role="button"]:focus')

    return this
  },
}
