# 🧪 TESTING DE ENDPOINTS - IMÁGENES Y COORDENADAS

## 🔧 CAMBIOS REALIZADOS

### 1. ✅ **Endpoint de Imágenes Configurado**
- El frontend ahora usa `/api/images/upload` en lugar de ImgBB
- Se adaptó la función `uploadImageToBackend()` para usar tu endpoint
- **NUEVO**: Agregado logging detallado para diagnosticar problemas de subida

### 2. ✅ **Geocoding Implementado**
- Se agregó función `geocodeAddress()` para obtener coordenadas automáticamente
- Si el usuario escribe manualmente la ubicación, se obtienen las coordenadas via Google Geocoding API
- Si usa Google Places autocomplete, las coordenadas vienen directamente
- **NUEVO**: Mejorado el manejo de errores y validación de ubicaciones

### 3. 🆕 **Debugging Mejorado**
- La función `uploadImageToBackend()` ahora tiene logging detallado
- Maneja diferentes formatos de respuesta del backend
- Mejores mensajes de error para el usuario
- Validación de URLs de imagen antes de enviar al backend

## 🧪 CÓMO PROBAR

### 1. **Probar el endpoint de imágenes:**
```bash
# Tu comando actual funciona
curl -X 'POST' \
  'http://localhost:8080/api/images/upload' \
  -H 'accept: */*' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@latam_logo.png;type=image/png'

# Debería devolver algo como:
# {"url": "http://localhost:8080/uploads/imagen123.png"}
# o simplemente: "http://localhost:8080/uploads/imagen123.png"
```

### 2. **Crear un recuerdo completo desde el frontend:**

1. **Abrir**: `http://localhost:3000/nuevo-lugar`
2. **Llenar el formulario**:
   - Título: "Prueba con coordenadas"
   - Ubicación: "Torre Eiffel, París" (o escribir manualmente)
   - Fecha: Cualquier fecha
   - Descripción: "Testing coordenadas y imagen"
   - Imagen: Subir cualquier imagen

3. **Enviar** y verificar en el backend

### 3. **Verificar el resultado:**
```bash
# Ver todos los recuerdos
curl -X GET "http://localhost:8080/api/recuerdos?userId=anonymous"

# Deberías ver algo como:
[{
  "id": 1,
  "userId": "anonymous",
  "titulo": "Prueba con coordenadas",
  "descripcion": "Testing coordenadas y imagen",
  "ubicacion": "Torre Eiffel, París",
  "fecha": "2025-06-24",
  "imagenes": ["http://localhost:8080/uploads/imagen123.png"],
  "latitud": 48.8584,
  "longitud": 2.2945,
  "fechaCreacion": "2025-06-24T20:55:21.794778",
  "fechaActualizacion": "2025-06-24T20:55:21.794778"
}]
```

## 🐛 TROUBLESHOOTING

### **Problema**: Imagen sigue siendo null
**Solución**: Verifica que tu endpoint `/api/images/upload` devuelva la URL en el formato esperado:
- `{"url": "http://..."}` ✅
- `"http://..."` ✅ (string directo)

### **Problema**: Coordenadas siguen siendo null
**Causas posibles**:
1. **Google Maps API Key no configurada**: Verifica `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` en `.env.local`
2. **API de Geocoding no habilitada**: En Google Cloud Console, habilita "Geocoding API"
3. **Usuario escribió ubicación manualmente pero muy vaga**: Ej: "casa" en lugar de "123 Main St, París"

**Verificación**:
```javascript
// En la consola del navegador deberías ver estos logs:
// ✅ Coordenadas obtenidas para: Torre Eiffel, París {lat: 48.8584, lng: 2.2945}
// 🗺️ Obteniendo coordenadas para ubicación manual: Torre Eiffel, París
```

### **Problema**: Error al subir imagen
**Verificar**:
1. Tu backend acepta `multipart/form-data`
2. El campo se llama `file` (no `image`)
3. El endpoint devuelve la URL de la imagen

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Backend Spring Boot corriendo en `localhost:8080`
- [ ] Frontend Next.js corriendo en `localhost:3000`
- [ ] Variable `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api` en `.env.local`
- [ ] Variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` configurada
- [ ] API de Geocoding habilitada en Google Cloud
- [ ] Endpoint `/api/images/upload` funciona con curl
- [ ] Endpoint `/api/recuerdos` acepta POST con el formato esperado

## 🔄 FLUJO COMPLETO

1. **Usuario llena formulario** → Frontend valida datos
2. **Si hay imagen** → Se sube a `/api/images/upload` → Se obtiene URL
3. **Si ubicación sin coordenadas** → Se geocodifica con Google Maps
4. **Se crea recuerdo** → POST a `/api/recuerdos` con todos los datos
5. **Se redirige** → Usuario va a `/home` y ve el nuevo recuerdo

## 📊 DATOS ESPERADOS EN EL BACKEND

```json
{
  "titulo": "Prueba con coordenadas",
  "descripcion": "Testing coordenadas y imagen", 
  "ubicacion": "Torre Eiffel, París",
  "fecha": "2025-06-24",
  "userId": "anonymous",
  "imagenes": ["http://localhost:8080/uploads/imagen123.png"],
  "latitud": 48.8584,
  "longitud": 2.2945
}
```

¡Ahora tanto las imágenes como las coordenadas deberían guardarse correctamente! 🎉

## 🐛 DEBUGGING - PROBLEMAS COMUNES

### 1. **Imagen se sube pero aparece como `null` en el recuerdo**

**Causa**: El endpoint `/api/images/upload` no devuelve la URL en el formato esperado

**Solución**: Ejecutar estas pruebas para verificar qué responde el backend:

```bash
# Crear imagen de prueba
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > test-image.png

# Probar endpoint
curl -X POST http://localhost:8080/api/images/upload \
  -F "file=@test-image.png" \
  -H "Content-Type: multipart/form-data" \
  -v
```

**Respuestas esperadas**:
- `"uploads/imagen123.jpg"` (string plano)
- `{"url": "uploads/imagen123.jpg"}` (objeto con url)
- `{"path": "uploads/imagen123.jpg"}` (objeto con path)

**Logs del frontend** (en Developer Tools):
- Buscar: `🔄 Subiendo imagen al backend...`
- Buscar: `✅ Respuesta del backend:`
- Buscar: `✅ URL de imagen obtenida:`

### 2. **Error de CORS al subir imagen**

**Solución**: Verificar que el backend tenga configurado CORS para:
- `http://localhost:3000` (frontend)
- Headers: `Content-Type`, `multipart/form-data`
- Methods: `POST`

### 3. **Imagen muy grande**

**Solución**: Verificar límites en el backend:
- Tamaño máximo de archivo
- Timeout de la petición

### 4. **Formato de imagen no soportado**

**Solución**: El frontend solo acepta: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

## 🔍 COMANDOS DE DEBUGGING

```bash
# 1. Verificar el backend está corriendo
curl http://localhost:8080/api/health

# 2. Probar endpoint de imágenes
curl -X POST http://localhost:8080/api/images/upload \
  -F "file=@tu-imagen.jpg" \
  -v

# 3. Ver todos los recuerdos
curl http://localhost:8080/api/recuerdos?userId=anonymous

# 4. Ver un recuerdo específico
curl http://localhost:8080/api/recuerdos/1
```

## 🚨 LOGS IMPORTANTES

En la consola del navegador (F12 → Console), buscar:

```javascript
// Subida de imagen
🔄 Subiendo imagen al backend...
✅ Respuesta del backend: {...}
✅ URL de imagen obtenida: uploads/...

// Creación de recuerdo
🚀 Datos del recuerdo a enviar al backend: {...}
📦 Recuerdo creado mediante API: {...}
```

Si no ves estos logs, el proceso se está interrumpiendo antes.
