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
    this.port = port

    // Root element
    this.rootElement = document.createElement('tr')
    this.rootElement.className = 'c-port'
    this.rootElement.tabIndex = 0

    this.rootElement.innerHTML = `
      <th class="c-port--name" scope="row">${this.port.name}</th>
      <td class="c-port--type">${port.economy.name} port</td>
    `

    this.rootElement.ariaLabel = `${this.port.name}, ${port.economy.name} port`

    return this
  },
}
