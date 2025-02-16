content.audio.dock.synth = {}

content.audio.dock.synth.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.audio.dock.synth.prototype = {
  construct: function ({
    bus,
    index,
    port,
  }) {
    const context = engine.context()

    this.index = index
    this.port = port

    this.primeNumber = port.primeNumbers[index]
    this.rootFrequency = port.triadFrequenciesTransposed[index]

    this.synth = engine.synth.am({
      carrierFrequency: this.rootFrequency,
      carrierGain: index == 0 ? 1/3 : 1/2,
      carrierType: 'sawtooth',
      gain: engine.fn.fromDb(-15),
      modDepth: index == 0 ? 2/3 : 1/2,
      modFrequency: 1 / this.primeNumber,
    }).filtered({
      frequency: this.rootFrequency * (index == 0 ? 2 : 1),
    }).chainAssign(
      'fader', context.createGain()
    ).chainAssign(
      'panner', context.createStereoPanner()
    ).connect(
      bus
    )

    const filterLfo = engine.synth.lfo({
      depth: 1200,
      frequency: 1 / this.primeNumber / 5,
    }).connect(this.synth.filter.detune)

    this.synth.chainStop(filterLfo)

    const panLfo = engine.synth.lfo({
      depth: [0, -0.333, 0.333][index],
      frequency: 1 / this.primeNumber / 3,
    }).connect(this.synth.panner.pan)

    this.synth.chainStop(panLfo)

    this.synth.fader.gain.value = 0
    engine.fn.rampLinear(this.synth.fader.gain, 1, index == 0 ? 2 : this.primeNumber)

    return this
  },
  destroy: function (release = 1) {
    engine.fn.rampLinear(this.synth.param.gain, 0, release)
    this.synth.stop(engine.time(release))

    return this
  },
}
