app.gameState = (() => {
  let isLoaded = false

  return {
    isLoaded: () => isLoaded,
    setLoaded: function (value) {
      isLoaded = Boolean(value)

      return this
    },
  }
})()
