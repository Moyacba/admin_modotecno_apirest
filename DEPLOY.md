# 🚀 Guía de Despliegue a Producción

Esta guía te ayudará a preparar y desplegar la aplicación AdminMT Backend a producción.

## 📋 Prerrequisitos

- **Node.js** 18.x o superior
- **PNPM** (gestor de paquetes)
- **MongoDB** (base de datos)
- **Variables de entorno** configuradas

## 🔧 Preparación para Producción

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

**Variables Críticas a Configurar:**

```env
# Base de datos MongoDB
DATABASE_URL="mongodb+srv://usuario:password@cluster.mongodb.net/basededatos"

# JWT Secret (generar uno seguro)
JWT_SECRET="tu_jwt_secret_super_seguro_aqui"

# CORS para frontend
CORS_ALLOWED_ORIGINS="https://tu-dominio-frontend.com,https://admin.tu-dominio.com"

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN="tu_access_token_de_mercadopago"

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# Entorno
NODE_ENV=production
```

### 2. Instalar Dependencias

```bash
pnpm install --prod
```

### 3. Generar Clientes de Prisma

```bash
pnpm run build
```

## 🚀 Despliegue

### Opción 1: Script Automático (Recomendado)

```bash
pnpm run deploy
```

Este script verifica:
- ✅ Variables de entorno
- ✅ Dependencias instaladas
- ✅ Build exitoso

### Opción 2: Manual

```bash
# 1. Instalar dependencias
pnpm install --prod

# 2. Ejecutar build
pnpm run build

# 3. Iniciar en producción
pnpm run start:prod
```

## 🔍 Verificación

### Health Check

Verifica que la aplicación esté funcionando:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

### Logs de Aplicación

Los logs en producción usarán el formato `combined` de Morgan para mejor análisis.

## 🌐 Plataformas de Despliegue

### Heroku

1. **Procfile**: Ya está configurado
2. **Variables de entorno**: Configurar en el panel de Heroku
3. **Build**: Heroku ejecutará automáticamente `pnpm run build`

```bash
git push heroku main
```

### Railway

1. **Variables de entorno**: Configurar en el panel de Railway
2. **Start command**: `pnpm start`
3. **Build command**: `pnpm run build`

### Netlify Functions / Vercel

La aplicación está preparada para despliegue en estas plataformas serverless.

## 🔐 Seguridad en Producción

### Variables de Entorno Críticas

- **JWT_SECRET**: Debe ser único y complejo
- **DATABASE_URL**: Usar conexión segura (SSL)
- **CORS_ALLOWED_ORIGINS**: Solo dominios autorizados

### Recomendaciones

- ✅ Usar HTTPS en producción
- ✅ Configurar rate limiting si es necesario
- ✅ Monitorear logs de errores
- ✅ Backup regular de base de datos

## 🚦 Comandos Útiles

```bash
# Desarrollo
pnpm run dev                 # Servidor con hot reload

# Producción
pnpm run build              # Generar build
pnpm run start              # Iniciar servidor
pnpm run start:prod         # Iniciar con NODE_ENV=production
pnpm run deploy             # Script completo de despliegue

# Mantenimiento
pnpm run healthcheck        # Verificar salud
pnpm run mongodb:init       # Inicializar base de datos
```

## 🆘 Solución de Problemas

### Error: Variables de entorno faltantes
```bash
❌ Variables de entorno faltantes: DATABASE_URL, JWT_SECRET
```
**Solución**: Configurar las variables en `.env`

### Error: Prisma no puede conectar
```bash
❌ Error: Database connection failed
```
**Solución**: Verificar `DATABASE_URL` y conectividad a MongoDB

### Error: CORS
```bash
❌ Not allowed by CORS
```
**Solución**: Agregar dominio frontend a `CORS_ALLOWED_ORIGINS`

## 📞 Soporte

Si necesitas ayuda:
1. Revisa los logs de la aplicación
2. Verifica el endpoint `/health`
3. Consulta la documentación del proveedor de hosting

---

🎉 **¡Tu aplicación está lista para producción!**
