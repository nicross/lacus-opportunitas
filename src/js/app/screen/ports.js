app.screen.ports = app.screenManager.invent({
  // Attributes
  id: 'ports',
  parentSelector: '.a-app--ports',
  rootSelector: '.a-ports',
  transitions: {
    back: function () {
      app.screen.ports.clearFocusMemory()
      this.change('gameMenu')
    },
    travel: function () {
      this.change('travel')
    },
  },
  // State
  state: {
    components: [],
    focusMemory: undefined,
  },
  useBasicFocusMemory: false,
  // Tutorials
  tutorials: [
    {
      text: `From the <strong>Lunarspatial memory</strong> you may browse your discoveries. Discover more ports to add them to memory.`,
    },
  ],
  // Hooks
  onReady: function () {
    const root = this.rootElement

    this.tableElement = this.rootElement.querySelector('.a-ports--table')

    Object.entries({
      back: root.querySelector('.a-ports--back'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })
  },
  onEnter: function () {
    this.state.components = []
    this.tableElement.innerHTML = ''

    this.state.components = content.ports.discovered().map((port) => {
      const component = app.component.port.create(port)
        .attach(this.tableElement)

      component.on('click', () => {
        app.screen.ports.state.focusMemory = port
        app.screen.travel.setPort(port)
        app.screenManager.dispatch('travel')
      })

      return component
    })

    this.rootElement.querySelector('.c-screen--scrollable').scrollTop = 0
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
  // Custom methods
  getFocusWithinTarget: function () {
    if (this.state.focusMemory) {
      for (const component of this.state.components) {
        if (component.port === this.state.focusMemory) {
          return component.rootElement
        }
      }
    }

    return this.rootElement
  }
})
