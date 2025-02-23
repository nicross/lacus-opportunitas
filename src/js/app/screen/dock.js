app.screen.dock = app.screenManager.invent({
  // Attributes
  id: 'dock',
  parentSelector: '.a-app--dock',
  rootSelector: '.a-dock',
  transitions: {
    back: function () {
      const port = content.dock.getPort(),
        vector = engine.tool.vector3d.create(port)

      engine.position.setQuaternion(
        vector.normalize().inverse().quaternion()
      )

      engine.position.setVector(
        vector.subtractRadius(
          content.dock.radius() + content.movement.maxVelocity()
        )
      )

      content.dock.set(undefined)

      this.change('game')
    },
    buy: function () {
      this.change('buy')
    },
    gameMenu: function () {
      this.change('gameMenu')
    },
    sell: function () {
      this.change('sell')
    },
  },
  // State
  state: {},
  // Tutorials
  tutorials: [
    // Introduction
    {
      text: `Welcome to <em>Lacus Opportunatis: Lunar lake trading simulator!</em> We have arrived at an agricultural port with just ten meager credits. First, let's <strong>Buy goods</strong>.`,
    },
    {
      criteria: () => content.inventory.has('essentials'),
      text: `Now, let's turn those essentials into profit! Feel free to look around before we leave. We'll <strong>Undock</strong> at your command.`,
    },
    // Economy types
    {
      criteria: () => content.dock.getPort().economy.id == 'extraction',
      text: () => `Extraction ports like <em>${content.dock.getPort().name}</em> draw a variety of raw ores from the lunar crust. Without them, the more advanced economies around this lake would not exist.`,
    },
    {
      criteria: () => content.dock.getPort().economy.id == 'refinement',
      text: () => `Refinement ports like <em>${content.dock.getPort().name}</em> convert raw ores into usable metals. They bridge the economies of the lake's extraction and manufacturing ports.`,
    },
    {
      criteria: () => content.dock.getPort().economy.id == 'manufacturing',
      text: () => `Manufacturing ports like <em>${content.dock.getPort().name}</em> convert metals into the equipment necessary for everybody else. Therefore, they syngergize well with any trading partner.`,
    },
    {
      criteria: () => content.dock.getPort().economy.id == 'luxury',
      text: () => `Luxury ports like <em>${content.dock.getPort().name}</em> are reknown around the lake for their rare goods. Distributing them to faraway ports could be a marvelous strategy!`,
    },
    // Level up ports
    {
      criteria: () => content.dock.getPort().getTransactionLevel() >= 1,
      text: () => `It seems that your hard work is paying off! Whenever a port levels up, it will offer its goods for a discount, and pay premiums on anything you sell.`,
    },
  ],
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      back: root.querySelector('.a-dock--back'),
      buy: root.querySelector('.a-dock--buy'),
      gameMenu: root.querySelector('.a-dock--gameMenu'),
      sell: root.querySelector('.a-dock--sell'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => {
        if (element.ariaDisabled == 'true') {
          return
        }

        app.screenManager.dispatch(event)
      })
    })
  },
  onEnter: function () {
    const port = content.dock.getPort()

    this.rootElement.querySelector('.a-dock--economyType').innerHTML = port.economy.name
    this.rootElement.querySelector('.a-dock--level').innerHTML = `Level ${port.getTransactionLevel()}`
    this.rootElement.querySelector('.a-dock--portName').innerHTML = port.name
    this.rootElement.querySelector('.a-dock--portName').title = port.name

    this.rootElement.querySelector('.a-dock--back').ariaDisabled = app.storage.tutorial.has(this.id, 1) ? 'false' : 'true'
    this.rootElement.querySelector('.a-dock--gameMenu').ariaDisabled = app.storage.tutorial.has(this.id, 1) ? 'false' : 'true'
    this.rootElement.querySelector('.a-dock--sell').ariaDisabled = app.storage.tutorial.has(this.id, 1) ? 'false' : 'true'
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
  getFocusWithinTarget: function () {
    if (!app.storage.tutorial.has(this.id, 1)) {
      return this.rootElement.querySelector('.a-dock--buy')
    }

    return (this.useBasicFocusMemory ? this.state.focusMemory : undefined) || this.rootElement
  },
})
