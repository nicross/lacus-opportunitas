content.plus = (() => {
  let count = 0

  return {
    count: () => count,
    export: () => count,
    import: function (value) {
      count = value || 0

      return this
    },
    is: () => count > 0,
    reset: function () {
      count = 0

      return this
    },
  }
})()

engine.state.on('export', (data) => data.plus = content.plus.export())
engine.state.on('import', ({plus}) => content.plus.import(plus))
engine.state.on('reset', () => content.plus.reset())
