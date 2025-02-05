app.screen.game = app.screenManager.invent({
  // Attributes
  id: 'game',
  parentSelector: '.a-app--game',
  rootSelector: '.a-game',
  transitions: {
    dock: function () {
      this.change('dock')
    },
    pause: function () {
      this.change('gameMenu')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    content.dock.on('dock', () => {
      app.screenManager.dispatch('dock')
    })

    this.port.onReady()
  },
  onEnter: function () {
    app.autosave.enable()
    app.autosave.trigger()

    engine.loop.resume()

    this.port.onEnter()
  },
  onExit: function () {
    app.autosave.disable()
    app.autosave.trigger()

    engine.loop.pause()

    this.port.onExit()
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

    this.port.onFrame()
  },
})
