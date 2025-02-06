content.economies.base = {
  // Properties
  id: undefined,
  name: '',
  buys: [],
  sells: [],
  luxuryGood: false,
  // Methods
  getBuying: function (id) {
    return this.buys.map((id) => content.goods.get(id))
  },
  getSelling: function () {
    return this.sells.map((id) => content.goods.get(id))
  },
}
