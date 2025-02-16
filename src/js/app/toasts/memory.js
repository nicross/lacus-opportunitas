app.toasts.memory = (() => {
  let inventoryCapacity = 0,
    portLevel = 0

  return {
    check: function () {
      const port = content.dock.getPort()

      const nextInventoryCapacity = content.inventory.capacity(),
        nextPortLevel = port.getTransactionLevel()

      if (nextInventoryCapacity > inventoryCapacity) {
        app.toasts.enqueue(`<strong>Max cargo increased</strong>`)
        inventoryCapacity = nextInventoryCapacity
      }

      if (nextPortLevel > portLevel) {
        app.toasts.enqueue(`<strong>Port level increased</strong>`)
        portLevel = nextPortLevel
      }

      return this
    },
    remember: function () {
      inventoryCapacity = content.inventory.capacity()
      portLevel = content.dock.getPort().getTransactionLevel()

      return this
    },
  }
})()
