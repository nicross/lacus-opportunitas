app.component.sellable = {}

app.component.sellable.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.sellable.prototype = {
  attach: function (element) {
    element.appendChild(this.rootElement)
    return this
  },
  construct: function (good = {}) {
    this.good = good
    engine.tool.pubsub.decorate(this)

    // Root element
    this.rootElement = document.createElement('tr')
    this.rootElement.ariaDescription = 'Click to sell'
    this.rootElement.className = 'c-sellable'
    this.rootElement.tabIndex = 0
    this.rootElement.role = 'button'
    this.rootElement.title = 'Click to sell'
    this.rootElement.addEventListener('click', (e) => this.onClick(e))
    this.rootElement.addEventListener('keydown', (e) => this.onKeydown(e))

    // Row data
    const numberFormat = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    })

    this.cost = this.good.getSellCost(
      content.dock.getPort()
    )

    this.rootElement.innerHTML = `
      <th class="c-sellable--name" scope="row">${this.good.name}</th>
      <td class="c-sellable--price">${numberFormat.format(this.cost)} credits</td>
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
    if (e.code == 'Enter' || e.code == 'NumpadEnter' || e.code == 'Space') {
      e.preventDefault()
      e.stopPropagation()

      this.rootElement.click()
    }

    return this
  },
  update: function () {
    this.rootElement.ariaDisabled = !content.inventory.has(this.good.id) ? 'true' : 'false'

    return this
  },
}
