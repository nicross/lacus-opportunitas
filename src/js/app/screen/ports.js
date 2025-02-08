app.screen.ports = app.screenManager.invent({
  // Attributes
  id: 'ports',
  parentSelector: '.a-app--ports',
  rootSelector: '.a-ports',
  transitions: {
    back: function () {
      this.change('gameMenu')
    },
    travel: function () {
      this.change('dock')
    },
  },
  // State
  state: {
    components: [],
  },
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
        content.time.add(
          component.distance / content.movement.maxVelocity()
        )

        engine.position.setVector(port)
        content.dock.set(port.index)
        app.autosave.trigger()

        app.screenManager.dispatch('travel')
      })

      return component
    })
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
