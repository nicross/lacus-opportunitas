app.screen.ports = app.screenManager.invent({
  // Attributes
  id: 'ports',
  parentSelector: '.a-app--ports',
  rootSelector: '.a-ports',
  transitions: {
    back: function () {
      this.change('gameMenu')
    },
    travel: function (port) {
      this.change('travel', {
        port,
      })
    },
  },
  // State
  state: {
    components: [],
  },
  useBasicFocusMemory: false,
  // Tutorials
  tutorials: [
    {
      text: `From the <strong>Lunarspatial memory</strong> you may browse your discoveries. Click on any port to travel to it. Discover more ports to add them to memory.`,
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
        app.screenManager.dispatch('travel', port)
      })

      return component
    })
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
