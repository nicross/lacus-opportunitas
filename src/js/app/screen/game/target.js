app.screen.game.port = {
  currentDistance: undefined,
  currentPort: undefined,
  rootElement: undefined,
  onReady: function () {
    this.rootElement = app.screen.game.rootElement.querySelector('.a-game--target')

    this.liveElement = this.rootElement.querySelector('.a-game--targetLive')
    this.visualElement = this.rootElement.querySelector('.a-game--targetVisual')
  },
  onEnter: function () {
    this.liveElement.setAttribute('aria-live', 'assertive')
  },
  onExit: function () {
    delete this.currentDistance
    delete this.currentPort

    this.liveElement.removeAttribute('aria-live')
    this.liveElement.innerHTML = ''
  },
  onFrame: function () {
    const numberFormat1 = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })

    const numberFormat2 = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })

    const numberFormat3 = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    })

    const port = content.ports.target.get(),
      position = engine.position.getVector()

    if (!port) {
      delete this.currentDistance
      delete this.currentPort

      this.liveElement.innerHTML = ''
      this.visualElement.innerHTML = ''

      this.visualElement.hidden = true

      return
    }

    this.visualElement.hidden = false

    const distance = position.distance(port) / 1000,
      distanceRounded1 = numberFormat1.format(distance),
      distanceRounded2 = numberFormat2.format(Math.ceil(distance * 4) / 4),
      level = numberFormat3.format(port.getTransactionLevel()),
      name = port.isDiscovered ? port.name : 'Unknown'

    this.visualElement.innerHTML = port.isDiscovered
      ? `[${port.name}${level > 0 ? ' +' + level : ''}]<br />${port.economy.name} port<br />${distanceRounded1} km`
      : `[Unknown port]<br />Dock to discover<br />${distanceRounded1} km`

    if (this.currentPort !== port || this.currentDistance != distanceRounded2) {
      this.liveElement.innerHTML = this.currentPort === port
        ? `${distanceRounded2} kilometer${distanceRounded2 == 1 ? '' : 's'}`
        : (
          port.isDiscovered
            ? `${port.name},${level > 0 ? ' Level ' + level : ''} ${port.economy.name} port, ${distanceRounded1} kilometer${distanceRounded1 == 1 ? '' : 's'}`
            : `Unknown port, Dock to discover, ${distanceRounded2} kilometer${distanceRounded1 == 1 ? '' : 's'}`
        )
    }

    this.currentDistance = distanceRounded2
    this.currentPort = port
  },
}
