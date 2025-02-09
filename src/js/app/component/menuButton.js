document.querySelectorAll('.c-menuButton').forEach((element) => {
  element.addEventListener('keydown', (e) => {
    if (['Enter','NumpadEnter','Space'].includes(e.key)) {
      e.preventDefault()
    }
  })
})
