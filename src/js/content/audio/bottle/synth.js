content.audio.bottle.synth = {}

content.audio.bottle.synth.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.audio.bottle.synth.prototype = {
  construct: function ({
    bus,
  }) {
    this.fader = engine.context().createGain()
    this.fader.gain.value = 0
    engine.fn.rampLinear(this.fader.gain, 1, 1/16)

    this.binaural = engine.ear.binaural.create({
      filterModel: engine.ear.filterModel.musical.instantiate({
        coneRadius: engine.const.tau * 0.25,
        frequency: engine.fn.fromMidi(72),
        minColor: 0.5,
        maxColor: 6,
        power: 2,
      }),
      gainModel: engine.ear.gainModel.linear.instantiate({
        maxDistance: 250,
        maxGain: engine.fn.fromDb(-24),
        minGain: engine.fn.fromDb(-36),
      }),
      ...content.bottles.relativeVector(),
    }).from(this.fader).to(bus)

    this.index = engine.fn.randomInt(0, 9)
    this.timer = 1

    this.notes = engine.fn.shuffle([
      60, 62, 64, 67, 69,
      72, 74, 76, 79, 81,
    ]).map((note) => engine.fn.fromMidi(note))

    this.stab()

    return this
  },
  destroy: function () {
    const release = 1/4

    engine.fn.rampLinear(this.fader.gain, 0, release)
    setTimeout(() => this.binaural.destroy(), release * 1000)

    return this
  },
  stab: function () {
    const synth = engine.synth.pwm({
      detune: engine.fn.randomFloat(-12.5, 12.5),
      frequency: this.notes[this.index],
      width: engine.fn.randomFloat(0.25, 0.75),
    }).connect(this.fader)

    const attack = 0.5,
      now = engine.time(),
      release = 1

    synth.param.gain.linearRampToValueAtTime(1, now + attack)
    synth.param.gain.linearRampToValueAtTime(0, now + release)
    synth.stop(engine.time(release))

    return this
  },
  update: function () {
    const distanceRatio = 1 - engine.fn.clamp(
      engine.position.getVector().distance(
        content.bottles.vector()
      ) / 250
    )

    this.timer = engine.fn.accelerateValue(this.timer, 0, engine.fn.lerp(2, 4, distanceRatio))

    if (!this.timer) {
      this.index = (this.index + 1) % this.notes.length
      this.timer = 1

      this.stab()
    }

    this.binaural.update(
      content.bottles.relativeVector()
    )

    return this
  },
}
