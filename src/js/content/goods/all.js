// Methodology: It takes eight sales to be able to afford the next tier

//Agricultural
content.goods.invent({
  id: 'essentials',
  name: 'Essentials',
  baseCost: 1,
})

content.goods.invent({
  id: 'waste',
  name: 'Waste',
  baseCost: 1,
})

// Extraction
content.goods.invent({
  id: 'copper-ore',
  name: 'Copper ore',
  baseCost: 8 ** 1,
})

content.goods.invent({
  id: 'iron-ore',
  name: 'Iron ore',
  baseCost: 8 ** 2,
})

content.goods.invent({
  id: 'gold-ore',
  name: 'Gold ore',
  baseCost: 8 ** 3,
})

content.goods.invent({
  id: 'platinum-ore',
  name: 'Platinum ore',
  baseCost: 8 ** 4,
})

content.goods.invent({
  id: 'iridium-ore',
  name: 'Iridium ore',
  baseCost: 8 ** 5,
})

// Refinement
content.goods.invent({
  id: 'copper-bars',
  name: 'Copper bars',
  baseCost: 8 ** 2,
})

content.goods.invent({
  id: 'iron-bars',
  name: 'Iron bars',
  baseCost: 8 ** 3,
})

content.goods.invent({
  id: 'gold-bars',
  name: 'Gold bars',
  baseCost: 8 ** 4,
})

content.goods.invent({
  id: 'platinum-bars',
  name: 'Platinum bars',
  baseCost: 8 ** 5,
})

content.goods.invent({
  id: 'iridium-bars',
  name: 'Iridium bars',
  baseCost: 8 ** 6,
})

// Manufacturing
content.goods.invent({
  id: 'agricultural-equipment',
  name: 'Agricultural equipment',
  baseCost: 8 ** 4,
})

content.goods.invent({
  id: 'extraction-equipment',
  name: 'Extraction equipment',
  baseCost: 8 ** 5,
})

content.goods.invent({
  id: 'refinement-equipment',
  name: 'Refinement equipment',
  baseCost: 8 ** 6,
})

content.goods.invent({
  id: 'consumer-goods',
  name: 'Consumer goods',
  baseCost: 8 ** 7,
})
