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

    return `${credits} credits`
  },
  describeInventory: function (isLive) {
    const capacity = content.inventory.capacity(),
      count = content.inventory.count()

    return isLive
      ? `${count}<i aria-hidden="true">/</i><span class="u-screenReader"> of </span>${capacity} cargo`
      : `${count}/${capacity} cargo`
  },
  setLive: function (value) {
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

    this.liveElement.inenrHTML = `${this.describeCredits()}, ${this.describeInventory(true)}`

    return this
  },
}
