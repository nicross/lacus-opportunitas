app.settings.register('gamepadVibration', {
  default: 1,
  update: function (computedValue) {
    app.haptics.setSensitivity(computedValue)
  },
})

app.settings.register('graphicsOn', {
  compute: (rawValue) => Boolean(rawValue),
  default: true,
  update: function (computedValue) {
    content.gl.setActive(computedValue)

    if (app.gameState.isLoaded()) {
      if (computedValue) {
        content.video.load()
      } else {
        content.video.unload()
      }
    }
  },
})

app.settings.register('mainVolume', {
  compute: (rawValue) => engine.fn.fromDb(engine.fn.lerpExp(engine.const.zeroDb, 0, rawValue, 0.1)),
  default: 1,
  update: function (computedValue) {
    engine.fn.setParam(engine.mixer.param.gain, computedValue)
  },
})

app.settings.register('mouseSensitivity', {
  compute: (rawValue) => engine.fn.lerp(26, 1, rawValue),
  default: 0.5,
})

app.settings.register('turningSpeed', {
  compute: (rawValue) => engine.fn.lerp(0.25, 1, rawValue),
  default: 0.5,
  update: function (computedValue) {
    content.movement.setTurningSpeed(computedValue)
  },
})
