/**
 * Script para sincronizar el inventario con los productos
 * Este script corrige cualquier discrepancia entre el stock de productos y el inventario
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/madame-pastel')
  .then(() => {
    console.log('Conexión a MongoDB establecida');
    syncInventoryWithProducts();
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Función principal para sincronizar inventario
async function syncInventoryWithProducts() {
  try {
    console.log('Iniciando sincronización de inventario con productos...');
    
    // Obtener todos los productos
    const products = await Product.find();
    console.log(`Total de productos encontrados: ${products.length}`);
    
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    // Para cada producto, actualizar o crear su inventario
    for (const product of products) {
      try {
        // Buscar si ya existe un registro de inventario
        let inventoryItem = await Inventory.findOne({ product: product._id });
        
        if (inventoryItem) {
          // Actualizar el inventario existente con el stock del producto
          inventoryItem.currentStock = product.stock;
          // Solo actualizar initialStock si es 0 o menor que el stock actual
          if (inventoryItem.initialStock === 0 || inventoryItem.initialStock < product.stock) {
            inventoryItem.initialStock = product.stock;
          }
          
          await inventoryItem.save();
          console.log(`✅ Inventario actualizado para: ${product.name} (${product._id}) - Stock: ${product.stock}`);
          updatedCount++;
        } else {
          // Crear un nuevo registro de inventario
          inventoryItem = new Inventory({
            product: product._id,
            initialStock: product.stock,
            currentStock: product.stock,
            reorderLevel: 5,
            pendingProduction: 0,
            notes: 'Creado automáticamente por script de sincronización'
          });
          
          await inventoryItem.save();
          console.log(`✨ Nuevo inventario creado para: ${product.name} (${product._id}) - Stock: ${product.stock}`);
          createdCount++;
        }
      } catch (err) {
        console.error(`❌ Error procesando producto ${product._id}:`, err);
        errorCount++;
      }
    }
    
    // Verificar registros de inventario huérfanos (sin producto asociado)
    const orphanedInventory = await Inventory.find({
      product: { $nin: products.map(p => p._id) }
    });
    
    if (orphanedInventory.length > 0) {
      console.log(`\n🚨 Encontrados ${orphanedInventory.length} registros de inventario sin producto asociado:`);
      for (const item of orphanedInventory) {
        console.log(`- ID: ${item._id}, Producto: ${item.product}`);
      }
      
      // Opcional: eliminar registros huérfanos
      if (process.argv.includes('--clean')) {
        await Inventory.deleteMany({
          product: { $nin: products.map(p => p._id) }
        });
        console.log(`🧹 ${orphanedInventory.length} registros de inventario huérfanos eliminados.`);
      } else {
        console.log('Para eliminar estos registros, ejecute el script con --clean');
      }
    }
    
    // Resumen de la operación
    console.log('\n📊 Resumen de sincronización:');
    console.log(`- Productos totales: ${products.length}`);
    console.log(`- Registros de inventario creados: ${createdCount}`);
    console.log(`- Registros de inventario actualizados: ${updatedCount}`);
    console.log(`- Errores: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n✅ Sincronización completada exitosamente!');
    } else {
      console.log('\n⚠️ Sincronización completada con errores.');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error en el proceso de sincronización:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}
