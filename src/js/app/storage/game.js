app.storage.game = {
  clear: () => app.storage.clear('game'),
  has: () => app.storage.has('game'),
  get: () => app.storage.get('game'),
  set: (value) => app.storage.set('game', value),
  // Helpers
  new: function () {
    this.clear()

    const seed = app.fn.generateSeed()
    engine.seed.set(seed)

    const ports = content.ports.generate(),
      start = ports.find((port) => port.economy == 'agricultural')

    const startVector = engine.tool.vector3d.unitX()
      .rotateEuler({yaw: start.angle})
      .scale(content.lake.radius())

    start.isDiscovered = true

    engine.state.import({
      credits: 10,
      dock: start.index,
      inventory: {},
      ports,
      position: {
        quaternion: startVector.normalize().inverse().quaternion(),
        x: startVector.x,
        y: startVector.y,
      },
      seed,
      time: 0,
    })

    return this.save()
  },
  load: function () {
    engine.state.import(
      this.get()
    )

    return this
  },
  save: function () {
    this.set(
      engine.state.export()
    )

    return this
  },
}
