content.audio = (() => {
  const context = engine.context(),
    mainInput = context.createGain(),
    mainOutput = engine.mixer.createBus()

  mainInput.connect(mainOutput)

  function createBus() {
    const gain = context.createGain()
    gain.connect(mainInput)
    return gain
  }

  function createBypass() {
    return engine.mixer.createBus()
  }

  function createChannel(isBypass) {
    const input = context.createGain(),
      output = isBypass ? createBypass() : createBus()

    input.connect(output)

    return {
      createBus: function () {
        const gain = context.createGain()
        gain.connect(input)
        return gain
      },
      input,
      output,
    }
  }

  return {
    channel: {
      bypass: createChannel(true),
      default: createChannel(),
    },
    main: () => mainOutput,
    // Namespaces
    buffer: {},
  }
})()

engine.loop.on('resume', () => engine.loop.once('frame', () => engine.fn.rampLinear(content.audio.main().gain, 1, 0.25)))
engine.loop.on('pause', () => engine.loop.once('frame', () => engine.fn.rampLinear(content.audio.main().gain, 0, 0.25)))
