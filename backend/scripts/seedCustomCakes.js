const mongoose = require('mongoose');
require('../config/loadEnv');
const { getMongoUri } = require('../config/databaseConfig');
const Product = require('../models/Product');
const seedProducts = require('../data/customCakeSeedData');

const applyChanges = process.argv.includes('--apply');

async function seedCustomCakes() {
  await mongoose.connect(getMongoUri());
  try {
    const names = seedProducts.map(product => product.name);
    const existingNames = await Product.find({ category: 'Tortas personalizadas', name: { $in: names } }).select('name seedKey');
    const conflicts = existingNames.filter(product => !product.seedKey || !seedProducts.some(seed => seed.seedKey === product.seedKey));
    if (conflicts.length) {
      throw new Error(`Hay productos con nombres reservados sin seedKey (${conflicts.map(item => item.name).join(', ')}). Revisalos antes de ejecutar el seed.`);
    }

    const existingSeeded = await Product.find({ seedKey: { $in: seedProducts.map(product => product.seedKey) } }).select('seedKey');
    const existingKeys = new Set(existingSeeded.map(product => product.seedKey));
    console.log(`Modo: ${applyChanges ? 'APLICAR' : 'vista previa (sin escrituras)'}`);
    console.log(`Productos nuevos: ${seedProducts.filter(product => !existingKeys.has(product.seedKey)).length}`);
    console.log(`Productos ya sembrados (se conservan sin cambios): ${existingKeys.size}`);
    seedProducts.forEach(product => console.log(`${product.name} — $${product.price.toLocaleString('es-AR')} — ${product.image}`));

    if (applyChanges) {
      await Product.init();
      await Product.bulkWrite(seedProducts.map(product => ({
        updateOne: {
          filter: { seedKey: product.seedKey },
          update: { $setOnInsert: product },
          upsert: true
        }
      })));
      console.log('Seed de tortas personalizadas aplicado sin borrar otros productos.');
    } else {
      console.log('Para aplicar estos cambios, ejecutá npm run seed:custom-cakes -- --apply');
    }
  } finally {
    await mongoose.disconnect();
  }
}

seedCustomCakes().catch(error => {
  console.error(`Seed cancelado: ${error.message}`);
  process.exitCode = 1;
});
