const mongoose = require('mongoose');
require('../config/loadEnv');
const { getMongoUri } = require('../config/databaseConfig');
const User = require('../models/User');

const required = ['SUPERADMIN_USERNAME', 'SUPERADMIN_EMAIL', 'SUPERADMIN_PASSWORD'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`Faltan variables requeridas: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.SUPERADMIN_PASSWORD.length < 12) {
  console.error('SUPERADMIN_PASSWORD debe tener al menos 12 caracteres.');
  process.exit(1);
}

async function createSuperAdmin() {
  try {
    await mongoose.connect(getMongoUri());
    if (await User.exists({ role: 'superadmin' })) {
      throw new Error('Ya existe una cuenta superadmin. No se modificó la base.');
    }
    const conflict = await User.exists({
      $or: [
        { username: process.env.SUPERADMIN_USERNAME },
        { email: process.env.SUPERADMIN_EMAIL.toLowerCase() }
      ]
    });
    if (conflict) throw new Error('El usuario o email ya pertenece a otra cuenta. No se modificó la base.');

    await User.create({
      username: process.env.SUPERADMIN_USERNAME,
      email: process.env.SUPERADMIN_EMAIL,
      password: process.env.SUPERADMIN_PASSWORD,
      role: 'superadmin'
    });
    console.log('Cuenta superadmin creada. No se imprimieron las credenciales.');
  } catch (error) {
    console.error(`No se pudo crear la cuenta superadmin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createSuperAdmin();
