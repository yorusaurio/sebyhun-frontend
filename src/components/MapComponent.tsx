"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Heart } from 'lucide-react';

interface Recuerdo {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  fecha: string;
  ubicacion: string;
}

interface MapLocation {
  id: number;
  ubicacion: string;
  recuerdos: Recuerdo[];
  lat?: number;
  lng?: number;
}

interface GoogleMapComponentProps {
  locations: MapLocation[];
  onLocationClick: (location: MapLocation) => void;
  selectedLocation?: MapLocation | null;
}

const GoogleMapComponent = ({ 
  locations, 
  onLocationClick, 
  selectedLocation 
}: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied' | 'unavailable'>('requesting');
  // useEffect para manejar el montaje del componente
  useEffect(() => {
    console.log('🗺️ MAPA: Componente iniciándose...');
    setIsMounted(true);
    
    return () => {
      console.log('🗺️ MAPA: Componente desmontándose...');
      setIsMounted(false);
    };
  }, []);

  // Función para obtener la ubicación del usuario
  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.log('🌍 Geolocalización no disponible en este navegador');
        setLocationStatus('unavailable');
        // Fallback a Lima, Perú
        resolve({ lat: -12.0464, lng: -77.0428 });
        return;
      }

      console.log('🌍 Solicitando ubicación del usuario...');
      setLocationStatus('requesting');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('🌍 ✅ Ubicación obtenida:', userLoc);
          setUserLocation(userLoc);
          setLocationStatus('granted');
          resolve(userLoc);
        },
        (error) => {
          console.warn('🌍 ❌ Error obteniendo ubicación:', error.message);
          setLocationStatus('denied');
          
          // Fallbacks según el tipo de error
          let fallbackLocation;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log('🌍 Permiso denegado, usando Madrid como fallback');
              fallbackLocation = { lat: 40.4168, lng: -3.7038 }; // Madrid
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('🌍 Posición no disponible, usando Barcelona como fallback');
              fallbackLocation = { lat: 41.3851, lng: 2.1734 }; // Barcelona
              break;
            case error.TIMEOUT:
              console.log('🌍 Timeout, usando Valencia como fallback');
              fallbackLocation = { lat: 39.4699, lng: -0.3763 }; // Valencia
              break;
            default:
              console.log('🌍 Error desconocido, usando Lima como fallback');
              fallbackLocation = { lat: -12.0464, lng: -77.0428 }; // Lima
              break;
          }
          
          setUserLocation(fallbackLocation);
          resolve(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 segundos
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  }, []);

  // Inicialización del mapa con manejo robusto de mapRef
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    console.log('🗺️ MAPA: Iniciando carga...', {
      locations: locations.length,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SÍ' : 'NO'
    });
    
    const waitForRefRobust = (): Promise<HTMLDivElement> => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 20; // 1 segundo máximo
        
        const checkRef = () => {
          attempts++;
          
          if (mapRef.current) {
            console.log(`🎯 MapRef encontrado en intento #${attempts}`);
            resolve(mapRef.current);
            return;
          }
          
          if (attempts >= maxAttempts) {
            console.error(`❌ MapRef no encontrado después de ${maxAttempts} intentos`);
            reject(new Error('MapRef no disponible después del timeout'));
            return;
          }
          
          console.log(`⏳ Esperando MapRef... intento ${attempts}/${maxAttempts}`);
          setTimeout(checkRef, 50);
        };
        
        checkRef();
      });
    };    const initMap = async () => {
      try {
        // Esperar a que el ref esté disponible con retry robusto
        const mapElement = await waitForRefRobust();
        console.log('🗺️ MAPA: DOM listo, obteniendo ubicación...');
        
        // Obtener ubicación del usuario
        const centerLocation = await getCurrentLocation();
        console.log('🗺️ MAPA: Ubicación obtenida, cargando Google Maps...');
        
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        console.log('🗺️ MAPA: Google Maps API cargada exitosamente');
        
        // Verificar NUEVAMENTE el ref después de cargar la API con retry
        let finalMapElement = mapRef.current;
        if (!finalMapElement) {
          console.warn('⚠️ MapRef se volvió null después de cargar la API, reintentando...');
          
          // Reintentar obtener el ref hasta 5 veces
          for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            finalMapElement = mapRef.current;
            
            if (finalMapElement) {
              console.log(`✅ MapRef recuperado en reintento #${i + 1}`);
              break;
            }
          }
          
          if (!finalMapElement) {
            throw new Error('MapRef perdido permanentemente después de cargar Google Maps API');
          }
        }

        console.log('🎯 MapRef confirmado, creando mapa centrado en:', centerLocation);
        
        const mapInstance = new google.maps.Map(finalMapElement, {
          center: centerLocation,
          zoom: locations.length > 0 ? 10 : 13, // Zoom mayor si no hay ubicaciones específicas
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry.fill',
              stylers: [{ color: '#fce4ec' }] // Rosa muy claro
            },
            {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#e1f5fe' }] // Azul muy claro
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#f8bbd9' }] // Rosa claro
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });

        // Si tenemos la ubicación del usuario, agregar un marcador
        if (locationStatus === 'granted' && userLocation) {
          const userMarker = new google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            title: 'Tu ubicación',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285f4', // Azul de Google
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            zIndex: 1000 // Asegurar que aparezca encima
          });

          const userInfoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; font-family: ui-sans-serif, system-ui, sans-serif;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: #4285f4; font-size: 16px;">📍</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: bold;">Tu ubicación actual</span>
                </div>
              </div>
            `
          });

          userMarker.addListener('click', () => {
            userInfoWindow.open(mapInstance, userMarker);
          });
        }

        console.log('🗺️ MAPA: ✅ Creado exitosamente');

        const geocoderInstance = new google.maps.Geocoder();
        
        setGeocoder(geocoderInstance);
        setMap(mapInstance);
        setIsLoading(false);
        
        console.log('🗺️ MAPA: ✅ Configuración completada');
      } catch (error) {
        console.error('🗺️ MAPA: ❌ ERROR -', error instanceof Error ? error.message : error);
        setIsLoading(false);
        setHasError(true);
      }
    };

    // Solo inicializar si no tenemos mapa aún
    if (!map) {
      // Timeout de seguridad por si algo falla
      const timer = setTimeout(() => {
        console.log('🗺️ MAPA: ⏰ Timeout - forzando fin de carga');
        setIsLoading(false);
        setHasError(true);
      }, 15000); // 15 segundos
      
      initMap().finally(() => {
        clearTimeout(timer);
      });
    }
  }, [isMounted, map]);

  const processLocations = useCallback(async () => {
    if (!map || !geocoder || !isMounted) {
      return;
    }

    console.log('🗺️ MARCADORES: Procesando', locations.length, 'ubicaciones...');
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    // Procesar cada ubicación secuencialmente
    for (let index = 0; index < locations.length; index++) {
      const location = locations[index];
      
      try {
        // Verificar que el componente siga montado
        if (!isMounted) {
          break;
        }

        // Geocodificar la ubicación
        const response = await geocoder.geocode({ address: location.ubicacion });
        
        if (response.results && response.results.length > 0) {
          const position = response.results[0].geometry.location;
          
          // Crear marcador personalizado
          const marker = new google.maps.Marker({
            position: position,
            map: map,
            title: location.ubicacion,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: location.recuerdos.length > 1 ? '#ec4899' : '#f472b6',
              fillOpacity: 0.8,
              strokeColor: '#be185d',
              strokeWeight: 3,
            },
            zIndex: location.recuerdos.length
          });

          // Crear info window personalizada
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; font-family: ui-sans-serif, system-ui, sans-serif;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="color: #ec4899; font-size: 18px;">📍</span>
                  <h3 style="margin: 0; color: #1f2937; font-size: 16px; font-weight: bold;">${location.ubicacion}</h3>
                </div>
                <div style="margin-bottom: 8px;">
                  <span style="color: #6b7280; font-size: 14px;">
                    ${location.recuerdos.length} recuerdo${location.recuerdos.length !== 1 ? 's' : ''} guardado${location.recuerdos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style="max-height: 100px; overflow-y: auto;">
                  ${location.recuerdos.slice(0, 3).map(recuerdo => `
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; padding: 4px; background: #fdf2f8; border-radius: 6px;">
                      <div style="width: 6px; height: 6px; background: linear-gradient(45deg, #ec4899, #8b5cf6); border-radius: 50%; flex-shrink: 0;"></div>
                      <span style="color: #374151; font-size: 13px; line-height: 1.2;">${recuerdo.titulo}</span>
                    </div>
                  `).join('')}
                  ${location.recuerdos.length > 3 ? `
                    <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 4px;">
                      +${location.recuerdos.length - 3} más recuerdos
                    </div>
                  ` : ''}
                </div>
                <div style="margin-top: 10px; text-align: center;">
                  <span style="color: #ec4899; font-size: 12px; font-style: italic;">💕 Haz clic para ver detalles 💕</span>
                </div>
              </div>
            `
          });

          // Event listeners
          marker.addListener('click', () => {
            // Cerrar cualquier info window abierta
            newMarkers.forEach(m => {
              if ((m as google.maps.Marker & { infoWindow?: google.maps.InfoWindow }).infoWindow) {
                (m as google.maps.Marker & { infoWindow: google.maps.InfoWindow }).infoWindow.close();
              }
            });
            
            infoWindow.open(map, marker);
            onLocationClick(location);
          });

          marker.addListener('mouseover', () => {
            marker.setIcon({
              path: google.maps.SymbolPath.CIRCLE,
              scale: 18,
              fillColor: '#be185d',
              fillOpacity: 1,
              strokeColor: '#9d174d',
              strokeWeight: 4,
            });
          });

          marker.addListener('mouseout', () => {
            marker.setIcon({
              path: google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: location.recuerdos.length > 1 ? '#ec4899' : '#f472b6',
              fillOpacity: 0.8,
              strokeColor: '#be185d',
              strokeWeight: 3,
            });
          });

          // Guardar referencia al info window
          (marker as google.maps.Marker & { infoWindow: google.maps.InfoWindow }).infoWindow = infoWindow;
          
          newMarkers.push(marker);
          bounds.extend(position);
        } else {
          console.log('🗺️ MARCADORES: ⚠️ Sin resultados para:', location.ubicacion);
        }
      } catch (error) {
        console.error('🗺️ MARCADORES: ❌ Error en', location.ubicacion, '-', error instanceof Error ? error.message : error);
      }
    }

    // Verificar nuevamente que el componente siga montado antes de actualizar el estado
    if (!isMounted) {
      return;
    }

    setMarkers(newMarkers);

    // Ajustar el mapa para mostrar todos los marcadores
    if (newMarkers.length > 0) {
      if (newMarkers.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(12);
      } else {
        map.fitBounds(bounds);
        map.setZoom(Math.min(map.getZoom() || 10, 12));
      }
      console.log('🗺️ MARCADORES: ✅', newMarkers.length, 'marcadores creados');
    } else {
      console.log('🗺️ MARCADORES: ⚠️ Sin marcadores para mostrar');
    }
  }, [map, geocoder, locations, onLocationClick, isMounted]);

  // useEffect para crear marcadores
  useEffect(() => {
    if (!map || !geocoder || !isMounted) {
      return;
    }

    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    if (locations.length === 0) {
      return;
    }

    processLocations();
  }, [map, geocoder, locations, processLocations]);

  // Resaltar ubicación seleccionada
  useEffect(() => {
    if (!selectedLocation || markers.length === 0) {
      return;
    }

    markers.forEach((marker) => {
      const isSelected = marker.getTitle() === selectedLocation.ubicacion;
      
      if (isSelected) {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#be185d',
          fillOpacity: 1,
          strokeColor: '#9d174d',
          strokeWeight: 5,
        });
        
        // Opcional: centrar el mapa en el marcador seleccionado
        if (map) {
          map.panTo(marker.getPosition()!);
        }
      } else {
        const location = locations.find(l => l.ubicacion === marker.getTitle());
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: location && location.recuerdos.length > 1 ? '#ec4899' : '#f472b6',
          fillOpacity: 0.8,
          strokeColor: '#be185d',
          strokeWeight: 3,
        });
      }
    });
  }, [selectedLocation, markers, locations, map]);
  
  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg border border-pink-200">
      {/* Map container always mounted */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center z-10">
          <div className="text-center p-8 max-w-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium mb-2">Cargando mapa romántico...</p>
            <p className="text-sm text-gray-500 mb-4">Preparando nuestros recuerdos 💕</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <h4 className="font-semibold text-blue-800 text-sm">Estado de carga</h4>
              </div>
              <div className="text-blue-700 text-xs space-y-1">
                <p>✅ API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Configurada' : '❌ NO configurada'}</p>
                <p>✅ Componente: Iniciado</p>
                <p>
                  🌍 Ubicación: {
                    locationStatus === 'requesting' ? '⏳ Solicitando...' :
                    locationStatus === 'granted' ? '✅ Obtenida' :
                    locationStatus === 'denied' ? '⚠️ Denegada (usando fallback)' :
                    '❌ No disponible (usando fallback)'
                  }
                </p>
                <p>⏳ Google Maps API: Cargando...</p>
                <p className="text-blue-600 mt-2 italic">
                  {locationStatus === 'requesting' && 'Permite el acceso a tu ubicación para una mejor experiencia'}
                  {locationStatus === 'denied' && 'Usando ubicación por defecto'}
                  {locationStatus === 'unavailable' && 'Geolocalización no disponible en tu navegador'}
                  {locationStatus === 'granted' && 'Mapa centrado en tu ubicación'}
                </p>
              </div>
            </div>
            
            {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <h4 className="font-semibold text-yellow-800 text-sm">⚠️ API Key requerida</h4>
                </div>
                <p className="text-yellow-700 text-xs leading-relaxed">
                  Para ver el mapa interactivo, configura tu API Key de Google Maps en <code className="bg-yellow-100 px-1 rounded text-xs">.env.local</code>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center z-10">
          <div className="text-center p-8 max-w-lg">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <p className="text-gray-600 font-medium mb-2">Error al cargar el mapa</p>
            <p className="text-sm text-gray-500 mb-4">Revisa la consola del navegador para más detalles</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <h4 className="font-semibold text-red-800 text-sm">Posibles causas</h4>
              </div>
              <div className="text-red-700 text-xs space-y-1">
                <p>• API Key de Google Maps no configurada o inválida</p>
                <p>• Problema de conexión a internet</p>
                <p>• Límites de la API excedidos</p>
                <p>• Problema temporal del servicio de Google Maps</p>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Map overlays and controls when map is ready */}
      {!isLoading && !hasError && (
        <>
          {/* Overlay con información */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-pink-200">
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="font-medium text-gray-700">
                {locations.length} lugar{locations.length !== 1 ? 'es' : ''} visitado{locations.length !== 1 ? 's' : ''}
              </span>
            </div>
            {locations.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                💕 Haz clic en los marcadores para explorar
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-pink-200">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full border-2 border-pink-600"></div>
                <span className="text-gray-700">1 recuerdo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-600 rounded-full border-2 border-pink-800"></div>
                <span className="text-gray-700">Múltiples recuerdos</span>
              </div>
            </div>
          </div>      {/* Botón para centrar mapa */}
          {locations.length > 1 && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => {
                  if (map && markers.length > 0) {
                    const bounds = new google.maps.LatLngBounds();
                    markers.forEach(marker => bounds.extend(marker.getPosition()!));
                    map.fitBounds(bounds);
                    map.setZoom(Math.min(map.getZoom() || 10, 12));
                  }
                }}
                className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg border border-pink-200 transition-all duration-200 mb-2"
                title="Ver todos los lugares"
              >
                <MapPin className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Botón para ir a mi ubicación */}
          {userLocation && (
            <div className="absolute top-4 right-4" style={{ marginTop: locations.length > 1 ? '3rem' : '0' }}>
              <button
                onClick={() => {
                  if (map && userLocation) {
                    map.panTo(userLocation);
                    map.setZoom(15);
                  }
                }}
                className="bg-blue-500/90 backdrop-blur-sm hover:bg-blue-600 text-white p-2 rounded-full shadow-lg border border-blue-300 transition-all duration-200"
                title="Ir a mi ubicación"
              >
                <div className="h-4 w-4 flex items-center justify-center">
                  🌍
                </div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GoogleMapComponent;
