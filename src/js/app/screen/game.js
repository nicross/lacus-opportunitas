app.screen.game = app.screenManager.invent({
  // Attributes
  id: 'game',
  parentSelector: '.a-app--game',
  rootSelector: '.a-game',
  transitions: {
    pause: function () {
      this.change('gameMenu')
    },
  },
  // State
  state: {},
  // Hooks
  onEnter: function () {
    app.autosave.enable()
    app.autosave.trigger()

    engine.loop.resume()
  },
  onExit: function () {
    app.autosave.disable()
    app.autosave.trigger()

    engine.loop.pause()
  },
  onFrame: function () {
    const game = app.controls.game(),
      ui = app.controls.ui()

    if (ui.pause) {
      return app.screenManager.dispatch('pause')
    }

    content.movement.update({
      move: game.move,
      turn: game.turn,
    })

    content.camera.applyLook(game.look)
  },
})
