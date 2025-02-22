app.screen.travel = app.screenManager.invent({
  // Attributes
  id: 'travel',
  parentSelector: '.a-app--travel',
  rootSelector: '.a-travel',
  transitions: {
    back: function () {
      this.change('ports')
    },
    target: function () {
      const port = app.screen.travel.state.port

      if (content.dock.is()) {
        const vector = engine.tool.vector3d.create(port)

        engine.position.setQuaternion(
          vector.normalize().inverse().quaternion()
        )

        engine.position.setVector(
          vector.subtractRadius(
            content.dock.radius() + content.movement.maxVelocity()
          )
        )

        content.dock.set(undefined)
      }

      app.screen.dock.clearFocusMemory()
      app.screen.gameMenu.clearFocusMemory()
      app.screen.ports.clearFocusMemory()

      this.change('game')

      if (!content.ports.target.is(port)) {
        content.ports.target.set(port)
      }
    },
    travel: function () {
      const port = app.screen.travel.state.port

      content.time.add(
        engine.position.getVector().zeroZ().distance(port)
          / content.movement.maxVelocity()
          * 4
      )

      engine.position.setVector(port)
      content.dock.set(port.index)
      app.autosave.trigger()

      app.screen.dock.clearFocusMemory()
      app.screen.gameMenu.clearFocusMemory()
      app.screen.ports.clearFocusMemory()

      this.change('dock')
    },
  },
  // State
  state: {
    port: undefined,
  },
  // Tutorials
  tutorials: [],
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      back: root.querySelector('.a-travel--back'),
      target: root.querySelector('.a-travel--target'),
      travel: root.querySelector('.a-travel--travel'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => {
        if (element.ariaDisabled == 'true') {
          return
        }

        app.screenManager.dispatch(event)
      })
    })
  },
  onEnter: function (e) {
    this.state.port = e.port

    this.rootElement.querySelector('.a-travel--portName').innerHTML = this.state.port.name
    this.rootElement.querySelector('.a-travel--portName').title = this.state.port.name
    this.rootElement.querySelector('.a-travel--target').innerHTML = content.dock.is() ? 'Undock and set as target' : 'Set as target'
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
