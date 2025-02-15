content.audio.bottle.collect = () => {
  const bus = content.audio.channel.default.createBus(),
    detune = engine.fn.randomFloat(-12.5, 12.5),
    rootFrequency = engine.fn.fromMidi(72)

  const high = engine.synth.pwm({
    detune: detune - 1200,
    frequency: rootFrequency,
    type: 'triangle',
    width: 0.5,
  }).filtered({
    detune: detune,
    frequency: rootFrequency * 4,
  }).connect(bus)

  const mid = engine.synth.pwm({
    detune: detune + 400,
    frequency: rootFrequency,
    width: 0.5,
  }).filtered({
    detune: detune + 400,
    frequency: rootFrequency,
  }).connect(bus)

  const low = engine.synth.pwm({
    detune: detune,
    frequency: rootFrequency,
    type: 'sawtooth',
    width: 0.5,
  }).filtered({
    detune: detune + 2400,
    frequency: rootFrequency * 0.5,
  }).connect(bus)

  const duration = engine.fn.randomFloat(0.5, 0.75),
    gain = engine.fn.fromDb(-6),
    now = engine.time()

  high.param.detune.linearRampToValueAtTime(detune + 700, now + duration/16)
  low.filter.detune.linearRampToValueAtTime(detune - 1200, now + duration/2)
  low.param.detune.linearRampToValueAtTime(detune - 3600, now + duration/12)

  high.param.gain.linearRampToValueAtTime(gain/2, now + 1/32)
  high.param.gain.linearRampToValueAtTime(gain/8, now + duration/4)
  high.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

  mid.param.gain.linearRampToValueAtTime(gain/4, now + duration/3 - 1/32)
  mid.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration/3)

  low.param.gain.exponentialRampToValueAtTime(gain, now + 1/32)
  low.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration/3)

  high.stop(now + duration)
  mid.stop(now + duration/3)
  low.stop(now + duration/3)
}

content.bottles.on('collect', () => content.audio.bottle.collect())
