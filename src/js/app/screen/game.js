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
  // Tutorials
  tutorials: [
    // Controls
    {
      text: `<em>I insist! please take control of the watercraft!</em><br /><br />Hold <kbd>Turn</kbd> to face any direction, <kbd>Accelerate</kbd> to apply thrust in that direction, and <kbd>Brake</kbd> to stop. Tap <kbd>Target</kbd> to track a port, and approach any port to dock.`,
    },
    // Bottles
    {
      criteria: () => content.excursions.count() > 1,
      text: `Occasionally you may find bottles of credits floating casually in the lake. Implausible, <em>you bet!</em> but I promise that they're worth recovering!`,
    },
    // Jumps
    {
      criteria: () => content.excursions.count() > 2,
      text: `Occasionally you may find large waves in the middle of the lake. Let go of the controls to launch us at the peak of your approach!`,
    },
  ],
  // Hooks
  onReady: function () {
    content.dock.on('dock', () => {
      content.ports.target.reset()
      app.screenManager.dispatch('dock')
    })

    this.port.onReady()
  },
  onEnter: function () {
    this.setBlanked(!app.settings.computed.graphicsOn)

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

    if (ui.target) {
      const target = content.ports.facing()

      content.ports.target.set(
        content.ports.target.is(target)
          ? undefined
          : target
      )
    } else if (ui.targetNext) {
      content.ports.target.setNext()
    } else if (ui.targetPrevious) {
      content.ports.target.setPrevious()
    }

    content.movement.update({
      move: game.move,
      turn: game.turn,
    })

    content.camera.applyLook(game.look)

    this.port.onFrame()
  },
  // Methods
  setBlanked: function (value) {
    if (value) {
      this.rootElement.classList.add('a-game-blanked')
    } else {
      this.rootElement.classList.remove('a-game-blanked')
    }

    return this
  },
})
