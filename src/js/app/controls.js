app.controls = (() => {
  const gameDefaults = {
    look: 0,
    move: 0,
    turn: 0,
  }

  let gameCache = {...gameDefaults},
    mouseAccelerated = {},
    uiCache = {},
    uiDelta = {}

  function check(mappings) {
    return Math.max(
      // Gamepad analog buttons
      mappings.gamepadAnalog.reduce((value, mapping) => {
        const reading = engine.input.gamepad.getAnalog(mapping)

        return Math.max(
          value,
          Math.abs(reading),
        )
      }, 0),
      // Gamepad axes
      mappings.gamepadAxis.reduce((value, mapping) => {
        const reading = engine.input.gamepad.getAxis(mapping[0])

        return Math.max(
          value,
          mapping[1] * reading > 0 ? Math.abs(reading) : 0,
        )
      }, 0),
      // Gamepad digital buttons
      mappings.gamepadDigital.reduce((value, key) => value || engine.input.gamepad.isDigital(key) ? 1 : 0, 0),
      // Keyboard buttons
      mappings.keyboard.reduce((value, key) => value || engine.input.keyboard.is(key) > 0 ? 1 : 0, 0),
      // Mouse axes
      app.pointerLock.is()
        ? mappings.mouseAxis.reduce((value, mapping) => {
            const reading = mapping[1] * mouseAccelerated[mapping[0]]

            return Math.max(
              value,
              reading > 0 ? reading : 0,
            )
          }, 0)
        : 0,
      // Mouse buttons
      app.pointerLock.is()
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
    gameCache.trickX = gameCache.trickLeft - gameCache.trickRight
    gameCache.trickY = gameCache.trickUp - gameCache.trickDown
    gameCache.turn = gameCache.turnLeft - gameCache.turnRight

    // Nullify some shortcuts
    if (content.movement.isJump() && (gameCache.trick1 || gameCache.trick2 || gameCache.trick3)) {
      gameCache.look = 0
      gameCache.move = 0
      gameCache.turn = 0
    } else {
      gameCache.trickX = 0
      gameCache.trickY = 0
    }
  }

  function updateMouseAccelerated() {
    // TODO: Apply mouse sensitivity setting
    const acceleration = 16,
      sensitivity = app.settings.computed.mouseSensitivity

    mouseAccelerated.x = engine.fn.accelerateValue(
      mouseAccelerated.x || 0,
      engine.fn.clamp(engine.fn.scale(engine.input.mouse.getMoveX(), -sensitivity, sensitivity, -1, 1), -1, 1),
      acceleration
    )

    mouseAccelerated.y = engine.fn.accelerateValue(
      mouseAccelerated.y || 0,
      engine.fn.clamp(engine.fn.scale(engine.input.mouse.getMoveY(), -sensitivity, sensitivity, -1, 1), -1, 1),
      acceleration
    )
  }

  function updateUi() {
    const values = {}

    // Standard mappings
    for (const [key, mappings] of Object.entries(app.controls.mappings.ui)) {
      if (check(mappings) > 0) {
        values[key] = true
      }
    }

    // Special focus mappings
    [
      'Digit1',
      'Digit2',
      'Digit3',
      'Digit4',
      'Digit5',
      'Digit6',
      'Digit7',
      'Digit8',
      'Digit9',
      'Digit0',
    ].forEach((key, index) => {
      if (engine.input.keyboard.is(key)) {
        values.focus = index
      }
    })

    // Calculate delta
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
      mouseAccelerated = {}
      uiCache = {}
      uiDelta = {}

      return this
    },
    update: function () {
      updateMouseAccelerated()

      updateGame()
      updateUi()

      return this
    },
  }
})()

engine.loop.on('frame', () => app.controls.update())
