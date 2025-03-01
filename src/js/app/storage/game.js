app.storage.game = {
  clear: () => app.storage.clear('game'),
  has: () => app.storage.has('game'),
  get: () => app.storage.get('game'),
  set: (value) => app.storage.set('game', value),
  // Helpers
  generate: function () {
    const seed = app.fn.generateSeed()
    engine.seed.set(seed)

    const ports = content.ports.generate(),
      start = ports.find((port) => port.economy == 'agricultural')

    const startVector = engine.tool.vector3d.unitX()
      .rotateEuler({yaw: start.angle})
      .scale(content.lake.radius())

    start.isDiscovered = true

    return {
      credits: 10,
      dock: start.index,
      inventory: {},
      plus: 0,
      ports,
      position: {
        quaternion: startVector.normalize().inverse().quaternion(),
        x: startVector.x,
        y: startVector.y,
      },
      seed,
      time: 0,
    }
  },
  load: function () {
    engine.state.import(
      this.get()
    )

    return this
  },
  new: function () {
    engine.state.import(
      this.generate()
    )

    return this.save()
  },
  plus: function () {
    const next = this.generate(),
      previous = this.get()

    next.credits = Math.max(previous.credits || 0, 10)
    next.plus = (previous.plus || 0) + 1

    engine.state.import(next)

    return this.save()
  },
  save: function () {
    this.set(
      engine.state.export()
    )

    return this
  },
}
