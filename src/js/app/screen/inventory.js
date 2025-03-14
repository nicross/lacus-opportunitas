app.screen.inventory = app.screenManager.invent({
  // Attributes
  id: 'inventory',
  parentSelector: '.a-app--inventory',
  rootSelector: '.a-inventory',
  transitions: {
    back: function () {
      this.change('gameMenu')
    },
  },
  // State
  state: {
    components: [],
  },
  // Tutorials
  tutorials: [
    {
      text: `From the <strong>Cargo manifest</strong> you may browse your current cargo. The prices here reflect the current market rate. Cargo space is limited, so manage it attentively!`
    },
    // Level up capacity
    {
      criteria: () => content.inventory.capacity() > 4,
      text: `Remember when you could only hold four goods at a time? It seems that raising the average economic level of the lake lets us ferry more stuff!`,
    },
  ],
  // Hooks
  onReady: function () {
    const root = this.rootElement

    this.tableElement = this.rootElement.querySelector('.a-inventory--table')

    Object.entries({
      back: root.querySelector('.a-inventory--back'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    this.statusComponent = app.component.status.hydrate(
      root.querySelector('.c-status')
    )
  },
  onEnter: function () {
    this.statusComponent.update()

    this.state.components = []
    this.tableElement.innerHTML = ''

    this.state.components = content.inventory.goods().map((good) => {
      const component = app.component.item.create(good)
        .attach(this.tableElement)

      return component
    })

    if (!this.state.components.length) {
      this.tableElement.innerHTML = `
        <tr tabindex="0">
          <td>Empty</td>
        </tr>
      `
    }

    this.rootElement.querySelector('.c-screen--scrollable').scrollTop = 0
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
