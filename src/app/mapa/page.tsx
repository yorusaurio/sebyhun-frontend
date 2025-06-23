"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Heart, 
  MapPin, 
  Camera,
  Calendar,
  Sparkles,
  Edit3,
  Trash2,
  X,
  Plus,
  Navigation,
  Map as MapIcon,
  Filter,
  Search,
  Globe,
  Compass,
  Star
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';
import { formatDateSafe, parseLocalDate, compareDates } from "@/utils/dateUtils";

const GoogleMapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-pink-50 rounded-2xl flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
  </div>
});

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

export default function MapaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recuerdos, setRecuerdos] = useState<Recuerdo[]>([]);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [selectedRecuerdo, setSelectedRecuerdo] = useState<Recuerdo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'map' | 'grid' | 'list'>('map');
  const [filterByYear, setFilterByYear] = useState<string>('all');

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    // Cargar recuerdos del localStorage
    const recuerdosGuardados = JSON.parse(localStorage.getItem('sebyhun-recuerdos') || '[]');
    setRecuerdos(recuerdosGuardados);
    
    // Agrupar recuerdos por ubicación
    const locationMap = new Map<string, MapLocation>();
      recuerdosGuardados.forEach((recuerdo: Recuerdo) => {
      const ubicacion = recuerdo.ubicacion;
      if (locationMap.has(ubicacion)) {
        locationMap.get(ubicacion)!.recuerdos.push(recuerdo);
      } else {
        locationMap.set(ubicacion, {
          id: Date.now() + Math.random(),
          ubicacion,
          recuerdos: [recuerdo]
          // Las coordenadas se obtienen automáticamente mediante geocoding en GoogleMapComponent
        });
      }
    });
    
    setLocations(Array.from(locationMap.values()));
  }, [session, status, router]);

  const handleDeleteRecuerdo = (id: number) => {
    const nuevosRecuerdos = recuerdos.filter(r => r.id !== id);
    setRecuerdos(nuevosRecuerdos);
    localStorage.setItem('sebyhun-recuerdos', JSON.stringify(nuevosRecuerdos));
    setShowDeleteModal(null);
    setSelectedRecuerdo(null);
    setSelectedLocation(null);
  };

  const handleEditRecuerdo = (id: number) => {
    router.push(`/editar-recuerdo/${id}`);
  };

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleRecuerdoClick = (recuerdo: Recuerdo) => {
    setSelectedRecuerdo(recuerdo);
  };
  const formatDate = (dateString: string) => {
    return formatDateSafe(dateString);
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.recuerdos.some(r => r.titulo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesYear = filterByYear === 'all' || 
                       location.recuerdos.some(r => parseLocalDate(r.fecha).getFullYear().toString() === filterByYear);
    
    return matchesSearch && matchesYear;
  });

  const getYearsFromRecuerdos = () => {
    const years = new Set<string>();
    recuerdos.forEach(r => {
      years.add(parseLocalDate(r.fecha).getFullYear().toString());
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-700 font-medium">Cargando mapa de recuerdos...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Navbar />
      
      {/* Partículas decorativas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-60 left-20 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-300 opacity-40"></div>
        <div className="absolute bottom-40 right-10 w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-700 opacity-70"></div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header romántico */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-pink-500 animate-pulse" />
            <Heart className="h-6 w-6 text-pink-400" />
            <Compass className="h-8 w-8 text-purple-500 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Mapa de Nuestro Amor
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Cada lugar que hemos visitado juntos cuenta una historia única. Explora el mapa de nuestros recuerdos 
            y revive los momentos más especiales de nuestra aventura.
          </p>
        </div>

        {/* Estadísticas del mapa */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100">
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-pink-600">{locations.length}</div>
            <div className="text-sm text-gray-600">Lugares Visitados</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Camera className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{recuerdos.length}</div>
            <div className="text-sm text-gray-600">Recuerdos Guardados</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{new Set(recuerdos.map(r => parseLocalDate(r.fecha).getFullYear())).size}</div>
            <div className="text-sm text-gray-600">Años de Aventuras</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100">
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-pink-600">∞</div>
            <div className="text-sm text-gray-600">Amor Infinito</div>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar lugares o recuerdos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 bg-white/80"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={filterByYear}
                onChange={(e) => setFilterByYear(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300 bg-white/80"
              >
                <option value="all">Todos los años</option>
                {getYearsFromRecuerdos().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>              <div className="flex bg-white/80 rounded-xl border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'map' 
                      ? 'bg-pink-500 text-white shadow-md' 
                      : 'text-gray-500 hover:text-pink-500'
                  }`}
                  title="Vista de mapa"
                >
                  <Globe className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-pink-500 text-white shadow-md' 
                      : 'text-gray-500 hover:text-pink-500'
                  }`}
                  title="Vista en cuadrícula"
                >
                  <MapIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-pink-500 text-white shadow-md' 
                      : 'text-gray-500 hover:text-pink-500'
                  }`}
                  title="Vista de lista"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para crear nuevo recuerdo */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/nuevo-lugar")}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
            Agregar Nuevo Lugar
            <Navigation className="h-5 w-5 animate-pulse" />
          </button>
        </div>        {/* Contenido principal */}
        {filteredLocations.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto shadow-lg">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="relative">
                  <Globe className="h-16 w-16 text-pink-400 animate-pulse" />
                  <Heart className="h-6 w-6 text-purple-400 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <div className="text-4xl font-bold text-pink-500">+</div>
                <div className="relative">
                  <MapPin className="h-16 w-16 text-purple-400 animate-pulse delay-300" />
                  <Star className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
                </div>
              </div>

              <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                ¡Comencemos a explorar!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Aún no hay lugares en tu mapa. Crea tu primer recuerdo y comenzemos a trazar 
                la geografía de nuestro amor.
              </p>
              
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 mb-6">
                <p className="text-pink-700 italic text-sm">
                  &ldquo;El mundo es un libro y aquellos que no viajan leen solo una página&rdquo; 💕
                </p>
              </div>
              
              <button
                onClick={() => router.push("/nuevo-lugar")}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <MapPin className="h-5 w-5" />
                Crear Primer Recuerdo
                <Sparkles className="h-4 w-4 animate-pulse" />
              </button>
            </div>
          </div>        ) : viewMode === 'map' ? (
          /* Vista del mapa interactivo */
          <div className="space-y-6">
            {/* Mensaje informativo para Google Maps */}
            {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'tu_google_maps_api_key_aqui') && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">🗺️ ¡Activa el Mapa Interactivo!</h3>
                    <p className="text-blue-700 mb-4 leading-relaxed">
                      Para ver tus recuerdos marcados en Google Maps de forma interactiva, necesitas configurar tu clave de API de Google Maps.
                    </p>
                    <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-2">📝 Pasos rápidos:</h4>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Google Cloud Console</a></li>
                        <li>Habilita las APIs de &ldquo;Maps JavaScript&rdquo; y &ldquo;Geocoding&rdquo;</li>
                        <li>Crea una clave de API</li>
                        <li>Cópiala en tu archivo <code className="bg-blue-100 px-1 rounded text-xs">.env.local</code></li>
                      </ol>
                      <p className="text-xs text-blue-600 mt-3 italic">
                        💡 Una vez configurado, recarga la página para ver el mapa completo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <GoogleMapComponent 
              locations={filteredLocations}
              onLocationClick={handleLocationClick}
              selectedLocation={selectedLocation}
            />
            
            {/* Lista compacta debajo del mapa */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-bold text-gray-900">Lugares en el Mapa</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    className={`group p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      selectedLocation?.id === location.id
                        ? 'border-pink-400 bg-pink-50 shadow-md'
                        : 'border-gray-200 bg-white/50 hover:border-pink-300 hover:bg-pink-25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {location.recuerdos[0]?.imagen ? (
                          <Image
                            src={location.recuerdos[0].imagen}
                            alt={location.ubicacion}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                            <Camera className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                          {location.ubicacion}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {location.recuerdos.length} recuerdo{location.recuerdos.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedLocation?.id === location.id
                            ? 'bg-pink-500 animate-pulse'
                            : 'bg-pink-300'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>          </div>
        ) : (
          /* Vista en grid o lista */
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'space-y-6'
          }`}>
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                onClick={() => handleLocationClick(location)}
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 border border-pink-100 ${
                  viewMode === 'list' ? 'flex gap-6 p-6' : 'flex-col'
                }`}
              >
                {/* Imagen principal del lugar */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'w-32 h-32 rounded-xl flex-shrink-0' : 'h-48'
                }`}>
                  {location.recuerdos[0]?.imagen ? (
                    <Image
                      src={location.recuerdos[0].imagen}
                      alt={location.ubicacion}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay con estadísticas */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {location.recuerdos.length} recuerdo{location.recuerdos.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Decoración */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {location.recuerdos.length}
                    </div>
                  </div>
                </div>

                {/* Información del lugar */}
                <div className={`${viewMode === 'list' ? 'flex-1' : 'p-6'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-pink-500" />
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                      {location.ubicacion}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Recuerdos más recientes */}
                    {location.recuerdos.slice(0, viewMode === 'list' ? 2 : 3).map((recuerdo) => (
                      <div key={recuerdo.id} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 line-clamp-1 flex-1">{recuerdo.titulo}</span>
                        <span className="text-gray-500 text-xs">
                          {parseLocalDate(recuerdo.fecha).getFullYear()}
                        </span>
                      </div>
                    ))}
                    
                    {location.recuerdos.length > (viewMode === 'list' ? 2 : 3) && (
                      <div className="text-xs text-gray-500 text-center">
                        +{location.recuerdos.length - (viewMode === 'list' ? 2 : 3)} más recuerdos
                      </div>
                    )}
                  </div>
                  
                  {/* Fechas */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Primer visita</span>
                      <span>
                        {formatDate(location.recuerdos.sort((a, b) => 
                          compareDates(a.fecha, b.fecha)
                        )[0].fecha)}
                      </span>
                    </div>                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de ubicación seleccionada */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 relative">
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-6 w-6" />
                <h2 className="text-2xl font-bold">{selectedLocation.ubicacion}</h2>
              </div>
              
              <p className="text-white/90 text-sm">
                {selectedLocation.recuerdos.length} recuerdo{selectedLocation.recuerdos.length !== 1 ? 's' : ''} guardado{selectedLocation.recuerdos.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Lista de recuerdos */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedLocation.recuerdos.map((recuerdo) => (
                  <div
                    key={recuerdo.id}
                    onClick={() => handleRecuerdoClick(recuerdo)}
                    className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-200 shadow-sm cursor-pointer hover:shadow-md transition-all relative group"
                  >
                    {/* Botones de acción */}
                    <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(null);
                          handleEditRecuerdo(recuerdo.id);
                        }}
                        className="bg-white/95 hover:bg-blue-50 text-blue-600 p-1.5 rounded-full shadow-md transition-all"
                        title="Editar recuerdo"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(null);
                          setShowDeleteModal(recuerdo.id);
                        }}
                        className="bg-white/95 hover:bg-red-50 text-red-600 p-1.5 rounded-full shadow-md transition-all"
                        title="Eliminar recuerdo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex gap-4">
                      {/* Imagen del recuerdo */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        {recuerdo.imagen ? (
                          <Image
                            src={recuerdo.imagen}
                            alt={recuerdo.titulo}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Información del recuerdo */}
                      <div className="flex-1 min-w-0 pr-16">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                          {recuerdo.titulo}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="text-sm font-medium">{formatDate(recuerdo.fecha)}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {recuerdo.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Indicador de clickeable */}
                    <div className="absolute bottom-3 right-3">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <span>Ver detalles</span>
                        <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  router.push("/nuevo-lugar");
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Agregar Recuerdo Aquí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle del recuerdo individual */}
      {selectedRecuerdo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              {/* Botón cerrar */}
              <button
                onClick={() => setSelectedRecuerdo(null)}
                className="absolute top-4 right-4 bg-white/90 text-gray-700 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200 z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Imagen del recuerdo */}
              <div className="relative h-64 overflow-hidden rounded-t-3xl">
                {selectedRecuerdo.imagen ? (
                  <Image
                    src={selectedRecuerdo.imagen}
                    alt={selectedRecuerdo.titulo}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <Camera className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              {/* Contenido del modal */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="h-6 w-6 text-pink-500" />
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {selectedRecuerdo.titulo}
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">{selectedRecuerdo.ubicacion}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    <span>{formatDate(selectedRecuerdo.fecha)}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-500" />
                    Nuestro Recuerdo
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedRecuerdo.descripcion}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => {
                      setSelectedRecuerdo(null);
                      handleEditRecuerdo(selectedRecuerdo.id);
                    }}
                    className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecuerdo(null);
                      setShowDeleteModal(selectedRecuerdo.id);
                    }}
                    className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 italic">
                    &ldquo;Cada lugar visitado contigo se convierte en un hogar para mi corazón&rdquo; 💕
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar recuerdo?</h3>
              <p className="text-gray-600 mb-6">
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este recuerdo del mapa?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteRecuerdo(showDeleteModal)}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
