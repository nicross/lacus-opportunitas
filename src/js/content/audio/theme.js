content.audio.theme = (() => {
  const bus = content.audio.channel.bypass.createBus(),
    context = engine.context(),
    input = context.createGain()

  const reverb = engine.mixer.reverb.send.create({
    gainModel: engine.mixer.reverb.gainModel.normalize.instantiate({
      gain: engine.fn.fromDb(-1.5),
    })
  }).from(input)

  input.connect(bus)

  const sequence = [
    // Section 1
    // Section 1.1 (0 - 39)
    57,60,62,64,67,69,67,64,62,60,
    57,60,62,64,67,69,67,64,62,60,
    57,60,62,64,67,69,67,64,62,60,
    57,60,62,64,67,69,67,64,62,60,
    // Section 1.2 (40 - 79)
    55,59,60,62,67,69,67,62,60,59,
    55,59,60,62,67,69,67,62,60,59,
    55,59,60,62,67,69,67,62,60,59,
    55,59,60,62,67,69,67,62,60,59,
    // Section 1.3 (80 - 119)
    53,57,59,60,67,69,67,60,59,57,
    53,57,59,60,67,69,67,60,59,57,
    53,57,59,60,67,69,67,60,59,57,
    53,57,59,60,67,69,72,69,67,64,

    // Section 2
    // Section 2.1 (120 - 159)
    57,60,62,64,67,69,72,64,62,60,
    57,60,62,64,67,69,72,69,62,60,
    57,60,62,64,67,69,72,64,62,60,
    57,60,62,64,67,69,72,69,62,60,
    // Section 2.2 (160 - 199)
    55,59,60,62,67,69,72,62,60,59,
    55,59,60,62,67,69,72,69,60,59,
    55,59,60,62,67,69,72,62,60,59,
    55,59,60,62,67,69,72,69,60,59,
    // Section 2.3 (200 - 239)
    53,57,59,60,67,69,72,60,59,57,
    53,57,59,60,67,69,72,69,59,57,
    53,57,59,67,69,53,72,60,59,57,
    53,57,59,67,69,53,72,76,67,64,

    // Section 3
    // Section 3.1 (240 - 279)
    57,60,62,64,67,57,69,76,72,67,
    57,67,64,62,60,57,69,76,72,60,
    57,60,62,64,67,57,69,76,72,67,
    57,67,64,62,60,57,69,76,72,60,
    // Section 3.2 (280 - 319)
    55,59,60,62,67,55,69,76,72,67,
    55,67,62,60,59,55,69,76,72,60,
    55,59,60,62,67,55,69,76,72,67,
    55,67,62,60,59,55,69,76,72,60,
    // Section 3.2 (320 - 359)
    53,57,59,60,67,53,69,76,72,67,
    53,67,60,59,57,53,69,76,72,59,
    53,57,59,60,67,53,69,76,72,67,
    53,67,60,59,57,53,69,76,72,59,

    // Section 4
    // Section 4.1 (360 - 399)
    57,60,62,64,67,57,77,72,69,67,
    57,64,62,60,67,57,79,74,72,67,
    57,60,62,64,67,57,81,72,69,67,
    57,64,62,60,67,57,79,72,71,67,
    // Section 4.2 (400 - 439)
    55,59,60,62,67,55,81,72,69,67,
    55,62,60,59,67,55,83,72,71,67,
    55,59,60,62,67,55,81,72,69,67,
    55,62,60,59,67,55,83,72,71,67,
    // Section 4.2 (440 - 479)
    53,57,59,60,67,53,84,72,69,67,
    53,60,59,57,67,53,83,72,71,67,
    53,57,59,60,67,53,84,74,71,67,
    53,60,72,76,69,53,86,67,77,72,

    // Section 5
    // Section 5.1 (480 - 519)
    57,60,62,76,72,57,84,67,72,71,
    57,64,62,74,72,57,84,67,72,71,
    57,60,62,76,72,57,86,67,72,71,
    57,67,64,74,72,57,88,67,72,71,
    // Section 5.2 (520 - 559)
    55,59,60,76,72,55,86,67,72,71,
    55,62,60,74,72,55,86,67,72,71,
    55,59,60,76,72,55,88,67,72,71,
    55,64,62,74,72,55,89,67,72,71,
    // Section 5.2 (560 - 599)
    53,57,59,77,76,53,88,67,72,71,
    53,60,59,74,72,53,88,67,72,71,
    53,57,59,77,76,53,89,67,76,74,
    55,71,60,59,69,62,91,67,76,72,

    // Section 6
    // Section 6.1 (600 - 639)
    57,60,62,64,72,93,69,67,72,71,
    64,62,60,57,72,93,69,67,72,71,
    57,60,62,64,72,93,69,67,72,71,
    64,62,60,57,72,93,69,67,72,71,
    // Section 6.2 (640 - 679)
    57,60,62,64,72,93,69,67,72,71,
    64,62,60,57,72,93,69,67,72,71,
    57,60,62,64,72,93,69,67,72,71,
    64,62,60,57,72,93,0,0,0,0,
    // Section 6.3 (680 - 719)
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
  ].map((note) => note ? engine.fn.fromMidi(note) : 0)

  let index = 0,
    isDucked,
    isPlaying

  function trigger() {
    if (!isPlaying) {
      return
    }

    const duration = 1/10,
      frequency = sequence[index],
      now = engine.time()

    if (frequency) {
      const progress = index < 600
        ? engine.fn.clamp(engine.fn.scale(index, 0, 600, 0, 1))
        : engine.fn.clamp(engine.fn.scale(index, 600, 675, 1, 0)) ** 0.5

      const compensation = engine.fn.fromDb(engine.fn.lerp(0, -6, engine.fn.clamp(engine.fn.scale(
        Math.log2(frequency),
        7, 12,
        0, 1,
      ))))

      const synth = engine.synth.simple({
        frequency,
        gain: engine.fn.fromDb(engine.fn.lerp(-9, -18, progress)) * compensation,
        type: 'sawtooth',
      }).filtered({
        frequency: frequency * engine.fn.lerpExp(0.5, isDucked ? 0.5 : 4, progress, 2),
      }).connect(input)

      const release = engine.fn.lerpExp(1/20, 1, progress, 3)

      engine.fn.rampLinear(synth.param.gain, 0, release - engine.const.zeroTime)
      synth.stop(now + release)
    }

    // Set timer for next note
    const timer = context.createConstantSource()

    timer.onended = trigger
    timer.start()
    timer.stop(now + duration)

    index = (index + 1) % sequence.length
  }

  return {
    duck: function () {
      isDucked = true
      engine.fn.rampLinear(bus.gain, 0, 1/8)

      return this
    },
    play: function () {
      if (isPlaying) {
        return this
      }

      index = 0
      isPlaying = true

      trigger()

      return this
    },
    stop: function () {
      isPlaying = false

      return this
    },
    unduck: function () {
      isDucked = false
      engine.fn.rampLinear(bus.gain, 1, 1/8)

      return this
    },
  }
})()
