# 🧪 COMANDOS DE TESTING - BACKEND SPRING BOOT

Este archivo contiene todos los comandos curl para probar tu backend Spring Boot.

## 🔧 Variables de Entorno

```bash
# URL base del backend (cambia por tu URL de producción)
export API_BASE_URL="http://localhost:8080/api"

# ID de usuario para testing
export TEST_USER_ID="test-user-123"
```

## 📋 COMANDOS BÁSICOS

### 1. Health Check
```bash
curl -X GET "${API_BASE_URL}/health" \
  -H "accept: */*"
```

### 2. Listar Recuerdos
```bash
curl -X GET "${API_BASE_URL}/recuerdos?userId=${TEST_USER_ID}" \
  -H "accept: */*"
```

### 3. Crear Recuerdo
```bash
curl -X POST "${API_BASE_URL}/recuerdos" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'${TEST_USER_ID}'",
    "titulo": "Recuerdo de Prueba",
    "descripcion": "Este es un recuerdo creado para testing",
    "ubicacion": "Madrid, España",
    "fecha": "2024-12-25",
    "imagenes": ["https://i.ibb.co/xyz/test.jpg"],
    "latitud": 40.4168,
    "longitud": -3.7038
  }'
```

### 4. Obtener Recuerdo por ID
```bash
# Primero necesitas el ID del recuerdo creado
curl -X GET "${API_BASE_URL}/recuerdos/1" \
  -H "accept: */*"
```

### 5. Actualizar Recuerdo
```bash
curl -X PUT "${API_BASE_URL}/recuerdos/1" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'${TEST_USER_ID}'",
    "titulo": "Recuerdo Actualizado",
    "descripcion": "Descripción actualizada desde curl",
    "ubicacion": "Barcelona, España",
    "fecha": "2024-12-26",
    "imagenes": ["https://i.ibb.co/updated/test.jpg"],
    "latitud": 41.3851,
    "longitud": 2.1734
  }'
```

### 6. Eliminar Recuerdo
```bash
curl -X DELETE "${API_BASE_URL}/recuerdos/1" \
  -H "accept: */*"
```

## 🔍 COMANDOS DE BÚSQUEDA

### 7. Buscar por Título
```bash
curl -X GET "${API_BASE_URL}/recuerdos/search?userId=${TEST_USER_ID}&titulo=prueba" \
  -H "accept: */*"
```

### 8. Buscar por Ubicación
```bash
curl -X GET "${API_BASE_URL}/recuerdos/search?userId=${TEST_USER_ID}&ubicacion=madrid" \
  -H "accept: */*"
```

## 📊 COMANDOS DE ESTADÍSTICAS

### 9. Obtener Estadísticas
```bash
curl -X GET "${API_BASE_URL}/stats/${TEST_USER_ID}" \
  -H "accept: */*"
```

## 📅 COMANDOS DE CALENDARIO

### 10. Calendario Mensual
```bash
curl -X GET "${API_BASE_URL}/calendar/${TEST_USER_ID}?year=2024&month=12" \
  -H "accept: */*"
```

### 11. Calendario Anual
```bash
curl -X GET "${API_BASE_URL}/calendar/${TEST_USER_ID}/year?year=2024" \
  -H "accept: */*"
```

## 🎯 SCRIPT DE TESTING COMPLETO

```bash
#!/bin/bash

# Configuración
API_BASE_URL="http://localhost:8080/api"
TEST_USER_ID="test-user-123"

echo "🩺 Testing Backend Spring Boot..."

# 1. Health Check
echo "📋 1. Health Check"
curl -s "${API_BASE_URL}/health" | jq '.'

# 2. Listar recuerdos (debería estar vacío inicialmente)
echo "📋 2. Listar recuerdos vacíos"
curl -s "${API_BASE_URL}/recuerdos?userId=${TEST_USER_ID}" | jq '.'

# 3. Crear recuerdo de prueba
echo "📋 3. Crear recuerdo de prueba"
CREATED_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/recuerdos" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'${TEST_USER_ID}'",
    "titulo": "Viaje de Testing",
    "descripcion": "Recuerdo creado automáticamente para testing",
    "ubicacion": "Madrid, España",
    "fecha": "2024-12-25",
    "imagenes": ["https://i.ibb.co/testing/madrid.jpg"],
    "latitud": 40.4168,
    "longitud": -3.7038
  }')

echo $CREATED_RESPONSE | jq '.'

# Extraer el ID del recuerdo creado
RECUERDO_ID=$(echo $CREATED_RESPONSE | jq -r '.id')

if [ "$RECUERDO_ID" != "null" ]; then
  echo "📋 4. Recuerdo creado con ID: $RECUERDO_ID"
  
  # 4. Obtener el recuerdo por ID
  echo "📋 5. Obtener recuerdo por ID"
  curl -s "${API_BASE_URL}/recuerdos/${RECUERDO_ID}" | jq '.'
  
  # 5. Actualizar el recuerdo
  echo "📋 6. Actualizar recuerdo"
  curl -s -X PUT "${API_BASE_URL}/recuerdos/${RECUERDO_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "'${TEST_USER_ID}'",
      "titulo": "Viaje de Testing ACTUALIZADO",
      "descripcion": "Recuerdo actualizado automáticamente",
      "ubicacion": "Barcelona, España",
      "fecha": "2024-12-26",
      "imagenes": ["https://i.ibb.co/testing/barcelona.jpg"],
      "latitud": 41.3851,
      "longitud": 2.1734
    }' | jq '.'
  
  # 6. Buscar recuerdos
  echo "📋 7. Buscar por título"
  curl -s "${API_BASE_URL}/recuerdos/search?userId=${TEST_USER_ID}&titulo=testing" | jq '.'
  
  echo "📋 8. Buscar por ubicación"
  curl -s "${API_BASE_URL}/recuerdos/search?userId=${TEST_USER_ID}&ubicacion=barcelona" | jq '.'
  
  # 7. Estadísticas
  echo "📋 9. Obtener estadísticas"
  curl -s "${API_BASE_URL}/stats/${TEST_USER_ID}" | jq '.'
  
  # 8. Calendario
  echo "📋 10. Calendario mensual"
  curl -s "${API_BASE_URL}/calendar/${TEST_USER_ID}?year=2024&month=12" | jq '.'
  
  echo "📋 11. Calendario anual"
  curl -s "${API_BASE_URL}/calendar/${TEST_USER_ID}/year?year=2024" | jq '.'
  
  # 9. Eliminar el recuerdo de prueba
  echo "📋 12. Eliminar recuerdo de prueba"
  curl -s -X DELETE "${API_BASE_URL}/recuerdos/${RECUERDO_ID}" | jq '.'
  
  # 10. Verificar que se eliminó
  echo "📋 13. Verificar lista vacía después de eliminar"
  curl -s "${API_BASE_URL}/recuerdos?userId=${TEST_USER_ID}" | jq '.'
  
else
  echo "❌ Error: No se pudo crear el recuerdo de prueba"
fi

echo "✅ Testing completado"
```

## 🚀 INSTRUCCIONES DE USO

### Para Windows (PowerShell):
1. Define las variables:
   ```powershell
   $API_BASE_URL = "http://localhost:8080/api"
   $TEST_USER_ID = "test-user-123"
   ```

2. Ejecuta los comandos reemplazando `${API_BASE_URL}` por `$API_BASE_URL`

### Para Linux/Mac:
1. Guarda el script como `test-backend.sh`
2. Dale permisos de ejecución: `chmod +x test-backend.sh`
3. Ejecuta: `./test-backend.sh`

### Para testing rápido:
```bash
# Solo health check
curl http://localhost:8080/api/health

# Solo listar recuerdos
curl "http://localhost:8080/api/recuerdos?userId=test"
```

## 🔧 TROUBLESHOOTING

### Backend no responde:
```bash
# Verificar que el backend esté ejecutándose
curl -v http://localhost:8080/api/health
```

### Error de CORS:
- Verifica que tu backend Spring Boot tenga configurado CORS para permitir `http://localhost:3000`

### Error 404:
- Verifica que los endpoints estén implementados en tu backend
- Verifica que la URL base sea correcta

### Error de formato JSON:
- Usa herramientas como `jq` para formatear la salida JSON
- En Windows puedes usar `| ConvertFrom-Json | ConvertTo-Json -Depth 10`

## 📍 Pruebas Específicas del Sistema de Ubicaciones

### 🧪 Casos de Prueba para Autocompletado

#### **Caso 1: Selección Correcta**
```
1. Ir a "Nuevo Lugar"
2. En el campo ubicación, escribir "Torre Eif"
3. Esperar a que aparezcan sugerencias
4. Hacer CLIC en "Torre Eiffel, París, Francia"
5. ✅ ESPERADO: Campo verde con ✓, coordenadas visibles abajo
6. ✅ ESPERADO: Formulario puede guardarse sin errores
```

#### **Caso 2: Escritura Manual (Error)**
```
1. Ir a "Nuevo Lugar"
2. En el campo ubicación, escribir "Torre Eiffel"
3. Hacer clic fuera del campo SIN seleccionar sugerencia
4. ❌ ESPERADO: Campo amarillo con ⚠, sin coordenadas
5. ❌ ESPERADO: Al intentar guardar, muestra error de validación
```

#### **Caso 3: Campo Vacío**
```
1. Ir a "Nuevo Lugar"
2. Dejar campo ubicación vacío
3. ❌ ESPERADO: Al intentar guardar, muestra "La ubicación es obligatoria"
```

#### **Caso 4: Borrar Selección Previa**
```
1. Seleccionar una ubicación válida (caso 1)
2. Borrar todo el texto del campo
3. ✅ ESPERADO: Coordenadas se limpian automáticamente
4. ✅ ESPERADO: Campo vuelve al estado inicial
```

#### **Caso 5: Cambiar Selección**
```
1. Seleccionar "Torre Eiffel, París, Francia"
2. Borrar y escribir "Statue of Lib"
3. Seleccionar "Statue of Liberty, New York"
4. ✅ ESPERADO: Coordenadas se actualizan a Nueva York
5. ✅ ESPERADO: El campo mantiene estado verde
```

### 🔍 Validaciones Técnicas

#### **Verificar Coordenadas en Consola**
```javascript
// Abrir DevTools > Console
// Escribir una ubicación y seleccionar
// Buscar logs como:
✅ Lugar seleccionado exitosamente: {
  ubicacion: "Torre Eiffel, París, Francia",
  latitud: 48.8584,
  longitud: 2.2945,
  place_id: "ChIJLU7jZClu5kcR4PcOOO6p3I0"
}
```

#### **Verificar Estado del Formulario**
```javascript
// En la consola del navegador:
// Después de seleccionar una ubicación válida
console.log('Estado del formulario:', formData);
// Debe mostrar latitud y longitud definidas
```

### 🎯 Flujo Completo de Creación de Recuerdo

```
1. Abrir http://localhost:3000/nuevo-lugar
2. Llenar título: "Día romántico en París"
3. Llenar descripción: "Visitamos la Torre Eiffel al atardecer"
4. En ubicación: escribir "Torre Eiffel" y SELECCIONAR la sugerencia
5. Seleccionar fecha: hoy
6. Subir una imagen
7. ✅ ESPERADO: Botón "Crear Recuerdo" habilitado
8. Hacer clic en "Crear Recuerdo"
9. ✅ ESPERADO: Redirige a /home sin errores
10. ✅ ESPERADO: El recuerdo aparece en la lista con ubicación correcta
11. Ir a /mapa
12. ✅ ESPERADO: El recuerdo aparece en el mapa en la ubicación correcta
```

### 🚨 Casos de Error Específicos

#### **Error: Ubicación Sin Coordenadas**
```
Mensaje: "Por favor, selecciona una ubicación de las sugerencias para obtener coordenadas precisas"
Solución: Volver a escribir y hacer clic en una sugerencia
```

#### **Error: API de Google Maps No Cargada**
```
Indicador: "Cargando API" en amarillo permanente
Verificación: 
1. Comprobar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local
2. Verificar consola por errores de API
3. Verificar límites de cuota de Google Maps API
```

### 📊 Métricas de Éxito

- ✅ 100% de ubicaciones tienen coordenadas válidas
- ✅ 0 errores de geocodificación
- ✅ Feedback visual inmediato al usuario
- ✅ Prevención de errores antes del envío
- ✅ Integración perfecta con el mapa

### 🔧 Debug Avanzado

#### **Logs de Autocompletado**
```
🚀 Iniciando carga de Google Places API...
📦 Google Maps API cargada, importando librería Places...
✅ Places Library importada correctamente
🌎 Google Places API (nueva versión) cargada correctamente
🔄 Inicializando autocompletado porque Places API fue cargada
✅ Autocompletado reiniciado exitosamente
```

#### **Logs de Selección**
```
📍 Lugar obtenido del autocompletado: [Place Object]
✅ Lugar seleccionado exitosamente: {ubicacion, latitud, longitud, place_id}
📌 Actualizando FormData con nueva ubicación
```

#### **Logs de Validación**
```
📍 Actualizando ubicación antes de validar: [ubicación]
💾 handleSubmit - Iniciando proceso de guardado:
📍 Usando coordenadas del autocompletado: {latitud, longitud, ubicacion}
```
