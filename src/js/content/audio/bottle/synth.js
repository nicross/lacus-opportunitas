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
        minColor: 2,
        maxColor: 8,
        power: 2,
      }),
      gainModel: engine.ear.gainModel.linear.instantiate({
        maxDistance: content.bottles.maxDistance(),
        maxGain: engine.fn.fromDb(-21),
        minGain: engine.fn.fromDb(-30),
      }),
      ...content.bottles.relativeVector(),
    }).from(this.fader).to(bus)

    this.index = engine.fn.randomInt(0, 19)
    this.timer = 1

    this.notes = content.audio.theme.randomSequenceSlice(20)

    const subFrequency = engine.fn.transpose(
      this.notes[0],
      engine.fn.fromMidi(30),
      engine.fn.fromMidi(36),
    )

    this.sub = engine.synth.pwm({
      frequency: subFrequency,
      gain: engine.fn.fromDb(0),
      type: 'sawtooth',
      width: 0.5,
    }).filtered({
      detune: 0,
      frequency: subFrequency,
    }).connect(this.fader)

    this.stab()

    return this
  },
  destroy: function () {
    const now = engine.time(),
      release = 1/4

    engine.fn.rampLinear(this.fader.gain, 0, release - engine.const.zeroTime)
    this.sub.stop(now + release)
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
      ) / content.bottles.maxDistance()
    )

    this.timer = engine.fn.accelerateValue(this.timer, 0, engine.fn.lerp(2, 4, distanceRatio))

    if (!this.timer) {
      this.index = (this.index + 1) % this.notes.length
      this.timer = 1

      this.stab()
    }

    engine.fn.setParam(this.sub.filter.detune, engine.fn.lerpExp(0, 8, content.bottles.dot(), 5) * 1200)

    this.binaural.update(
      content.bottles.relativeVector()
    )

    return this
  },
}
