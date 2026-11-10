const fs = require('fs');
const path = require('path');
const https = require('https');
const mongoose = require('mongoose');
require('../config/loadEnv');
const { getMongoUri } = require('../config/databaseConfig');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { categories, products } = require('../data/traditionalProductsSeedData');

const IMAGES_DIR = path.resolve(__dirname, '../../frontend/public/images/products');

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return resolve('exists');
    }

    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        fs.unlink(destPath, () => {});
        return reject(new Error(`Status ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve('downloaded'));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function seedTraditionalProducts(options = { apply: true }) {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  console.log(`[1/3] Descargando y verificando imágenes locales en: ${IMAGES_DIR}...`);
  for (const item of products) {
    const dest = path.join(IMAGES_DIR, item.filename);
    try {
      const res = await downloadImage(item.imageUrl, dest);
      console.log(`  - ${item.filename}: ${res}`);
    } catch (err) {
      console.warn(`  ! Error descargando ${item.filename} (${err.message}). Se usará URL remota.`);
    }
  }

  if (!options.apply) {
    console.log('[DRY-RUN] Simulación completa. No se modificó la base de datos.');
    return;
  }

  console.log('[2/3] Conectando a MongoDB Atlas...');
  await mongoose.connect(getMongoUri());

  console.log('[3/3] Insertando/Actualizando Categorías y Productos...');

  let categoriesUpserted = 0;
  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { name: cat.name },
      { $set: cat },
      { upsert: true, new: true }
    );
    categoriesUpserted++;
  }

  let productsUpserted = 0;
  for (const p of products) {
    const localImgExists = fs.existsSync(path.join(IMAGES_DIR, p.filename));
    const imagePath = localImgExists
      ? `/images/products/${p.filename}`
      : p.imageUrl;

    const payload = {
      name: p.name,
      description: p.description,
      price: p.price,
      image: imagePath,
      category: p.category,
      stock: p.stock,
      madeToOrder: false,
      featured: Boolean(p.featured),
      isPromotion: Boolean(p.isPromotion),
      discountPercentage: p.discountPercentage || 0,
      ingredients: p.ingredients || [],
      allergens: p.allergens || [],
      preparationTime: p.preparationTime || 24,
      seedKey: p.seedKey
    };

    await Product.findOneAndUpdate(
      { seedKey: p.seedKey },
      { $set: payload },
      { upsert: true, new: true }
    );
    productsUpserted++;
  }

  console.log(`\n¡Éxito!`);
  console.log(`- Categorías sincronizadas: ${categoriesUpserted}`);
  console.log(`- Productos tradicionales guardados: ${productsUpserted}`);
}

if (require.main === module) {
  const apply = process.argv.includes('--apply') || !process.argv.includes('--dry-run');
  seedTraditionalProducts({ apply })
    .catch((err) => {
      console.error('Error al ejecutar el seed:', err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = { seedTraditionalProducts };
