content.audio.ports.synth = {}

content.audio.ports.synth.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.audio.ports.synth.prototype = {
  calculateParameters: function () {
    const distance = this.port.getDistance(),
      dot = this.port.getDot(),
      isPaused = engine.loop.isPaused()

    const carrierFrequency = this.port.rootFrequency,
      octave = engine.fn.clamp(engine.fn.scale(Math.log2(carrierFrequency), 5, 10, 0, 1))

    const isTarget = isPaused
      ? 0
      : (content.ports.target.is(this.port) ? 1 : 0)

    this.fadeAccelerated = 'fadeAccelerated' in this
      ? engine.fn.accelerateValue(this.fadeAccelerated, 1, 2 / this.port.primeNumber)
      : (isTarget ? 1 : 0)

    this.isTargetAccelerated = 'isTargetAccelerated' in this
      ? engine.fn.accelerateValue(this.isTargetAccelerated, isTarget, 8)
      : isTarget

    this.isPausedAccelerated = 'isPausedAccelerated' in this
      ? engine.fn.accelerateValue(this.isPausedAccelerated, isPaused, 8)
      : isPaused

    const amodDepth = engine.fn.fromDb(
      engine.fn.lerp(-4.5, -6, this.isTargetAccelerated)
    )

    const gain = Math.max(this.isTargetAccelerated, (this.fadeAccelerated ** 8))
      * engine.fn.fromDb(
          engine.fn.lerp(-9, 0, Math.max(this.isTargetAccelerated, 1 - distance))
        )
      * engine.fn.fromDb(
          engine.fn.lerp(
            0, engine.fn.lerp(-9, -12, this.isTargetAccelerated),
            octave
          )
        )
      * engine.fn.fromDb(
          engine.fn.lerp(0, -3, this.isPausedAccelerated)
        )

    return {
      amodDepth,
      amodFrequency: engine.fn.lerp(1 / this.port.primeNumber, engine.fn.lerpExp(16, 4, distance, 0.5) * engine.fn.lerpExp(0.25, 1, dot, 2), this.isTargetAccelerated),
      carrierFrequency,
      carrierGain: 1 - amodDepth,
      color: engine.fn.lerp(
        engine.fn.lerp(engine.fn.lerpExp(4, 2, octave, 0.5), engine.fn.lerpExp(12, 2, octave, 0.5), this.isTargetAccelerated),
        1,
        this.isPausedAccelerated,
      ),
      minColor: engine.fn.lerp(0.5, 2, this.isTargetAccelerated),
      fmodDepth: carrierFrequency * 0.5,
      fmodFrequency: carrierFrequency * 0.5,
      gain,
      vector: this.port.getRelative(),
    }
  },
  construct: function ({
    bus,
    port,
  }) {
    this.port = port

    const {
      amodDepth,
      amodFrequency,
      carrierFrequency,
      carrierGain,
      color,
      fmodDepth,
      fmodFrequency,
      gain,
      minColor,
      vector,
    } = this.calculateParameters()

    this.synth = engine.synth.mod({
      amodDepth,
      amodFrequency,
      carrierFrequency,
      carrierGain,
      carrierType: 'sawtooth',
      fmodDepth,
      fmodFrequency,
      fmodtype: 'sawtooth',
      minColor,
      gain,
    }).filtered({
      frequency: carrierFrequency * color,
    })

    this.binaural = engine.ear.binaural.create({
      filterModel: engine.ear.filterModel.musical.instantiate({
        coneRadius: 0.25 * engine.const.tau,
        frequency: carrierFrequency,
        maxColor: 8,
        minColor,
        power: 2,
      }),
      gainModel: engine.ear.gainModel.normalize.instantiate({
        gain: engine.fn.fromDb(-12),
      }),
      ...vector,
    }).from(this.synth).to(bus)

    return this
  },
  destroy: function () {
    const release = 1

    engine.fn.rampLinear(this.synth.param.gain, 0, release)
    this.synth.stop(engine.time(release))

    setTimeout(() => this.binaural.destroy(), release * 1000)

    return this
  },
  update: function () {
    const {
      amodDepth,
      amodFrequency,
      carrierFrequency,
      carrierGain,
      color,
      fmodDepth,
      fmodFrequency,
      gain,
      minColor,
      vector,
    } = this.calculateParameters()

    engine.fn.setParam(this.synth.filter.frequency, carrierFrequency * color)
    engine.fn.setParam(this.synth.param.amod.depth, amodDepth)
    engine.fn.setParam(this.synth.param.amod.frequency, amodFrequency)
    engine.fn.setParam(this.synth.param.carrierGain, carrierGain)
    engine.fn.setParam(this.synth.param.fmod.depth, fmodDepth)
    engine.fn.setParam(this.synth.param.fmod.frequency, fmodFrequency)
    engine.fn.setParam(this.synth.param.gain, gain)

    this.binaural.left.filterModel.options.minColor = minColor
    this.binaural.right.filterModel.options.minColor = minColor
    this.binaural.update(vector)

    return this
  },
}
