"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, MapPin, Plus, Calendar, Sparkles, Edit3, Trash2, X, Camera, Star, BookOpen } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatDateSafe, compareDates } from "@/utils/dateUtils";

interface Recuerdo {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  fecha: string;
  ubicacion: string;
}

export default function HomeRecuerdos() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recuerdos, setRecuerdos] = useState<Recuerdo[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [selectedRecuerdo, setSelectedRecuerdo] = useState<Recuerdo | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }    // Cargar recuerdos del localStorage
    const recuerdosGuardados = JSON.parse(localStorage.getItem('sebyhun-recuerdos') || '[]');
    
    // LOG: Verificar fechas al cargar en HOME
    console.log('🏠 Cargando recuerdos en HOME - Total:', recuerdosGuardados.length);
    recuerdosGuardados.forEach((recuerdo: any, index: number) => {
      console.log(`📅 Recuerdo ${index + 1}:`, {
        id: recuerdo.id,
        titulo: recuerdo.titulo,
        fecha: recuerdo.fecha,
        fechaTipo: typeof recuerdo.fecha,
        fechaComoDate: new Date(recuerdo.fecha),
        fechaFormateada: new Date(recuerdo.fecha).toLocaleDateString('es-ES')
      });
    });
      // Ordenar por fecha descendente usando la función utilitaria segura
    recuerdosGuardados.sort((a: Recuerdo, b: Recuerdo) => 
      compareDates(b.fecha, a.fecha)
    );
    
    setRecuerdos(recuerdosGuardados);
  }, [session, status, router]);

  const handleDeleteRecuerdo = (id: number) => {
    const nuevosRecuerdos = recuerdos.filter(r => r.id !== id);
    setRecuerdos(nuevosRecuerdos);
    localStorage.setItem('sebyhun-recuerdos', JSON.stringify(nuevosRecuerdos));
    setShowDeleteModal(null);
  };

  const handleEditRecuerdo = (id: number) => {
    router.push(`/editar-recuerdo/${id}`);
  };

  const handleRecuerdoClick = (recuerdo: Recuerdo) => {
    setSelectedRecuerdo(recuerdo);
  };

  const closeModal = () => {
    setSelectedRecuerdo(null);
  };  const formatDate = (dateString: string) => {
    // Usar la función utilitaria segura
    return formatDateSafe(dateString);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-700 font-medium">Cargando nuestros recuerdos...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Navbar />
      
      {/* Partículas decorativas sutiles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-60 left-20 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-300 opacity-40"></div>
        <div className="absolute bottom-40 right-10 w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-700 opacity-70"></div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header romántico */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Nuestros Recuerdos
            </h1>
            <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Cada momento juntos es un tesoro. Aquí guardamos los recuerdos de nuestras aventuras, 
            creando un diario de amor que perdurará para siempre.
          </p>
        </div>

        {/* Estadísticas románticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100">
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-pink-600">{recuerdos.length}</div>
            <div className="text-sm text-gray-600">Recuerdos Creados</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{new Set(recuerdos.map(r => r.ubicacion)).size}</div>
            <div className="text-sm text-gray-600">Lugares Visitados</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Camera className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{recuerdos.filter(r => r.imagen).length}</div>
            <div className="text-sm text-gray-600">Fotos Guardadas</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100">
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-pink-600">∞</div>
            <div className="text-sm text-gray-600">Amor Infinito</div>
          </div>
        </div>

        {/* Botón para crear nuevo recuerdo */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.push("/nuevo-lugar")}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
            Crear Nuevo Recuerdo
            <Sparkles className="h-5 w-5 animate-pulse" />
          </button>
        </div>

        {/* Grid de recuerdos */}
        {recuerdos.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto shadow-lg">
              {/* Iconos románticos */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="relative">
                  <Heart className="h-16 w-16 text-pink-400 animate-pulse" />
                  <Sparkles className="h-6 w-6 text-purple-400 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <div className="text-4xl font-bold text-pink-500">+</div>
                <div className="relative">
                  <BookOpen className="h-16 w-16 text-purple-400 animate-pulse delay-300" />
                  <Star className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
                </div>
              </div>

              <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                ¡Comencemos nuestra historia!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Aún no tienes recuerdos guardados. Crea tu primer recuerdo y comenzemos a escribir juntos 
                la historia de nuestros momentos más especiales.
              </p>
              
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 mb-6">
                <p className="text-pink-700 italic text-sm">
                  &ldquo;Cada gran historia de amor comienza con un solo momento especial&rdquo; 💕
                </p>
              </div>
              
              <button
                onClick={() => router.push("/nuevo-lugar")}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Heart className="h-5 w-5" />
                Crear Primer Recuerdo
                <Sparkles className="h-4 w-4 animate-pulse" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recuerdos.map((recuerdo) => (
              <div
                key={recuerdo.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 border border-pink-100"
                onClick={() => handleRecuerdoClick(recuerdo)}
              >
                {/* Imagen del recuerdo */}
                <div className="relative h-48 overflow-hidden">
                  {recuerdo.imagen ? (
                    <Image
                      src={recuerdo.imagen}
                      alt={recuerdo.titulo}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                  )}                  {/* Botones de acción - Siempre visibles en mobile, hover en desktop */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRecuerdo(recuerdo.id);
                      }}
                      className="bg-white/95 text-blue-600 p-2 rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Editar recuerdo"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(recuerdo.id);
                      }}
                      className="bg-white/95 text-red-600 p-2 rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Eliminar recuerdo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Decoración de estrella */}
                  <div className="absolute top-2 left-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {recuerdo.titulo}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {recuerdo.descripcion}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{recuerdo.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(recuerdo.fecha)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles del recuerdo */}
      {selectedRecuerdo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              {/* Botón cerrar */}
              <button
                onClick={closeModal}
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

                <div className="text-center">
                  <p className="text-sm text-gray-500 italic">
                    &ldquo;Cada momento contigo es un recuerdo que quiero atesorar para siempre&rdquo; 💕
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar recuerdo?</h3>
              <p className="text-gray-600 mb-6">
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este recuerdo?
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
