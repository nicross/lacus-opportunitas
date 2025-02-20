app.component.status = {}

app.component.status.hydrate = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.status.prototype = {
  construct: function (root) {
    this.rootElement = root

    this.creditsElement = root.querySelector('.c-status--credits')
    this.inventoryElement = root.querySelector('.c-status--inventory')
    this.liveElement = root.querySelector('.c-status--live')

    return this
  },
  describeCredits: function () {
    const numberFormat = Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    })

    const credits = numberFormat.format(
      content.credits.value()
    )

    return `${credits} credit${credits == 1 ? '' : 's'}`
  },
  describeInventory: function () {
    const capacity = content.inventory.capacity(),
      count = content.inventory.count()

    return `${count} of ${capacity} cargo`
  },
  setLive: function (value) {
    if (!this.liveElement) {
      return this
    }

    this.liveElement.innerHTML = ''

    if (value) {
      this.liveElement.setAttribute('aria-live', 'polite')
    } else {
      this.liveElement.removeAttribute('aria-live')
    }

    return this
  },
  update: function () {
    this.creditsElement.innerHTML = this.describeCredits()
    this.inventoryElement.innerHTML = this.describeInventory()

    const label = `${this.describeInventory()}, ${this.describeCredits()}`

    this.rootElement.ariaLabel = label

    if (this.liveElement) {
      this.liveElement.innerHTML = label
    }

    return this
  },
}
