content.audio.surfaceAmbient = (() => {
  const bus = content.audio.channel.default.createBus()

  const filterModel = engine.ear.filterModel.musical.extend({
    coneRadius: 0.25 * engine.const.tau,
    frequency: 100,
    maxColor: 10,
    minColor: 0.5,
    power: 1,
  })

  const delay = engine.effect.pingPongDelay({
    delay: 1,
    dry: 1,
    feedback: 3/4,
    wet: 1,
  })

  let binaural,
    synth

  delay.output.connect(bus)

  return {
    load: function () {
      synth = engine.synth.buffer({
        buffer: content.audio.buffer.brownNoise.get(2),
        gain: engine.fn.fromDb(-18),
        playbackRate: engine.const.zero,
      }).filtered({
        frequency: 125,
      })

      binaural = engine.ear.binaural.create({
        filterModel,
      }).from(synth).to(delay.input)

      return this
    },
    unload: function () {
      if (binaural) {
        binaural.destroy()
        binaural = undefined
      }

      if (synth) {
        synth.stop()
        synth = undefined
      }

      return this
    },
    update: function () {
      if (Math.random() > 4/engine.performance.fps()) {
        return this
      }

      const vector = engine.tool.vector2d.unitX()
        .rotate(engine.fn.randomFloat(-1, 1) * engine.const.tau)
        .scale(engine.fn.randomFloat(-1, 1) * 10)

      const z = engine.fn.clamp(
        Math.random() * content.surface.value(vector, true) / 50,
        engine.const.zero, 1
      )

      engine.fn.setParam(synth.param.playbackRate, z)
      binaural.update(vector)

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.surfaceAmbient.update()
})

engine.state.on('import', () => content.audio.surfaceAmbient.load())
engine.state.on('reset', () => content.audio.surfaceAmbient.unload())
