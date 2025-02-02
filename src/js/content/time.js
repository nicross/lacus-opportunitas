content.time = (() => {
  let time = 0

  return {
    add: function (value) {
      time += Number(value) || 0

      return this
    },
    import: function (value) {
      time = Number(value) || 0

      return this
    },
    planet: () => engine.tool.vector3d.unitX().rotateEuler({
      pitch: engine.const.tau * 18.5/360,
    }),
    reset: function () {
      time = 0

      return this
    },
    sun: () => engine.tool.vector3d.unitX().rotateEuler({
      pitch: engine.const.tau * 20/360,
      yaw: engine.const.tau * 1.5/360,
    }),
    value: () => time,
  }
})()

engine.loop.on('frame', ({
  delta,
  paused,
}) => {
  if (paused) {
    return
  }

  content.time.add(delta)
})

engine.state.on('export', (data) => data.time = content.time.value())
engine.state.on('import', ({time}) => content.time.import(time))
engine.state.on('reset', () => content.time.reset())
