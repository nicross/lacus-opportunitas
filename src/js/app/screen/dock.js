app.screen.dock = app.screenManager.invent({
  // Attributes
  id: 'dock',
  parentSelector: '.a-app--dock',
  rootSelector: '.a-dock',
  transitions: {
    back: function () {
      const port = content.dock.getPort(),
        vector = engine.tool.vector3d.create(port)

      engine.position.setQuaternion(
        vector.normalize().inverse().quaternion()
      )

      engine.position.setVector(
        vector.subtractRadius(
          content.dock.radius() + content.movement.maxVelocity()
        )
      )

      content.dock.reset()

      this.change('game')
    },
    gameMenu: function () {
      this.change('gameMenu')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      back: root.querySelector('.a-dock--back'),
      gameMenu: root.querySelector('.a-dock--gameMenu'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })
  },
  onEnter: function () {
    const port = content.dock.getPort()

    this.rootElement.querySelector('.a-dock--economy').innerHTML = `${port.economy.name} port`
    this.rootElement.querySelector('.a-dock--portName').innerHTML = port.name
    this.rootElement.querySelector('.a-dock--portName').title = port.name
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
