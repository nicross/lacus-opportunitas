app.controls = (() => {
  const gameDefaults = {
    look: 0,
    move: 0,
    turn: 0,
  }

  let gameCache = {...gameDefaults},
    uiCache = {},
    uiDelta = {}

  function check(mappings) {
    return Math.max(
      // Gamepad axes
      mappings.gamepadAxis.reduce((value, mapping) => {
        const reading = engine.input.gamepad.getAxis(mapping[0])

        return Math.max(
          value,
          mapping[1] * reading > 0 ? Math.abs(reading) : 0,
        )
      }, 0),
      // Gamepad buttons
      mappings.gamepadDigital.reduce((value, key) => value || engine.input.gamepad.isDigital(key) ? 1 : 0, 0),
      // Keyboard buttons
      mappings.keyboard.reduce((value, key) => value || engine.input.keyboard.is(key) > 0 ? 1 : 0, 0),
      // Mouse axes
      document.pointerLockElement
        ? mappings.mouseAxis.reduce((value, mapping) => {
            const reading = mapping[1] * Math.sign(
              mapping[0] == 'x'
                ? engine.input.mouse.getMoveX()
                : engine.input.mouse.getMoveY()
            )

            return Math.max(
              value,
              reading > 0 ? reading : 0,
            )
          }, 0)
        : 0,
      // Mouse buttons
      document.pointerLockElement
        ? mappings.mouseButton.reduce((value, key) => value || engine.input.mouse.isButton(key) ? 1 : 0, 0)
        : 0,
      0
    )
  }

  function updateGame() {
    gameCache = {}

    for (const [key, mappings] of Object.entries(app.controls.mappings.game)) {
      gameCache[key] = check(mappings)
    }

    // Shortcuts
    gameCache.look = gameCache.lookUp - gameCache.lookDown
    gameCache.move = gameCache.moveForward - gameCache.moveBackward
    gameCache.turn = gameCache.turnLeft - gameCache.turnRight
  }

  function updateUi() {
    const values = {}

    for (const [key, mappings] of Object.entries(app.controls.mappings.ui)) {
      if (check(mappings) > 0) {
        values[key] = true
      }
    }

    uiDelta = {}

    for (const key in values) {
      if (!(key in uiCache)) {
        uiDelta[key] = values[key]
      }
    }

    uiCache = values
  }

  return {
    game: () => ({...gameCache}),
    ui: () => ({...uiDelta}),
    reset: function () {
      gameCache = {}
      uiCache = {}
      uiDelta = {}

      return this
    },
    update: function () {
      updateGame()
      updateUi()

      return this
    },
  }
})()

engine.loop.on('frame', () => app.controls.update())
