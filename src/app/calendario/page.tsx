"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
  Heart, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Camera,
  Clock,
  Edit3,
  Trash2,
  X,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { parseLocalDate, formatDateSafe, compareDates } from "@/utils/dateUtils";

interface Recuerdo {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  fecha: string;
  ubicacion: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  recuerdos: Recuerdo[];
}

export default function CalendarioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recuerdos, setRecuerdos] = useState<Recuerdo[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [selectedRecuerdo, setSelectedRecuerdo] = useState<Recuerdo | null>(null);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }    // Cargar recuerdos del localStorage
    const recuerdosGuardados = JSON.parse(localStorage.getItem('sebyhun-recuerdos') || '[]');
    setRecuerdos(recuerdosGuardados);
  }, [session, status, router]);

  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    
    // Día de la semana del primer día (0 = domingo)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generar 42 días (6 semanas)
    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
        // Buscar recuerdos para esta fecha
      const dayRecuerdos = recuerdos.filter(recuerdo => {
        const recuerdoDate = parseLocalDate(recuerdo.fecha);
        console.log(`[Calendario] Comparando fecha del recuerdo "${recuerdo.titulo}": ${recuerdo.fecha} -> ${recuerdoDate.toISOString()} con día del calendario: ${date.toISOString()}`);
        return (
          recuerdoDate.getDate() === date.getDate() &&
          recuerdoDate.getMonth() === date.getMonth() &&
          recuerdoDate.getFullYear() === date.getFullYear()
        );
      });

      days.push({
        date,
        isCurrentMonth,
        recuerdos: dayRecuerdos
      });
    }    
    setCalendarDays(days);
  }, [currentDate, recuerdos]);

  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
  };  const handleDayClick = (day: CalendarDay) => {
    if (day.recuerdos.length > 0) {
      setSelectedDate(day.date);
      // En mobile, abrir modal con lista de recuerdos
      if (window.innerWidth < 1280) { // xl breakpoint
        setShowMobileModal(true);
      }
    }
  };

  const handleRecuerdoClick = (recuerdo: Recuerdo) => {
    setSelectedRecuerdo(recuerdo);
  };
  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    console.log(`[Calendario] Formateando fecha: ${dateString} -> ${date.toISOString()}`);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEditRecuerdo = (id: number) => {
    router.push(`/editar-recuerdo/${id}`);
  };
  const handleDeleteRecuerdo = (id: number) => {
    const nuevosRecuerdos = recuerdos.filter(r => r.id !== id);
    setRecuerdos(nuevosRecuerdos);
    localStorage.setItem('sebyhun-recuerdos', JSON.stringify(nuevosRecuerdos));
    setShowDeleteModal(null);
    
    // Si no quedan más recuerdos en la fecha seleccionada, limpiar la selección
    const selectedDay = calendarDays.find(day => selectedDate && isSelected(day.date));
    if (selectedDay && selectedDay.recuerdos.length <= 1) {
      setSelectedDate(null);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-700 font-medium">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalendarIcon className="h-8 w-8 text-pink-500" />
            <Heart className="h-6 w-6 text-pink-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Calendario de Recuerdos
          </h1>
          <p className="text-gray-700 text-lg">
            Revive vuestros momentos especiales organizados por fecha
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Calendario Principal */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header del Calendario */}
              <div className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <p className="text-sm opacity-90">
                      {recuerdos.length} recuerdos guardados
                    </p>
                  </div>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {dayNames.map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del calendario */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative p-2 min-h-[80px] sm:min-h-[100px] border-b border-r border-gray-100 transition-all duration-200
                      ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 text-gray-400'}
                      ${isToday(day.date) ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
                      ${isSelected(day.date) ? 'bg-pink-50 ring-2 ring-pink-200' : ''}
                      ${day.recuerdos.length > 0 ? 'cursor-pointer hover:bg-pink-25' : ''}
                    `}
                  >
                    {/* Número del día */}
                    <div className={`
                      text-sm font-medium mb-1
                      ${isToday(day.date) ? 'text-blue-600 font-bold' : ''}
                      ${isSelected(day.date) ? 'text-pink-600 font-bold' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>

                    {/* Indicadores de recuerdos */}
                    {day.recuerdos.length > 0 && (
                      <div className="space-y-1">
                        {day.recuerdos.slice(0, 2).map((recuerdo, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 text-xs bg-gradient-to-r from-pink-100 to-indigo-100 text-gray-700 rounded-full px-2 py-1 truncate"
                          >
                            <Camera className="h-3 w-3 text-pink-500 flex-shrink-0" />
                            <span className="truncate font-medium">{recuerdo.titulo}</span>
                          </div>
                        ))}
                        {day.recuerdos.length > 2 && (
                          <div className="text-xs text-gray-500 text-center font-medium">
                            +{day.recuerdos.length - 2} más
                          </div>
                        )}
                      </div>
                    )}

                    {/* Punto indicador si hay recuerdos */}
                    {day.recuerdos.length > 0 && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Estadísticas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total de recuerdos</span>
                  <span className="font-bold text-2xl text-pink-600">{recuerdos.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Este mes</span>                  <span className="font-bold text-xl text-indigo-600">
                    {recuerdos.filter(r => {
                      const date = parseLocalDate(r.fecha);
                      console.log(`[Calendario-Stats] Verificando recuerdo "${r.titulo}" del ${r.fecha}: mes ${date.getMonth() + 1} vs ${currentDate.getMonth() + 1}`);
                      return date.getMonth() === currentDate.getMonth() && 
                             date.getFullYear() === currentDate.getFullYear();
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recuerdos del día seleccionado */}
            {selectedDate && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                  <div className="space-y-4">
                  {calendarDays
                    .find(day => isSelected(day.date))
                    ?.recuerdos.map((recuerdo) => (
                      <div
                        key={recuerdo.id}
                        className="group bg-gradient-to-r from-pink-50 to-indigo-50 rounded-xl p-4 border border-pink-200 hover:shadow-md transition-all relative"
                      >                        {/* Botones de acción - Siempre visibles en mobile, hover en desktop */}
                        <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => handleEditRecuerdo(recuerdo.id)}
                            className="bg-white/90 hover:bg-blue-50 text-blue-600 p-1.5 rounded-full shadow-sm hover:shadow-md transition-all"
                            title="Editar recuerdo"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(recuerdo.id)}
                            className="bg-white/90 hover:bg-red-50 text-red-600 p-1.5 rounded-full shadow-sm hover:shadow-md transition-all"
                            title="Eliminar recuerdo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {recuerdo.imagen ? (
                              <Image
                                src={recuerdo.imagen}
                                alt={recuerdo.titulo}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>                          <div className="flex-1 min-w-0 pr-16 md:pr-12">
                            <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                              {recuerdo.titulo}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-indigo-600 mb-2">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{recuerdo.ubicacion}</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {recuerdo.descripcion}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Próximos recuerdos o CTA */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Crear Recuerdo
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                ¿Viviste un momento especial recientemente? ¡Guárdalo para siempre!
              </p>
              <button
                onClick={() => router.push("/nuevo-lugar")}
                className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-pink-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Recuerdo
              </button>
            </div>
          </div>        </div>      </main>      {/* Modal de recuerdos para mobile - Lista de tarjetas */}
      {showMobileModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center p-0 z-50 xl:hidden">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white p-6 pb-8 relative">
              <button
                onClick={() => setShowMobileModal(false)}
                className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-6 w-6" />
                <h2 className="text-xl font-bold">Recuerdos del Día</h2>
              </div>
              
              <p className="text-white/90 text-sm">
                {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Lista de recuerdos como tarjetas */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                {calendarDays
                  .find(day => isSelected(day.date))
                  ?.recuerdos.map((recuerdo) => (
                    <div
                      key={recuerdo.id}
                      onClick={() => handleRecuerdoClick(recuerdo)}
                      className="bg-gradient-to-r from-pink-50 to-indigo-50 rounded-2xl p-4 border border-pink-200 shadow-sm cursor-pointer hover:shadow-md transition-all relative"
                    >
                      {/* Botones de acción */}
                      <div className="absolute top-3 right-3 flex gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMobileModal(false);
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
                            setShowMobileModal(false);
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
                          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                            {recuerdo.titulo}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{recuerdo.ubicacion}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {recuerdo.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Indicador de que es clickeable */}
                      <div className="absolute bottom-3 right-3">
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span>Toca para ver más</span>
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
                  setShowMobileModal(false);
                  router.push("/nuevo-lugar");
                }}
                className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-indigo-600 transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Crear Nuevo Recuerdo
              </button>
            </div>
          </div>
        </div>      )}

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
                    <CalendarIcon className="h-5 w-5 text-indigo-500" />
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
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este recuerdo del calendario?
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
