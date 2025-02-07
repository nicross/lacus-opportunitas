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
  },
  onExit: function () {},
  onFrame: function () {
    this.handleBasicInput()
  },
})
