app.storage.tutorial = {
  clear: () => app.storage.clear('tutorial'),
  get: () => new Set(app.storage.has('tutorial') ? app.storage.get('tutorial') : []),
  set: function (keys) {
    app.storage.set('tutorial', new Set(keys))
    return this
  },
  // Helpers
  add: function (screen, index) {
    const key = [screen, index].join('~'),
      keys = this.get()

    keys.add(key)

    return this.set(keys)
  },
  has: function (screen, index) {
    const key = [screen, index].join('~')
    return this.get().has(key)
  },
  remove: function (screen, index) {
    const key = [screen, index].join('~'),
      keys = this.get()

    keys.remove(key)

    return this.set(keys)
  },
}
