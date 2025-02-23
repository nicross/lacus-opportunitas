app.cheat = {}

app.cheat.discoverAll = function () {
  for (const port of content.ports.all()) {
    port.isDiscovered = true
  }

  return this
}
