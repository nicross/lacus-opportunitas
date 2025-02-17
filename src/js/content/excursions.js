content.excursions = (() => {
  let count = 0

  return {
    count: () => count,
    export: () => count,
    import: function (value) {
      count = value || 0

      return this
    },
    increment: function () {
      count += 1

      return this
    },
    reset: function () {
      count = 0

      return this
    },
  }
})()

engine.ready(() => {
  content.dock.on('undock', () => content.excursions.increment())
})

engine.state.on('export', (data) => data.excursions = content.excursions.export())
engine.state.on('import', ({excursions}) => content.excursions.import(excursions))
engine.state.on('reset', () => content.excursions.reset())
