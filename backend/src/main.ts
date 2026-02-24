import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

// 1. CARGA DE VARIABLES DE ENTORNO
const envPath = join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Archivo .env detectado y cargado.');
} else {
  console.warn('⚠️ No se encontró el archivo .env en:', envPath);
}

// Debug: Verificar si la variable llegó a Node.js
console.log('🔍 DATABASE_URL presente:', !!process.env.DATABASE_URL);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. CONFIGURACIÓN DE CORS ACTUALIZADA
  // 'origin: *' es fundamental para que el celular (que tiene una IP distinta) pueda conectar
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. PREFIJO GLOBAL /api
  app.setGlobalPrefix('api');

  // 4. PUERTO Y ARRANQUE (Configurado para Red Local)
  const port = process.env.PORT || 3001;

  /**
   * IMPORTANTE: '0.0.0.0' permite que NestJS escuche peticiones 
   * de cualquier IP en tu red (incluyendo tu celular), 
   * no solo de 'localhost'.
   */
  await app.listen(port, '0.0.0.0');

  console.log('---');
  console.log(`🚀 TechStore Backend running on http://localhost:${port}/api`);
  console.log(`📡 Visible en red local para App Expo en puerto: ${port}`);
  console.log(`📡 WebSocket Gateway ready for Mobile App sync`);
  console.log('---');
}

bootstrap().catch((err) => {
  console.error('❌ Error fatal durante el arranque:', err);
});