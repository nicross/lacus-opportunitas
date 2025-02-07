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

    const numberFormat = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })

    this.port = port

    // Root element
    this.rootElement = document.createElement('tr')
    this.rootElement.ariaDescription = 'Click to travel'
    this.rootElement.className = 'c-port'
    this.rootElement.tabIndex = 0
    this.rootElement.role = 'button'
    this.rootElement.title = 'Click to travel'
    this.rootElement.addEventListener('click', (e) => this.onClick(e))
    this.rootElement.addEventListener('keydown', (e) => this.onKeydown(e))

    this.distance= engine.position.getVector().zeroZ().distance(port)

    this.rootElement.innerHTML = `
      <th class="c-port--name" scope="row">${this.port.name}</th>
      <td class="c-port--type">${port.economy.name} port</td>
      <td class="c-port--distance">&nbsp;at ${numberFormat.format(this.distance / 1000)} <abbr aria-label="kilometers">km</abbr></td>
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
