content.audio.jumpLandings = (value) => {
  value **= 1.5

  const bus = content.audio.channel.default.createBus(),
    frequency = engine.fn.fromMidi(36),
    gain = engine.fn.fromDb(engine.fn.lerp(-18, -9, value))

  const synth = engine.synth.pwm({
    frequency,
    width: engine.fn.randomFloat(0.25, 0.75),
  }).shaped(
    engine.shape.noise4()
  ).filtered({
    frequency,
  }).connect(bus)

  const attack = 1 / engine.fn.lerp(64, 16, value),
    now = engine.time(),
    release = 1 / engine.fn.lerp(8, 2, value)

  synth.param.gain.linearRampToValueAtTime(gain, now + attack)
  synth.param.gain.linearRampToValueAtTime(0, now + release)
  synth.stop(now + release)
}

engine.ready(() => {
  content.movement.on('surface', (value) => content.audio.jumpLandings(value))
})
