content.audio.surfaceDirectional = (() => {
  const binaurals = [],
    synths = []

  const filterModel = engine.ear.filterModel.musical.extend({
    defaults: {
      coneRadius: 0.25 * engine.const.tau,
      frequency: 100,
      maxColor: 25,
      minColor: 1,
      power: 2,
    },
  })

  const modDepthField = engine.fn.createNoise({
    octaves: 4,
    seed: ['surfaceDirectional', 'modDepth'],
    type: 'simplex2d',
  })

  const modFrequencyField = engine.fn.createNoise({
    octaves: 4,
    seed: ['surfaceDirectional', 'modFrequency'],
    type: 'simplex2d',
  })

  function calculateParameters(index) {
    const point = findSurface(index),
      time = content.time.value()

    const strength = engine.fn.clamp(point.z / 60)
    const modDepth = engine.fn.fromDb(engine.fn.lerp(-12, -9, modDepthField.value(index * 3, time / 3 / 4)))

    return {
      carrierGain: 1 - modDepth,
      frequency: engine.fn.lerpExp(50, 4000, strength, 0.5),
      gain: engine.fn.fromDb(-12) * (strength ** 0.25),
      modDepth,
      modFrequency: engine.fn.lerp(8, 16, modFrequencyField.value(index * 3, time / 3 / 4)),
    }
  }

  function createBinaurals() {
    const bus = content.audio.channel.default.createBus()

    for (let i = 0; i < 5; i += 1) {
      binaurals.push(
        engine.ear.binaural.create({
          filterModel,
          ...engine.tool.vector2d.unitX().rotate(i * engine.const.tau/5),
        }).to(bus)
      )
    }
  }

  function createSynth(index) {
    const {
      carrierGain,
      frequency,
      gain,
      modDepth,
      modFrequency,
    } = calculateParameters(index)

    const synth = engine.synth.amBuffer({
      carrierGain,
      buffer: content.audio.buffer.pinkNoise.get(index),
      gain,
      modDepth,
      modFrequency,
    }).filtered({
      frequency,
    })

    binaurals[index].from(synth)

    return synth
  }

  function createSynths(value) {
    for (let i = 0; i < 5; i += 1) {
      synths.push(
        createSynth(i)
      )
    }
  }

  function destroyBinaurals() {
    for (const binaural of binaurals) {
      binaural.destroy()
    }

    binaurals.length = 0
  }

  function destroySynths() {
    const now = engine.time(),
      release = 1/16

    for (const synth of synths) {
      engine.fn.rampLinear(synth.param.gain, 0, release)
      synth.stop(now + release)
    }

    synths.length = 0
  }

  function findSurface(index) {
    const maxDistance = 50,
      position = engine.position.getVector()

    const {x: dx, y: dy} = engine.tool.vector2d.unitX().rotate(
      (index * engine.const.tau/5) + engine.position.getEuler().yaw
    )

    let max = {x: position.x, y: position.y, z: 0},
      next = {x: position.x, y: position.y, z: 0}

    for (let d = 0; d < maxDistance; d += 1) {
      next.x += dx
      next.y += dy

      const z = content.surface.value(next, true)

      if (z > max.z) {
        max.distance = d
        max.x = next.x
        max.y = next.y
        max.z = z
      }
    }

    max.distance /= maxDistance

    return max
  }

  function updateSynth(index) {
    const synth = synths[index]

    const {
      carrierGain,
      frequency,
      gain,
      modDepth,
      modFrequency,
    } = calculateParameters(index)

    engine.fn.setParam(synth.filter.frequency, frequency)
    engine.fn.setParam(synth.param.carrierGain, carrierGain)
    engine.fn.setParam(synth.param.gain, gain)
    engine.fn.setParam(synth.param.mod.depth, modDepth)
    engine.fn.setParam(synth.param.mod.frequency, modFrequency)
  }

  function updateSynths() {
    for (const index in synths) {
      updateSynth(index)
    }
  }

  return {
    load: function () {
      engine.ephemera
        .add(modDepthField)
        .add(modFrequencyField)

      createBinaurals()
      createSynths()

      this.update()

      return this
    },
    unload: function () {
      engine.ephemera
        .remove(modDepthField)
        .remove(modFrequencyField)

      destroyBinaurals()
      destroySynths()

      return this
    },
    update: function () {
      updateSynths()

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.surfaceDirectional.update()
})

engine.state.on('import', () => content.audio.surfaceDirectional.load())
engine.state.on('reset', () => content.audio.surfaceDirectional.unload())
