app.storage.game = {
  clear: () => app.storage.clear('game'),
  has: () => app.storage.has('game'),
  get: () => app.storage.get('game'),
  set: (value) => app.storage.set('game', value),
  // Helpers
  new: function () {
    this.clear()

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
