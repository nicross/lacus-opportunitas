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
    transactions = {},
  } = {}) {
    this.angle = angle
    this.economy = content.economies.get(economy)
    this.index = index
    this.isDiscovered = isDiscovered
    this.luxuryGood = luxuryGood
    this.name = name
    this.transactions = transactions
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
      transactions: {...this.transactions},
    }
  },
  generate: function () {
    const srand = engine.fn.srand('port', this.index, 'generate')

    // Generate unique note for seed
    const rootNote = 60

    const rootNotes = engine.fn.shuffle([
      -8,-5,-3,
      0,2,4,7,9,
      12,14,16,19,21,
      24,26
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
      [0, -2, 2], // Root is third of triad
      [0, -4, -2], // Root is fifth of triad
    ], srand())

    this.triadFrequencies = [
      engine.fn.fromMidi(rootNote + scale[rootIndex + triadIndexes[0]]),
      engine.fn.fromMidi(rootNote + scale[rootIndex + triadIndexes[1]]),
      engine.fn.fromMidi(rootNote + scale[rootIndex + triadIndexes[2]]),
    ]

    const transposed = engine.fn.transpose(
      this.triadFrequencies[0],
      engine.fn.fromMidi(rootNote + (-1 * 12)),
      engine.fn.fromMidi(rootNote + (0 * 12)),
    )

    this.triadFrequenciesTransposed = [
      transposed / 2,
      engine.fn.transpose(
        this.triadFrequencies[1],
        transposed,
        transposed * 2,
      ),
      engine.fn.transpose(
        this.triadFrequencies[2],
        transposed,
        transposed * 2,
      ),
    ]

    // Build primes
    const portPrimes = engine.fn.shuffle([
      13, 17, 19, 23, 29,
      31, 37, 41, 43, 47,
      53, 59, 73, 79, 83,
    ], engine.fn.srand('port', 'primes'))

    this.primeNumber = portPrimes[this.index]

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
  getRelative: function () {
    return engine.tool.vector3d.create(this)
      .subtract(engine.position.getVector())
      .zeroZ()
      .normalize()
      .rotateQuaternion(engine.position.getQuaternion().conjugate())
  },
  getBuying: function () {
    const goods = [
      ...this.economy.getBuying(),
      ...content.goods.getDiscoveredLuxuries().filter((good) => good.getPort() !== this),
    ]

    const isSellable = new Map(),
      sellCosts = new Map()

    for (const good of goods) {
      isSellable.set(good, content.inventory.has(good.id))
      sellCosts.set(good, good.getBuyCost(this))
    }

    goods.sort((a, b) => {
      return isSellable.get(a) == isSellable.get(b)
        ? isSellable.get(a) ? sellCosts.get(b) - sellCosts.get(a) : sellCosts.get(a) - sellCosts.get(b)
        : isSellable.get(a) ? -1 : 1
    })

    return goods
  },
  getSelling: function () {
    const goods = this.economy.getSelling()

    if (this.luxuryGood) {
      goods.push(
        content.goods.getLuxuryForPort(this.index)
      )
    }

    const buyCosts = new Map(),
      isBuyable = new Map()

    for (const good of goods) {
      isBuyable.set(good, !content.inventory.isFull() && content.credits.has(good.getBuyCost(this)))
      buyCosts.set(good, good.getBuyCost(this))
    }

    goods.sort((a, b) => {
      return isBuyable.get(a) == isBuyable.get(b)
        ? isBuyable.get(a) ? buyCosts.get(b) - buyCosts.get(a) : buyCosts.get(a) - buyCosts.get(b)
        : isBuyable.get(a) ? -1 : 1
    })

    return goods
  },
  logTransaction: function (id, amount = 0) {
    if (!(id in this.transactions)) {
      this.transactions[id] = 0
    }

    this.transactions[id] += amount

    return this
  },
}
