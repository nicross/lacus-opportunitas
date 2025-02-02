app.screen.game = app.screenManager.invent({
  // Attributes
  id: 'game',
  parentSelector: '.a-app--game',
  rootSelector: '.a-game',
  transitions: {},
  // State
  state: {},
  // Hooks
  onEnter: function () {
    // Fake a state
    engine.state.import({
      position: {
        quaternion: engine.tool.vector3d.unitX().quaternion(),
        x: 0,
        y: 0,
        z: 0,
      },
      seed: Math.random(),
      time: 0,
    })

    engine.loop.resume()
  },
  onExit: function () {
    engine.loop.pause()
  },
  onFrame: function () {
    // Move forward, glued to surface for demo purposes
    const position = engine.position.getVector()
    position.x += engine.loop.delta() * 4
    position.z = content.surface.value(position)
    engine.position.setVector(position)
  },
})
