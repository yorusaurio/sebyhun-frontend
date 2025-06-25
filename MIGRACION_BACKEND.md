# 🚀 MIGRACIÓN A BACKEND SPRING BOOT - GUÍA COMPLETA

## 📋 RESUMEN

El frontend Next.js ha sido **completamente migrado** para consumir el backend Spring Boot en lugar de Supabase. Ahora toda la lógica de datos está centralizada en el backend y el frontend es solo una interfaz de usuario.

## 🔧 CONFIGURACIÓN RÁPIDA

### 1. Variables de Entorno (.env.local)

```bash
# 🎯 URL del Backend Spring Boot
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Para producción, cambia a:
# NEXT_PUBLIC_API_BASE_URL=https://tu-backend-produccion.com/api
```

### 2. Cambiar a Producción

Para apuntar a producción, **solo necesitas**:

1. Cambiar la URL en `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://tu-servidor-produccion.com/api
   ```

2. Reiniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

¡Eso es todo! El frontend automáticamente consumirá la nueva URL.

## 🎯 ENDPOINTS IMPLEMENTADOS

### CRUD Básico
- ✅ `GET /api/recuerdos?userId=xxx` - Obtener todos los recuerdos
- ✅ `GET /api/recuerdos/{id}` - Obtener un recuerdo específico
- ✅ `POST /api/recuerdos` - Crear nuevo recuerdo
- ✅ `PUT /api/recuerdos/{id}` - Actualizar recuerdo
- ✅ `DELETE /api/recuerdos/{id}` - Eliminar recuerdo

### Búsquedas
- ✅ `GET /api/recuerdos/search?userId=xxx&titulo=xxx` - Buscar por título
- ✅ `GET /api/recuerdos/search?userId=xxx&ubicacion=xxx` - Buscar por ubicación

### Funcionalidades Avanzadas
- ✅ `GET /api/stats/{userId}` - Estadísticas del usuario
- ✅ `GET /api/calendar/{userId}` - Calendario mensual
- ✅ `GET /api/calendar/{userId}/year` - Calendario anual
- ✅ `GET /api/health` - Health check del backend

## 📁 ARCHIVOS MODIFICADOS

### ✨ Nuevos Archivos
- `src/config/api.ts` - Configuración centralizada de la API
- `src/lib/apiClient.ts` - Cliente REST completo con manejo de errores
- Esta documentación

### 🔄 Archivos Migrados
- `src/lib/recuerdosApi.ts` - Migrado de Supabase a Spring Boot
- `src/app/home/page.tsx` - IDs cambiados de number a string
- `src/app/mapa/page.tsx` - IDs cambiados de number a string
- `src/app/calendario/page.tsx` - IDs cambiados de number a string
- `src/app/editar-recuerdo/[id]/page.tsx` - Búsqueda de recuerdos actualizada
- `.env.local` - Variables de entorno añadidas

### 🗑️ Archivos Obsoletos (Mantener por Compatibilidad)
- `src/lib/supabase.ts` - Ya no se usa, pero se mantiene
- `src/app/api/recuerdos/route.ts` - Ya no se usa
- `src/app/api/recuerdos/[id]/route.ts` - Ya no se usa

## 🎨 NUEVAS FUNCIONALIDADES

### 1. Cliente API Inteligente
- Manejo automático de errores
- Retry automático en caso de timeout
- Conversión automática de tipos
- Validación de respuestas

### 2. Búsquedas Mejoradas
```typescript
// Buscar en título y ubicación simultáneamente
const resultados = await recuerdosApi.search("paris");

// Buscar solo por título
const porTitulo = await apiClient.buscarPorTitulo(userId, "vacaciones");

// Buscar solo por ubicación
const porUbicacion = await apiClient.buscarPorUbicacion(userId, "españa");
```

### 3. Estadísticas y Calendario
```typescript
// Obtener estadísticas del usuario
const stats = await recuerdosApi.getStats();

// Obtener calendario del mes actual
const calendario = await recuerdosApi.getCalendarioMensual(2024, 12);

// Obtener resumen anual
const anual = await recuerdosApi.getCalendarioAnual(2024);
```

### 4. Health Check
```typescript
// Verificar si el backend está disponible
const estaOnline = await recuerdosApi.checkHealth();
if (!estaOnline) {
  console.log("Backend no disponible");
}
```

## 🚨 MANEJO DE ERRORES

El sistema incluye manejo inteligente de errores:

```typescript
try {
  const recuerdos = await recuerdosApi.getAll();
} catch (error) {
  // Los errores ya están formateados y son user-friendly
  console.log(error.message); // "Recuerdo no encontrado"
}
```

## 🧪 TESTING

### Verificar Conexión
```bash
# Health check
curl http://localhost:8080/api/health

# Listar recuerdos (debería devolver array vacío al principio)
curl "http://localhost:8080/api/recuerdos?userId=test"
```

### Crear Recuerdo de Prueba
```bash
curl -X POST "http://localhost:8080/api/recuerdos" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "titulo": "Recuerdo de prueba",
    "descripcion": "Testing desde el frontend",
    "ubicacion": "Madrid, España",
    "fecha": "2024-12-25",
    "imagen": "https://example.com/imagen.jpg"
  }'
```

## 📊 COMPATIBILIDAD

### ✅ Mantiene Compatibilidad
- Todas las páginas funcionan igual
- La interfaz de usuario no ha cambiado
- Los tipos `RecuerdoFrontend` se mantienen
- La autenticación NextAuth funciona igual

### 🔄 Cambios Internos
- IDs ahora son `string` en lugar de `number`
- Los recuerdos se obtienen del backend Spring Boot
- Soporte para múltiples imágenes (`imagenes[]`)
- Mejores mensajes de error

## 🎉 BENEFICIOS

1. **Centralización**: Toda la lógica de datos en el backend
2. **Escalabilidad**: Fácil de escalar horizontalmente
3. **Flexibilidad**: Fácil cambio entre entornos
4. **Robustez**: Mejor manejo de errores
5. **Performance**: Menos llamadas redundantes
6. **Funcionalidad**: Búsquedas, estadísticas y calendario

## 📝 PRÓXIMOS PASOS

1. ✅ **Probar en desarrollo**: Verifica que todo funcione con tu backend local
2. 🚀 **Desplegar backend**: Sube tu backend Spring Boot a producción
3. 🔧 **Cambiar URL**: Modifica `NEXT_PUBLIC_API_BASE_URL` en producción
4. 🎨 **Aprovechar nuevas funcionalidades**: Implementa búsquedas y estadísticas en la UI

---

**🎯 Resumen**: El frontend está **100% listo** para consumir tu backend Spring Boot. Solo necesitas cambiar la URL base cuando despliegues a producción.
