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
    const game = app.controls.game(),
      ui = app.controls.ui()

    // TODO: Apply turn/look speed to these values
    content.movement.update({
      move: game.move,
      turn: game.turn,
    })

    content.camera.applyLook(game.look)
  },
})
