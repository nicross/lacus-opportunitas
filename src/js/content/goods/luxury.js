content.goods.luxury = engine.fn.extend(content.goods.base, {
  getPort: function () {
    return content.ports.get(this.port)
  },
})
