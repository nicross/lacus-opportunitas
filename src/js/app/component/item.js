app.component.item = {}

app.component.item.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.item.prototype = {
  attach: function (element) {
    element.appendChild(this.rootElement)
    return this
  },
  construct: function (good = {}) {
    this.good = good

    // Root element
    this.rootElement = document.createElement('tr')
    this.rootElement.className = 'c-item'
    this.rootElement.tabIndex = 0

    // Row data
    const numberFormat = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    })

    const baseCost = numberFormat.format(this.good.getBaseCost()),
      quantity = numberFormat.format(content.inventory.get(this.good.id))

    this.rootElement.innerHTML = `
      <th class="c-item--name" scope="row">${this.good.name}</th>
      <td class="c-item--quantity">${quantity}&nbsp;×&nbsp;</td>
      <td class="c-item--price">${baseCost} credits</td>
    `

    this.rootElement.ariaLabel = `${this.good.name}, ${quantity} in cargo, ${numberFormat.format(this.good.getBaseCost())} credits`

    return this
  },
}
