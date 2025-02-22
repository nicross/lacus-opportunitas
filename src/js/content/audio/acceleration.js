content.audio.acceleration = (() => {
  const bus = content.audio.channel.default.createBus(),
    rootFrequency = engine.fn.fromMidi(24)

  let airStressAccelerated = 0,
    binaural,
    stressAccelerated = 0,
    synth

  function calculateHeight() {
    if (!content.movement.isJump()) {
      return 0
    }

    const position = engine.position.getVector(),
      surface = content.surface.value(position),
      velocity = content.movement.velocity()

    return engine.fn.clamp(
      engine.fn.scale(
        position.z - surface,
        0, 75,
        0, 1,
      )
    )
  }

  function calculateParameters() {
    const height = calculateHeight(),
      value = content.movement.velocityValue()

    stressAccelerated = engine.fn.accelerateValue(stressAccelerated, calculateStress(), 2)

    const amodDepth = 0.5

    return {
      amodDepth,
      amodFrequency: engine.fn.lerp(1, 12, value),
      carrierGain: 1 - amodDepth,
      color: engine.fn.lerp(16, 32, airStressAccelerated),
      detune: engine.fn.lerp(0, 1200, value + (stressAccelerated * 0.5)) + (1800 * height),
      gain: engine.fn.fromDb(engine.fn.lerp(-9, -15, value)) * (value ** 0.5),
      vector: content.movement.velocity().normalize().rotateEuler({yaw: -engine.position.getEuler().yaw}).inverse(),
      width: engine.fn.randomFloat(0.125, 0.875),
    }
  }

  function calculateStress() {
    if (content.movement.isJump()) {
      airStressAccelerated = engine.fn.accelerateValue(airStressAccelerated, 1, 2)

      return airStressAccelerated
    }

    airStressAccelerated = engine.fn.accelerateValue(airStressAccelerated, 0, 16)

    const move = content.movement.rawInput().move || 0

    if (move == 0) {
      return Math.max(0, airStressAccelerated)
    }

    if (move < 0) {
      return Math.max(content.movement.velocityValue(), airStressAccelerated)
    }

    const velocity = content.movement.velocity().zeroZ()

    const targetVelocity = engine.tool.vector2d.create({
      x: content.movement.calculateSpeedLimit(),
    }).rotate(
      engine.position.getEuler().yaw
    )

    const dot = engine.fn.scale(
      velocity.normalize().dotProduct(targetVelocity.normalize()),
      -1, 1,
      1, 0
    )

    const difference = engine.fn.clamp(
      engine.fn.scale(
        targetVelocity.distance(velocity),
        0, content.movement.maxVelocity(),
        0, 1
      )
    )

    return Math.max(dot, difference, airStressAccelerated)
  }

  function createSynth() {
    const attack = 1/8,
      context = engine.context(),
      now = engine.time()

    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      color,
      detune,
      gain,
      vector,
      width,
    } = calculateParameters()

    synth = engine.synth.pwm({
      frequency: rootFrequency,
      detune,
      gain,
      type: 'sawtooth',
      width,
    }).chainAssign(
      'carrierGain', context.createGain()
    ).chainAssign(
      'fader', context.createGain()
    ).filtered({
      detune,
      frequency: rootFrequency * color,
    })

    synth.assign('amod', engine.synth.lfo({
      depth: amodDepth,
      frequency: amodFrequency,
      type: 'sawtooth',
    }).shaped(engine.shape.triple()))

    synth.amod.connect(synth.carrierGain.gain)
    synth.chainStop(synth.amod)
    synth.carrierGain.gain.value = carrierGain

    synth.fader.gain.setValueAtTime(0, now)
    synth.fader.gain.linearRampToValueAtTime(1, now + attack)

    if (binaural) {
      binaural.destroy()
    }

    binaural = engine.ear.binaural.create({
      filterModel: engine.ear.filterModel.musical.instantiate({
        coneRadius: engine.const.tau * 0.25,
        frequency: rootFrequency,
        minColor: 6,
        maxColor: 16,
        power: 1,
      }),
      gainModel: engine.ear.gainModel.normalize,
      ...vector,
    }).from(synth).to(bus)
  }

  function destroySynth() {
    const now = engine.time(),
      release = 1/8

    engine.fn.rampLinear(synth.fader.gain, 0, release)
    synth.stop(now + release)
    synth = undefined
  }

  function updateSynth() {
    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      color,
      detune,
      gain,
      vector,
      width,
    } = calculateParameters()

    engine.fn.setParam(synth.carrierGain.gain, carrierGain)
    engine.fn.setParam(synth.filter.detune, detune)
    engine.fn.setParam(synth.filter.frequency, rootFrequency * color)
    engine.fn.setParam(synth.param.amod.depth, amodDepth)
    engine.fn.setParam(synth.param.amod.frequency, amodFrequency)
    engine.fn.setParam(synth.param.detune, detune)
    engine.fn.setParam(synth.param.gain, gain)
    engine.fn.setParam(synth.param.width, width)

    binaural.update(vector)
  }

  return {
    reset: function () {
      airStressAccelerated = 0
      stressAccelerated = 0

      if (synth) {
        destroySynth()
      }

      return this
    },
    stressAccelerated: () => stressAccelerated,
    update: function () {
      if (content.movement.velocityValue()) {
        if (!synth) {
          createSynth()
        } else {
          updateSynth()
        }
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.acceleration.update()
})

engine.state.on('reset', () => content.audio.acceleration.reset())
