app.component.port = {}

app.component.port.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.port.prototype = {
  attach: function (element) {
    element.appendChild(this.rootElement)
    return this
  },
  construct: function (port = {}) {
    engine.tool.pubsub.decorate(this)

    const numberFormat1 = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })

    const numberFormat2 = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    })

    this.port = port

    // Root element
    this.rootElement = document.createElement('tr')
    this.rootElement.className = 'c-port'
    this.rootElement.tabIndex = 0
    this.rootElement.role = 'button'
    this.rootElement.addEventListener('click', (e) => this.onClick(e))
    this.rootElement.addEventListener('keydown', (e) => this.onKeydown(e))

    const isDocked = port === content.dock.getPort()

    if (isDocked) {
      this.rootElement.ariaDisabled = 'true'
    } else {
      this.rootElement.ariaDescription = 'Click to travel'
      this.rootElement.title = 'Click to travel'
    }

    const distance = numberFormat1.format(engine.position.getVector().zeroZ().distance(port) / 1000),
      level = numberFormat2.format(port.getTransactionLevel())

    this.rootElement.innerHTML = `
      <th class="c-port--name" scope="row">${this.port.name}${level > 0 ? ` <abbr aria-label="Level ${level}">+${level}</abbr>` : ''}</th>
      <td class="c-port--type">${port.economy.name} port</td>
      <td class="c-port--distance">&nbsp;at ${isDocked ? '0.00' : distance} <abbr aria-label="kilometers">km</abbr></td>
    `

    return this
  },
  onClick: function (e) {
    if (this.rootElement.ariaDisabled == 'true') {
      return this
    }

    this.emit('click')

    return this
  },
  onKeydown: function (e) {
    if (e.code == 'Enter' || e.code == 'NumpadEnter' || e.code == 'Space') {
      e.preventDefault()
      e.stopPropagation()

      this.rootElement.click()
    }

    return this
  },
}
