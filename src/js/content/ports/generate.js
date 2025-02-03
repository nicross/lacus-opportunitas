content.ports.generate = (() => {
  const defaultNamePrefixes = [
    'Augur',
    'Blink',
    'Bluff',
    'Brine',
    'Chert',
    'Exa',
    'Giga',
    'Grand',
    'Hexa',
    'Hill',
    'Holo',
    'Kilo',
    'Lumen',
    'Luna',
    'Mega',
    'Mid',
    'Milli',
    'Mono',
    'Neo',
    'Octo',
    'Quant',
    'Penta',
    'Rich',
    'Rock',
    'Sol',
    'Spring',
    'Sprocket',
    'Tri',
    'River',
    'Water',
    'Widget',
    'Yotta',
    'Zeta',
  ]

  const defaultNameSuffixes = [
    'beach',
    'brook',
    'burough',
    'bury',
    'castle',
    'chester',
    'dale',
    'field',
    'ford',
    'gon',
    'gram',
    'ham',
    'haven',
    'land',
    'mouth',
    'plex',
    'point',
    'polis',
    'port',
    'shade',
    'shire',
    'station',
    'stead',
    'ton',
    'view',
    'ville',
    'wood',
    'worth',
    'valley',
  ]

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
      economies.length * srand(1, 2)
    )

    const namePrefixes = engine.fn.shuffle(defaultNamePrefixes, srand),
      nameSuffixes = engine.fn.shuffle(defaultNameSuffixes, srand)

    let angle = srand(0, engine.const.tau),
      defecit = 0,
      economyRolls = []

    for (let i = 0; i < count; i += 1) {
      // Shuffle all of the economies and draw
      if (!economyRolls.length) {
        economyRolls = engine.fn.shuffle(economies, srand)
      }

      ports.push({
        angle,
        behavior: srand(),
        economy: engine.fn.chooseSplice(economyRolls, srand()).id,
        index: i,
        name: generateName(namePrefixes, nameSuffixes, srand),
      })

      const angleRoll = defecit
        ? 0.5 + srand(0, defecit)
        : srand(0.5, 1)

      angle += angleRoll * engine.const.tau / count

      defecit = angleRoll < 1
        ? defecit + (1 - angleRoll)
        : defecit - (angleRoll - 1)
    }

    return ports
  }
})()
