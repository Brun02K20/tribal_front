#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function cleanDistInSubdirs(dir) {
  try {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.lstatSync(fullPath);

      if (stat.isDirectory()) {
        if (item === 'dist') {
          console.log(`🧹 Eliminando: ${fullPath}`);
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else if (!item.startsWith('.') && item !== 'node_modules') {
          cleanDistInSubdirs(fullPath);
        }
      } else if (
        item.endsWith('.js') ||
        item.endsWith('.d.ts') ||
        item.endsWith('.js.map')
      ) {
        const dirParent = path.dirname(fullPath);
        if (dirParent.includes('src')) {
          console.log(`🗑️ Eliminando: ${fullPath}`);
          fs.unlinkSync(fullPath);
        }
      }
    });
  } catch (err) {
    console.error(`Error limpiando ${dir}:`, err.message);
  }
}

const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  console.log('🧹 Limpiando carpetas dist en subdirectorios...');
  cleanDistInSubdirs(srcDir);
  console.log('✅ Limpieza completada');
} else {
  console.log('⚠️ Carpeta src no encontrada');
}
