app.screen.game.port = {
  currentDistance: undefined,
  currentPort: undefined,
  rootElement: undefined,
  onReady: function () {
    this.rootElement = app.screen.game.rootElement.querySelector('.a-game--port')

    this.liveElement = this.rootElement.querySelector('.a-game--portLive')
    this.visualElement = this.rootElement.querySelector('.a-game--portVisual')
  },
  onEnter: function () {
    this.onFrame()

    this.liveElement.setAttribute('aria-live', 'assertive')
  },
  onExit: function () {
    this.currentDistance = undefined
    this.currentPort = undefined

    this.liveElement.removeAttribute('aria-live')
    this.liveElement.innerHTML = ''
  },
  onFrame: function () {
    const numberFormat = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })

    const facing = content.ports.facing(),
      position = engine.position.getVector()

    const distance = position.distance(facing) / 1000,
      distanceRounded1 = numberFormat.format(distance),
      distanceRounded2 = numberFormat.format(Math.ceil(distance * 4) / 4),
      name = facing.isDiscovered ? facing.name : 'Unknown'

    this.visualElement.innerHTML = facing.isDiscovered
      ? `${facing.name}<br />${facing.economy.name} port<br />${distanceRounded1} km`
      : `Unknown<br />Dock to discover<br />${distanceRounded1} km`

    if (this.currentPort !== facing || this.currentDistance != distanceRounded2) {
      this.liveElement.innerHTML = this.currentPort === facing
        ? `${distanceRounded2} kilometer${distanceRounded2 == 1 ? '' : 's'}`
        : (
          facing.isDiscovered
            ? `${facing.name}, ${facing.economy.name} port, ${distanceRounded2} kilometer${distanceRounded2 == 1 ? '' : 's'}`
            : `Unknown, Dock to discover, ${distanceRounded2} kilometer${distanceRounded2 == 1 ? '' : 's'}`
        )
    }

    this.currentDistance = distanceRounded2
    this.currentPort = facing
  },
}
