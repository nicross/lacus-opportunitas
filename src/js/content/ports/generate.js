content.ports.generate = (() => {
  const defaultLuxuries = [
    'Dust',
    'Elixir',
    'Sauce',
    'Spice',
    'Zest',
  ]

  const defaultNamePrefixes = [
    'Astro',
    'Augur',
    'Blink',
    'Bluff',
    'Braille',
    'Exa',
    'Gaines',
    'Giga',
    'Gizmo',
    'Grand',
    'Hexa',
    'Hill',
    'Holo',
    'Inner',
    'Kilo',
    'Launch',
    'Lumen',
    'Luna',
    'Maria',
    'Maya',
    'Mega',
    'Midi',
    'Milli',
    'Mono',
    'Neo',
    'Octo',
    'Omni',
    'Outer',
    'Quant',
    'Penta',
    'Rich',
    'Rocks',
    'Sol',
    'Spring',
    'Sprocket',
    'Tri',
    'River',
    'Water',
    'Widget',
    'Wild',
    'Worthing',
    'Zeta',
  ]

  const defaultNameSuffixes = [
    'beach',
    'brook',
    'burough',
    'bury',
    'castle',
    'center',
    'chester',
    'dale',
    'field',
    'ford',
    'forge',
    'gon',
    'gram',
    'ham',
    'haven',
    'house',
    'land',
    'mouth',
    'pad',
    'pass',
    'plex',
    'point',
    'polis',
    'port',
    'shade',
    'shire',
    'smith',
    'star',
    'station',
    'stead',
    'ton',
    'tower',
    'town',
    'turf',
    'view',
    'ville',
    'wood',
    'worth',
    'valley',
  ]

  function generateLuxury(portName, luxuries, srand) {
    const luxury = engine.fn.chooseSplice(luxuries, srand)

    return `${portName} ${luxury}`
  }

  function generateName(prefixes, suffixes, srand) {
    const prefix = engine.fn.chooseSplice(prefixes, srand)
    let suffix = engine.fn.chooseSplice(suffixes, srand)

    if (prefix.slice(-1) == suffix.slice(0, 1)) {
      suffix = suffix.slice(1)
    }

    return `${prefix}${suffix}`
  }

  return () => {
    const economies = content.economies.all(),
      ports = [],
      srand = engine.fn.srand('ports')

    const count = Math.round(
      economies.length * srand(1.5, 2.5)
    )

    const luxuries = engine.fn.shuffle(defaultLuxuries, srand),
      namePrefixes = engine.fn.shuffle(defaultNamePrefixes, srand),
      nameSuffixes = engine.fn.shuffle(defaultNameSuffixes, srand)

    let angle = srand(0, engine.const.tau),
      defecit = 0,
      economyRolls = []

    for (let i = 0; i < count; i += 1) {
      // Shuffle all of the economies and draw
      if (!economyRolls.length) {
        economyRolls = engine.fn.shuffle(economies, srand)
      }

      const port = {
        angle,
        economy: engine.fn.chooseSplice(economyRolls, srand()).id,
        index: i,
        name: generateName(namePrefixes, nameSuffixes, srand),
      }

      if (port.economy == 'luxury') {
        port.luxuryGood = generateLuxury(port.name, luxuries, srand)
      }

      ports.push(port)

      const angleRoll = defecit
        ? 0.666 + srand(0, defecit)
        : srand(0.666, 1)

      angle += angleRoll * engine.const.tau / count

      defecit = angleRoll < 1
        ? defecit + (1 - angleRoll)
        : defecit - (angleRoll - 1)
    }

    return ports
  }
})()
