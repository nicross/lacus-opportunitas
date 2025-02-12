// Methodology: It takes six sales to be able to afford the next tier

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
  baseCost: 6 ** 1,
})

content.goods.invent({
  id: 'iron-ore',
  name: 'Iron ore',
  baseCost: 6 ** 2,
})

content.goods.invent({
  id: 'gold-ore',
  name: 'Gold ore',
  baseCost: 6 ** 3,
})

content.goods.invent({
  id: 'platinum-ore',
  name: 'Platinum ore',
  baseCost: 6 ** 4,
})

// Refinement
content.goods.invent({
  id: 'copper-bars',
  name: 'Copper bars',
  baseCost: 6 ** 2,
})

content.goods.invent({
  id: 'iron-bars',
  name: 'Iron bars',
  baseCost: 6 ** 3,
})

content.goods.invent({
  id: 'gold-bars',
  name: 'Gold bars',
  baseCost: 6 ** 4,
})

content.goods.invent({
  id: 'platinum-bars',
  name: 'Platinum bars',
  baseCost: 6 ** 5,
})

// Manufacturing
content.goods.invent({
  id: 'agricultural-equipment',
  name: 'Agricultural equipment',
  baseCost: 6 ** 3,
})

content.goods.invent({
  id: 'extraction-equipment',
  name: 'Extraction equipment',
  baseCost: 6 ** 4,
})

content.goods.invent({
  id: 'refinement-equipment',
  name: 'Refinement equipment',
  baseCost: 6 ** 5,
})

content.goods.invent({
  id: 'consumer-goods',
  name: 'Consumer goods',
  baseCost: 6 ** 6,
})
