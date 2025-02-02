app.canvas = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-app--canvas')

    content.gl.setCanvas(root)
    window.addEventListener('resize', onResize)

    onResize()

    engine.loop.on('pause', () => root.classList.add('a-app--canvas-blur'))
    engine.loop.on('resume', () => root.classList.remove('a-app--canvas-blur'))
  })

  function onResize() {
    root.height = root.clientHeight
    root.width = root.clientWidth

    content.gl.recalculate()
  }

  return {}
})()
