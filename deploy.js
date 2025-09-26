#!/usr/bin/env node

/**
 * Script de despliegue para producción
 * Verifica configuraciones y ejecuta el build
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando proceso de despliegue...\n');

// Verificar que existe .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Archivo .env no encontrado. Copia .env.example a .env y configura las variables.');
  process.exit(1);
}

// Verificar package manager
try {
  execSync('pnpm --version', { stdio: 'ignore' });
  console.log('✅ PNPM encontrado');
} catch (error) {
  console.error('❌ PNPM no está instalado. Instálalo con: npm install -g pnpm');
  process.exit(1);
}

// Verificar variables de entorno críticas
console.log('🔍 Verificando variables de entorno...');
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ALLOWED_ORIGINS'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
  console.error('📋 Revisa el archivo .env.example para ver todas las variables necesarias');
  process.exit(1);
}

console.log('✅ Variables de entorno verificadas\n');

// Ejecutar build
try {
  console.log('📦 Instalando dependencias...');
  execSync('pnpm install --prod=false', { stdio: 'inherit' });
  
  console.log('\n🔧 Ejecutando build...');
  execSync('pnpm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Build completado exitosamente!');
  console.log('\n🎉 La aplicación está lista para producción.');
  console.log('📋 Para iniciar el servidor usa: pnpm start');
  
} catch (error) {
  console.error('\n❌ Error durante el build:', error.message);
  process.exit(1);
}
