app.component.buyable = {}

app.component.buyable.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.buyable.prototype = {
  attach: function (element) {
    element.appendChild(this.rootElement)
    return this
  },
  construct: function (good = {}) {
    this.good = good
    engine.tool.pubsub.decorate(this)

    // Root element
    this.rootElement = document.createElement('tr')
    this.rootElement.ariaDescription = 'Click to buy'
    this.rootElement.className = 'c-buyable'
    this.rootElement.tabIndex = 0
    this.rootElement.role = 'button'
    this.rootElement.title = 'Click to buy'
    this.rootElement.addEventListener('click', (e) => this.onClick(e))
    this.rootElement.addEventListener('keydown', (e) => this.onKeydown(e))

    // Row data
    const numberFormat = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    })

    this.cost = this.good.getBuyCost(
      content.dock.getPort()
    )

    this.rootElement.innerHTML = `
      <th class="c-buyable--name" scope="row">${this.good.name}</th>
      <td class="c-buyable--price">${numberFormat.format(this.cost)} credit${this.cost == 1 ? '' : 's'}</td>
    `

    this.update()

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
    if (['Enter','NumpadEnter','Space'].includes(e.key)) {
      e.preventDefault()
    }

    return this
  },
  update: function () {
    this.rootElement.ariaDisabled = content.inventory.isFull() || !content.credits.has(this.cost) ? 'true' : 'false'

    return this
  },
}
