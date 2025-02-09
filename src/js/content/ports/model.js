content.ports.model = {}

content.ports.model.instantiate = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.ports.model.prototype = {
  construct: function ({
    angle = 0,
    economy = '',
    index = 0,
    isDiscovered = false,
    luxuryGood = undefined,
    name = '',
  } = {}) {
    this.angle = angle
    this.economy = content.economies.get(economy)
    this.index = index
    this.isDiscovered = isDiscovered
    this.luxuryGood = luxuryGood
    this.name = name
    this.x = Math.cos(angle) * content.lake.radius()
    this.y = Math.sin(angle) * content.lake.radius()

    this.generate()

    return this
  },
  export: function () {
    return {
      angle: this.angle,
      economy: this.economy.id,
      index: this.index,
      isDiscovered: this.isDiscovered,
      luxuryGood: this.luxuryGood,
      name: this.name,
    }
  },
  generate: function () {
    const srand = engine.fn.srand('port', this.index, 'generate')

    // Generate unique note for seed
    const rootNote = 60

    const rootNotes = engine.fn.shuffle([
      -12,-10,-8,-5,-3,
      0,2,4,7,9,
      12,14,16,19,21,
    ], engine.fn.srand('port', 'notes'))

    const rootBase = rootNotes[this.index]

    this.rootFrequency = engine.fn.fromMidi(rootNote + rootBase)

    // Build triad around root note
    const scale = [
      -24,-22,-20,-19,-17,-15,-13,
      -12,-10,-8,-7,-5,-3,-1,
      0,2,4,5,7,9,11,
      12,14,16,17,19,21,23,
      24,26,28,29,31,33,35,
    ]

    const rootIndex = scale.indexOf(rootBase)

    const triadIndexes = engine.fn.choose([
      [0, 2, 4], // Root is root of triad
      [-2, 0, 2], // Root is third of triad
      [-4, -2, 0], // Root is fifth of triad
    ], srand())

    this.triadFrequencies = [
      engine.fn.fromMidi(rootNote + scale[rootIndex + triadIndexes[0]]),
      engine.fn.fromMidi(rootNote + scale[rootIndex + triadIndexes[1]]),
      engine.fn.fromMidi(rootNote + scale[rootIndex + triadIndexes[2]]),
    ]

    this.triadFrequenciesTransposed = [
      engine.fn.transpose(
        this.triadFrequencies[0],
        engine.fn.fromMidi(rootNote - (3 * 12)),
        engine.fn.fromMidi(rootNote - (2 * 12)),
      ),
      engine.fn.transpose(
        this.triadFrequencies[1],
        engine.fn.fromMidi(rootNote),
        engine.fn.fromMidi(rootNote + (1 * 12)),
      ),
      engine.fn.transpose(
        this.triadFrequencies[2],
        engine.fn.fromMidi(rootNote),
        engine.fn.fromMidi(rootNote + (1 * 12)),
      ),
    ]

    // Build primes
    const fastPrimes = [
      29, 31, 37, 41, 43, 47, 53, 59,
    ]

    const slowPrimes = [
      89, 97, 101, 103, 107, 109, 113,
    ]

    this.primeNumbers = [
      engine.fn.choose(slowPrimes, srand()),
      engine.fn.chooseSplice(fastPrimes, srand()),
      engine.fn.chooseSplice(fastPrimes, srand()),
    ]

    return this
  },
  getDistance: function () {
    const value = engine.tool.vector3d.create(this)
      .subtract(engine.position.getVector())
      .zeroZ()
      .distance()

    return engine.fn.scale(value, 0, content.lake.radius() * 2, 0, 1)
  },
  getDot: function() {
    const value = engine.tool.vector3d.create(this)
      .subtract(engine.position.getVector())
      .zeroZ()
      .normalize()
      .dotProduct(engine.position.getQuaternion().forward())

    return engine.fn.scale(value, -1, 1, 0, 1)
  },
  getBuying: function () {
    const goods = this.economy.getBuying(),
      inventory = content.inventory.goods()

    for (const good of inventory) {
      if (good.id != this.luxuryGood && content.goods.luxury.isPrototypeOf(good)) {
        goods.push(good)
      }
    }

    goods.sort((a, b) => a.name.localeCompare(b.name))

    return goods
  },
  getSelling: function () {
    const goods = this.economy.getSelling()

    if (this.luxuryGood) {
      goods.push(
        content.goods.getLuxuryForPort(this.index)
      )
    }

    goods.sort((a, b) => a.name.localeCompare(b.name))

    return goods
  },
}
