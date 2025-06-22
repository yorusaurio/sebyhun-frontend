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

export default function GoogleMapComponent({ locations, onLocationClick, selectedLocation }: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  // useEffect para manejar el montaje del componente
  useEffect(() => {
    console.log('🗺️ MAPA: Componente iniciándose...');
    setIsMounted(true);
    
    return () => {
      console.log('🗺️ MAPA: Componente desmontándose...');
      setIsMounted(false);
    };
  }, []);
  // Inicialización del mapa
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    console.log('�️ MAPA: Iniciando carga...', {
      locations: locations.length,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SÍ' : 'NO'
    });
    
    const waitForRef = () => {
      return new Promise<void>((resolve) => {
        const checkRef = () => {
          if (mapRef.current) {
            resolve();
          } else {
            setTimeout(checkRef, 50);
          }
        };
        checkRef();
      });
    };

    const initMap = async () => {
      try {
        // Esperar a que el ref esté disponible        await waitForRef();
        console.log('🗺️ MAPA: DOM listo, cargando Google Maps...');
        
        console.log('🗺️ MAPA: Creando Loader...');
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });
        console.log('🗺️ MAPA: Loader creado, iniciando carga...');

        const google = await loader.load();
        console.log('🗺️ MAPA: Google Maps API cargada exitosamente');
        
        // Verificar nuevamente que el ref esté disponible después de cargar la API
        if (!mapRef.current) {
          console.log('❌ mapRef.current se volvió null después de cargar la API');
          throw new Error('MapRef perdido después de cargar Google Maps API');
        }

        console.log('🎯 MapRef encontrado, creando mapa...');
        console.log('📐 MapRef dimensions:', {
          width: mapRef.current.offsetWidth,
          height: mapRef.current.offsetHeight,
          visible: mapRef.current.offsetParent !== null
        });
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.4168, lng: -3.7038 }, // Madrid por defecto
          zoom: 6,
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
        });        console.log('🗺️ MAPA: ✅ Creado exitosamente');

        const geocoderInstance = new google.maps.Geocoder();
        
        setGeocoder(geocoderInstance);
        setMap(mapInstance);
        setIsLoading(false);
        
        console.log('🗺️ MAPA: ✅ Configuración completada');
      } catch (error) {        console.log('�️ MAPA: ❌ ERROR -', error instanceof Error ? error.message : error);
        setIsLoading(false);
      }
    };    // Solo inicializar si no tenemos mapa aún
    if (!map) {
      // Timeout de seguridad por si algo falla
      const timer = setTimeout(() => {
        console.log('🗺️ MAPA: ⏰ Timeout - forzando fin de carga');
        setIsLoading(false);
      }, 15000); // 15 segundos
      
      initMap().finally(() => {
        clearTimeout(timer);
      });
    }
  }, [isMounted, map]); // Removido 'locations' para evitar loop infinito
  const processLocations = useCallback(async () => {
    if (!map || !geocoder || !isMounted) {
      return;
    }

    console.log('�️ MARCADORES: Procesando', locations.length, 'ubicaciones...');
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    // Procesar cada ubicación secuencialmente para evitar problemas con async/await
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
              fillColor: location.recuerdos.length > 1 ? '#ec4899' : '#f472b6', // Rosa más intenso si hay más recuerdos
              fillOpacity: 0.8,
              strokeColor: '#be185d',
              strokeWeight: 3,
            },
            zIndex: location.recuerdos.length // Los lugares con más recuerdos aparecen encima
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
          });          // Event listeners
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
          });          // Guardar referencia al info window
          (marker as google.maps.Marker & { infoWindow: google.maps.InfoWindow }).infoWindow = infoWindow;
          
          newMarkers.push(marker);
          bounds.extend(position);
        } else {
          console.log('🗺️ MARCADORES: ⚠️ Sin resultados para:', location.ubicacion);
        }
      } catch (error) {        console.log('🗺️ MARCADORES: ❌ Error en', location.ubicacion, '-', error instanceof Error ? error.message : error);
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
    }    processLocations();
  }, [map, geocoder, locations, processLocations]); // Removido markers, onLocationClick, isMounted para evitar loops

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
  if (isLoading) {
    return (
      <div className="w-full h-[500px] bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl flex items-center justify-center border border-pink-200">
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
              <p>⏳ Google Maps API: Cargando...</p>
              <p className="text-blue-600 mt-2 italic">
                Si tarda más de 15 segundos, revisa la consola del navegador
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
    );
  }

  console.log('🗺️ Renderizando mapa - Estado de carga terminado');
  console.log('📊 Estado final:', {
    map: map ? 'Presente' : 'No presente',
    geocoder: geocoder ? 'Presente' : 'No presente',
    markers: markers.length,
    locations: locations.length
  });

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg border border-pink-200 relative">
      <div ref={mapRef} className="w-full h-full" />
      
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
      </div>

      {/* Botón para centrar mapa */}
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
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg border border-pink-200 transition-all duration-200"
            title="Ver todos los lugares"
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
