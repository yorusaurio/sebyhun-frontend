# 🗺️ Configuración del Mapa Interactivo - SebYhun

## ¿Qué es la funcionalidad del Mapa?

La página de **Mapa** (`/mapa`) es una de las características más románticas de SebYhun. Te permite visualizar todos tus recuerdos de pareja marcados geográficamente en un mapa interactivo de Google Maps.

### ✨ Características principales:

- **Marcadores Inteligentes**: Cada ubicación se muestra como un punto rosa en el mapa
- **Agrupación Automática**: Los recuerdos se agrupan por ubicación automáticamente
- **Info Windows Románticos**: Al hacer clic en un marcador, se muestra información de todos los recuerdos de ese lugar
- **Geocodificación Real**: Las direcciones se convierten automáticamente en coordenadas precisas
- **Diseño Responsivo**: Funciona perfectamente en móvil y desktop
- **Múltiples Vistas**: Alterna entre vista de mapa, grid y lista

## 🔧 Configuración de Google Maps API

Para que el mapa funcione completamente, necesitas configurar una clave de API de Google Maps:

### Paso 1: Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs y servicios" → "Biblioteca"

### Paso 2: Habilitar APIs necesarias
Busca y habilita estas APIs:
- **Maps JavaScript API** (para mostrar el mapa)
- **Geocoding API** (para convertir direcciones en coordenadas)

### Paso 3: Crear clave de API
1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "Clave de API"
3. Copia la clave generada

### Paso 4: Configurar en tu proyecto
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza `tu_google_maps_api_key_aqui` con tu clave real:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBvOkBwgdtVnmg5w4N3wl6BWukTk...
```

### Paso 5: Reiniciar la aplicación
1. Detén el servidor de desarrollo (Ctrl+C)
2. Ejecuta `npm run dev` nuevamente
3. Ve a `/mapa` y disfruta del mapa interactivo

## 🎨 Experiencia de Usuario

### Cuando NO hay clave configurada:
- Se muestra un mensaje informativo con instrucciones
- Los recuerdos se muestran en vista de grid/lista normalmente
- La funcionalidad básica sigue disponible

### Cuando SÍ hay clave configurada:
- Mapa completamente interactivo con estilo romántico
- Marcadores que cambian de tamaño según la cantidad de recuerdos
- Info windows personalizados con detalles de cada lugar
- Geocodificación automática de direcciones
- Centrado automático del mapa según los marcadores

## 💡 Consejos de Uso

1. **Direcciones Precisas**: Escribe direcciones completas para mejor geocodificación
   - ✅ "Torre Eiffel, París, Francia"
   - ✅ "Central Park, Nueva York, NY, EE.UU."
   - ❌ "El parque"

2. **Visualización Óptima**: El mapa se ajusta automáticamente para mostrar todos tus recuerdos

3. **Interacción**: 
   - Haz clic en marcadores para ver detalles
   - Usa los controles de zoom y arrastre
   - Cambia entre vistas con los botones superiores

## 🔒 Seguridad

- La clave de API está configurada como `NEXT_PUBLIC_*` para uso en el frontend
- Considera restringir tu clave de API a tu dominio en Google Cloud Console
- Para producción, configura restricciones de HTTP referrer

## 🎉 ¡Disfruta!

Una vez configurado, tendrás un mapa completamente funcional que convierte tus recuerdos de pareja en una experiencia visual romántica e interactiva. ¡Cada lugar visitado juntos se convertirá en un punto especial en vuestro mapa del amor! 💕

---

**Nota**: Sin la clave de API, la aplicación funciona perfectamente en las vistas de grid y lista. El mapa es una característica adicional que enriquece la experiencia visual.
