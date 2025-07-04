"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Heart, MapPin, Upload, ArrowLeft, Save, X, Sparkles, Camera, Calendar } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";
import { getCurrentLocalDateString } from "@/utils/dateUtils";
import { recuerdosApi } from "@/lib/recuerdosApi";

interface FormData {
  titulo: string;
  descripcion?: string;
  ubicacion: string;
  fecha: string;
  imagen?: string;
  // Nuevos campos para datos de geolocalización
  latitud?: number;
  longitud?: number;
}

// Función auxiliar para obtener la fecha local sin problemas de zona horaria
const getCurrentLocalDate = (): string => {
  // Usar la función utilitaria centralizada
  return getCurrentLocalDateString();
};

export default function NuevoLugar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    fecha: getCurrentLocalDate(),
    imagen: ""
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Google Places API
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesApiLoaded, setPlacesApiLoaded] = useState(false);
    // Referencia para la instancia de autocompletado
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);
  // Bandera para evitar bucles infinitos de eventos
  const isHandlingPlaceSelection = useRef(false);
  
  // Función mejorada para cerrar el dropdown de Google Places
  const closeGooglePlacesDropdown = () => {
    // Si ya estamos procesando una selección, no hacer nada para evitar bucles
    if (isHandlingPlaceSelection.current) {
      return;
    }
    
    console.log('🔒 Cerrando dropdown de Google Places');
    
    // Ocultar contenedores elegantemente
    const pacContainers = document.querySelectorAll('.pac-container');
    if (pacContainers.length === 0) return;
    
    pacContainers.forEach(container => {
      const element = container as HTMLElement;
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
    });
    
    // Un enfoque más suave sin cambios de foco agresivos
    document.body.click();
  };  // Función mejorada para manejar cuando se selecciona un lugar
  const handlePlaceChanged = useCallback(() => {
    // Marcar que estamos procesando una selección para evitar bucles
    isHandlingPlaceSelection.current = true;
    
    try {
      if (!autocompleteInstanceRef.current) {
        console.error('❌ No hay instancia de autocompletado disponible');
        return;
      }
      
      const place = autocompleteInstanceRef.current.getPlace();
      console.log('📍 Lugar obtenido del autocompletado:', place);
      
      if (!place.geometry || !place.geometry.location) {
        console.error('❌ No se pudieron obtener los detalles del lugar seleccionado');
        // Limpiar coordenadas si no hay geometría válida
        setFormData(prev => ({
          ...prev,
          latitud: undefined,
          longitud: undefined
        }));
        return;
      }
      
      // Extraer las coordenadas de forma segura
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || '';
      
      const selectedLocation = {
        ubicacion: address,
        latitud: lat,
        longitud: lng,
        place_id: place.place_id
      };
      
      console.log('✅ Lugar seleccionado exitosamente:', selectedLocation);
      
      // Actualizar el formulario con la ubicación seleccionada
      setFormData(prev => ({
        ...prev,
        ubicacion: selectedLocation.ubicacion,
        latitud: selectedLocation.latitud,
        longitud: selectedLocation.longitud
      }));
      
      // Limpiar errores de ubicación si existían
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.ubicacion;
        return newErrors;
      });
      
      // Actualizar el valor del input para sincronizar
      if (autocompleteInputRef.current) {
        autocompleteInputRef.current.value = selectedLocation.ubicacion;
      }
      
      // Cerrar el dropdown después de un pequeño delay
      setTimeout(() => {
        closeGooglePlacesDropdown();
      }, 100);
      
    } catch (error) {
      console.error('❌ Error al procesar la selección del lugar:', error);
    } finally {
      // Establecer un timeout para resetear la bandera
      setTimeout(() => {
        isHandlingPlaceSelection.current = false;
      }, 500);
    }
  }, []);

  // Función mejorada y más robusta para reiniciar el autocompletado
  const resetAutocomplete = useCallback(() => {
    // Si estamos en medio de una selección, no reiniciar
    if (isHandlingPlaceSelection.current) return;
    
    console.log('🔄 Reiniciando autocompletado');
    
    // Solo reiniciar si tenemos referencia al input y la API está cargada
    if (!placesApiLoaded || !autocompleteInputRef.current) {
      console.log('⚠️ No se puede reiniciar: API no cargada o input no disponible');
      return;
    }
    
    // Limpiar instancia anterior si existe
    if (autocompleteInstanceRef.current) {
      try {
        google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current);
        autocompleteInstanceRef.current = null;
      } catch (error) {
        console.error('Error al limpiar instancia anterior:', error);
      }
    }
    
    // Pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
      try {
        // Configurar nuevo autocompletado con opciones óptimas
        const options: google.maps.places.AutocompleteOptions = {
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
          types: ['establishment', 'geocode'],
        };
        
        // Crear nueva instancia y guardarla en la ref
        autocompleteInstanceRef.current = new google.maps.places.Autocomplete(
          autocompleteInputRef.current as HTMLInputElement,
          options
        );
          // Configurar listener para cuando se selecciona un lugar de forma segura
        // Usar addListener en lugar de addListenerOnce para que persista
        google.maps.event.addListener(
          autocompleteInstanceRef.current,
          'place_changed',
          handlePlaceChanged
        );
        
        // Aplicar estilos al contenedor de autocompletado
        setTimeout(() => {
          const pacContainers = document.querySelectorAll('.pac-container');
          pacContainers.forEach(container => {
            const element = container as HTMLElement;
            element.style.zIndex = '9999';
            element.style.borderRadius = '0.75rem';
            element.style.marginTop = '4px';
            element.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            element.style.border = '1px solid rgb(196, 181, 253)';
            element.style.transition = 'opacity 0.2s ease';
          });
        }, 300);
        
        console.log('✅ Autocompletado reiniciado exitosamente');
      } catch (error) {
        console.error('❌ Error al reiniciar autocompletado:', error);
      }
    }, 50);
  }, [placesApiLoaded, handlePlaceChanged, isHandlingPlaceSelection]);
  
  // Cargar la API de Google Maps/Places
  useEffect(() => {
    const loadGoogleMapsApi = async () => {
      try {
        setPlacesLoading(true);
        console.log('🚀 Iniciando carga de Google Places API...');
          const loader = new GoogleMapsLoader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geocoding']
        });
        
        await loader.load();
        console.log('📦 Google Maps API cargada, importando librería Places...');
        
        // Importar el nuevo elemento de autocompletado
        await google.maps.importLibrary('places');
        console.log('✅ Places Library importada correctamente');
        
        setPlacesApiLoaded(true);
        console.log('🌎 Google Places API (nueva versión) cargada correctamente');
      } catch (error) {
        console.error('❌ Error al cargar Google Places API:', error);
      } finally {
        setPlacesLoading(false);
      }
    };

    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      loadGoogleMapsApi();
    } else {
      console.error('❌ API key de Google Maps no encontrada');
    }  }, []);    // Inicializar el autocompletado cuando la API esté cargada
  useEffect(() => {
    if (!placesApiLoaded || !autocompleteInputRef.current) return;
    
    // Inicializar el autocompletado solo una vez cuando la API esté lista
    console.log('🔄 Inicializando autocompletado porque Places API fue cargada');
    resetAutocomplete();
    
    // Limpiar listeners cuando el componente se desmonte
    return () => {
      try {
        if (autocompleteInstanceRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current);
          autocompleteInstanceRef.current = null;
          console.log('🧹 Limpieza de instancia de autocompletado al desmontar');
        }
      } catch (error) {
        console.error('Error al limpiar instancia de autocompletado:', error);
      }
    };
  }, [placesApiLoaded, resetAutocomplete]);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };  const uploadImageToBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('🔄 Subiendo imagen al backend...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Usar el endpoint del backend Spring Boot
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'}/images/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('✅ Respuesta completa del backend:', response);
      console.log('📦 Datos de respuesta:', response.data);
      console.log('🔍 Tipo de datos:', typeof response.data);
      
      // El backend devuelve { "url": "https://..." }
      let imageUrl: string = '';
      
      if (response.data && typeof response.data === 'object' && response.data.url) {
        imageUrl = response.data.url;
        console.log('✅ URL extraída del objeto:', imageUrl);
      } else if (typeof response.data === 'string') {
        imageUrl = response.data;
        console.log('✅ URL obtenida como string:', imageUrl);
      } else {
        console.error('❌ Formato de respuesta inesperado:', response.data);
        throw new Error('El backend no devolvió una URL válida. Respuesta: ' + JSON.stringify(response.data));
      }
      
      if (!imageUrl || imageUrl.trim() === '') {
        console.error('❌ URL vacía o inválida:', imageUrl);
        throw new Error('La URL de imagen está vacía o es inválida');
      }
      
      // Validar que la URL sea válida
      try {
        new URL(imageUrl);
        console.log('✅ URL válida confirmada:', imageUrl);
      } catch {
        console.error('❌ URL inválida:', imageUrl);
        throw new Error('La URL devuelta no es válida: ' + imageUrl);
      }
      
      return imageUrl;
      
    } catch (error) {
      console.error('❌ Error completo al subir imagen:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Status de error:', error.response?.status);
        console.error('❌ Datos de error:', error.response?.data);
        console.error('❌ Headers de error:', error.response?.headers);
      }
      throw new Error('Error al subir la imagen: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };// Función para validar si la ubicación tiene coordenadas (fue seleccionada del autocompletado)
  const validateLocationWithCoordinates = (ubicacion: string): boolean => {
    // Si tenemos coordenadas, la ubicación fue seleccionada correctamente
    if (formData.latitud && formData.longitud) {
      return true;
    }
    
    // Si no tenemos coordenadas pero hay texto, el usuario escribió manualmente
    if (ubicacion && ubicacion.trim()) {
      console.log('⚠️ Ubicación escrita manualmente sin coordenadas:', ubicacion);
      return false;
    }
    
    return false;
  };  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio";
    }
    
    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }
    
    // Verificar la ubicación: ahora obtenemos el valor desde el input directamente
    // en caso de que la API de Places haya cambiado el valor pero no haya actualizado el estado
    let ubicacionValue = formData.ubicacion;
    
    // Intentar obtener el valor desde el campo de entrada si existe
    if (autocompleteInputRef.current && 'value' in autocompleteInputRef.current) {
      const inputValue = (autocompleteInputRef.current as HTMLInputElement).value;
      if (inputValue && inputValue.trim()) {
        ubicacionValue = inputValue;
        
        // Actualizar el formData si el input tiene un valor pero el formData no
        if (!formData.ubicacion || formData.ubicacion !== inputValue) {
          console.log('⚠️ Actualizando ubicación desde el input:', inputValue);
          setFormData(prev => ({ ...prev, ubicacion: inputValue }));
        }
      }
    }
    
    if (!ubicacionValue || !ubicacionValue.trim()) {
      newErrors.ubicacion = "La ubicación es obligatoria";
    } else if (!validateLocationWithCoordinates(ubicacionValue)) {
      newErrors.ubicacion = "Por favor, selecciona una ubicación de las sugerencias para obtener coordenadas precisas";
    }
    
    if (!formData.fecha) {
      newErrors.fecha = "La fecha es obligatoria";
    }
    
    if (!imageFile && !formData.imagen) {
      newErrors.imagen = "La imagen es obligatoria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Actualizar el valor de ubicación desde el input si existe
    if (autocompleteInputRef.current && 'value' in autocompleteInputRef.current) {
      const inputValue = (autocompleteInputRef.current as HTMLInputElement).value;
      if (inputValue && inputValue.trim() && inputValue !== formData.ubicacion) {
        console.log('📍 Actualizando ubicación antes de validar:', inputValue);
        setFormData(prev => ({...prev, ubicacion: inputValue}));
      }
    }
    
    if (!validateForm()) {
      console.log('❌ Validación fallida. Errores:', errors);
      console.log('Estado actual del formulario:', formData);
      return;
    }
    
    setIsSubmitting(true);
      try {
      // LOG: Información detallada antes de procesar
      console.log('💾 handleSubmit - Iniciando proceso de guardado:');
      console.log('  • FormData antes de crear objeto:', formData);
      console.log('  • Fecha original:', formData.fecha);
      console.log('  • Tipo de fecha:', typeof formData.fecha);
      console.log('  • Fecha convertida a Date:', new Date(formData.fecha));
      console.log('  • ImageFile presente:', !!imageFile);
        let imageUrl = formData.imagen;
      
      // Subir imagen si hay una nueva
      if (imageFile) {
        console.log('🖼️ Subiendo imagen...');
        setIsUploading(true);
        try {
          imageUrl = await uploadImageToBackend(imageFile);
          console.log('✅ Imagen subida exitosamente:', imageUrl);
          
          // Validar que la URL no esté vacía
          if (!imageUrl || imageUrl.trim() === '') {
            throw new Error('La URL de imagen está vacía');
          }
        } catch (uploadError) {
          console.error('❌ Error al subir imagen:', uploadError);
          setIsUploading(false);
          alert('Error al subir la imagen: ' + (uploadError instanceof Error ? uploadError.message : 'Error desconocido'));
          return;
        }
        setIsUploading(false);
      }

      // Usar las coordenadas que ya tenemos del autocompletado
      // No intentamos hacer geocoding manual para mantener la precisión
      const finalLatitud = formData.latitud;
      const finalLongitud = formData.longitud;
      
      if (!finalLatitud || !finalLongitud) {
        throw new Error('Ubicación sin coordenadas. Por favor, selecciona una ubicación de las sugerencias.');
      }
        console.log('📍 Usando coordenadas del autocompletado:', {
        latitud: finalLatitud,
        longitud: finalLongitud,
        ubicacion: formData.ubicacion
      });

      // Preparar datos del recuerdo
      const recuerdoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        ubicacion: formData.ubicacion,
        fecha: formData.fecha,
        imagen: imageUrl, // Campo principal de imagen para el backend
        latitud: finalLatitud,
        longitud: finalLongitud,
        userId: session?.user?.email || 'anonymous'
      };
      
      console.log('🚀 Datos del recuerdo a enviar al backend:', recuerdoData);
      console.log('🖼️ URL de imagen que se enviará:', imageUrl);

      // Crear el recuerdo usando la API  
      const nuevoRecuerdo = await recuerdosApi.create(recuerdoData);
      
      // LOG: Información del objeto que se guardó
      console.log('📦 Recuerdo creado mediante API:');
      console.log('  • ID:', nuevoRecuerdo.id);
      console.log('  • Fecha del recuerdo:', nuevoRecuerdo.fecha);
      console.log('  • Fecha de creación:', nuevoRecuerdo.fechaCreacion);
      console.log('  • Objeto completo:', nuevoRecuerdo);
      
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Guardado completado, redirigiendo...');
      
      // Redirigir a home
      router.push('/home');
      
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ general: 'Error al guardar el recuerdo. Por favor, inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, imagen: "" });
  };
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Partículas decorativas románticas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-60 right-20 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-300 opacity-40"></div>
        <div className="absolute bottom-80 right-10 w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-700 opacity-70"></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping delay-500 opacity-40"></div>
      </div>

      {/* Header mejorado */}
      <header className="bg-white/80 backdrop-blur-sm shadow-xl border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/home")}
              className="text-gray-600 hover:text-pink-600 p-3 rounded-full hover:bg-pink-50 transition-all duration-300 flex-shrink-0 group"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Heart className="text-pink-500 h-8 w-8 animate-pulse" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-purple-400 animate-bounce" />
                </div>
                <MapPin className="text-indigo-500 h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Nuevo Recuerdo
                </h1>
                <p className="text-sm md:text-base text-gray-600 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-pink-400" />
                  Captura un momento especial para siempre
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {/* Mensaje romántico de bienvenida */}
        <div className="text-center mb-10">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-pink-200/50 shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-pink-500 animate-pulse" />
              <span className="text-lg font-semibold text-gray-800">Creando Recuerdos Eternos</span>
              <Heart className="h-6 w-6 text-pink-500 animate-pulse" />
            </div>
            <p className="text-gray-600 leading-relaxed">
              Cada momento juntos merece ser recordado. Comparte los detalles de esta experiencia especial 
              y conviértela en un tesoro de nuestro diario de amor.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección de Imagen mejorada */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 border border-pink-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Imagen del Recuerdo</h2>
                <p className="text-sm text-gray-600">Una imagen vale más que mil palabras 📸</p>
              </div>
            </div>
            
            {imagePreview ? (
              <div className="relative group">
                <div className="relative h-56 sm:h-64 md:h-72 w-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                  aria-label="Eliminar imagen"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-gray-700">¡Imagen perfecta! ✨</span>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-pink-300 rounded-2xl p-10 md:p-12 text-center hover:border-pink-400 hover:bg-pink-25 transition-all duration-300 group">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <Upload className="h-16 w-16 text-pink-400 group-hover:scale-110 transition-transform duration-300" />
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-purple-400 animate-bounce" />
                  </div>
                  <label className="cursor-pointer block">
                    <span className="text-pink-600 font-bold hover:text-pink-700 text-lg group-hover:scale-105 transition-transform duration-300 inline-block">
                      Haz clic para subir una imagen
                    </span>
                    <span className="text-gray-600 text-base block mt-2">o arrastra y suelta aquí</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-4 py-2 mt-4">
                    <p className="text-sm text-gray-700 font-medium">PNG, JPG, WebP hasta 10MB</p>
                  </div>
                </div>
              </div>
            )}
            
            {errors.imagen && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {errors.imagen}
                </p>
              </div>
            )}
          </div>          {/* Información del recuerdo mejorada */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 border border-purple-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Detalles del Recuerdo</h2>
                <p className="text-sm text-gray-600">Comparte todos los detalles de este momento especial ✨</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Título */}
              <div className="lg:col-span-2">
                <label htmlFor="titulo" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  Título del recuerdo *
                </label>
                <div className="relative">
                  <input
                    id="titulo"
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ej: Atardecer mágico en Santorini"
                    className="w-full px-4 py-4 pl-12 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80"
                  />
                  <Heart className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-400" />
                </div>
                {errors.titulo && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-red-600 text-sm font-medium">{errors.titulo}</p>
                  </div>
                )}
              </div>              {/* Ubicación */}              <div>
                <label htmlFor="ubicacion" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  Ubicación *
                  {placesApiLoaded ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="text-green-500 mr-1">●</span> API Lista
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <span className="animate-pulse mr-1">○</span> Cargando API
                    </span>
                  )}
                </label>
                
                <div className="relative">
                  {/* Contenedor para el autocompletado */}
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400 z-10" />                    <input
                      ref={autocompleteInputRef}
                      type="text"
                      id="ubicacion"
                      name="ubicacion"
                      defaultValue={formData.ubicacion}                      onChange={(e) => {
                        // No procesar cambios si estamos manejando una selección
                        if (isHandlingPlaceSelection.current) {
                          console.log('🚫 Ignorando onChange durante selección de lugar');
                          return;
                        }
                        
                        const newValue = e.target.value;
                        console.log('📝 Input de ubicación actualizado:', newValue);
                        
                        // Si el campo está vacío, limpiar también la geolocalización
                        if (newValue === '') {
                          console.log('🧹 Limpiando datos de ubicación y geolocalización');
                          setFormData(prev => ({
                            ...prev, 
                            ubicacion: '',
                            latitud: undefined,
                            longitud: undefined
                          }));
                        } else {
                          // Al escribir manualmente, mantener el texto pero limpiar las coordenadas
                          // Solo mantendremos coordenadas si viene del autocompletado
                          setFormData(prevData => ({ 
                            ...prevData, 
                            ubicacion: newValue,
                            // Solo limpiar coordenadas si el usuario está escribiendo activamente
                            latitud: undefined,
                            longitud: undefined
                          }));
                        }
                      }}onFocus={() => {
                        // No procesar focus si estamos manejando una selección
                        if (isHandlingPlaceSelection.current) return;
                        
                        console.log('👁️ Campo de ubicación enfocado');
                        
                        // Solo crear el autocompletado si no existe y la API está cargada
                        if (!autocompleteInstanceRef.current && placesApiLoaded) {
                          console.log('🔄 Creando autocompletado (primera vez)');
                          resetAutocomplete();
                        }
                      }}                      onKeyDown={(e) => {
                        // No procesar teclas si estamos manejando una selección
                        if (isHandlingPlaceSelection.current) return;
                        
                        // Cerrar dropdown al presionar Enter o Tab
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          setTimeout(() => {
                            closeGooglePlacesDropdown();
                          }, 100);
                        }
                        
                        // Si presionamos Backspace y el campo se va a quedar vacío
                        if (e.key === 'Backspace') {
                          const currentValue = (e.target as HTMLInputElement).value;
                          if (currentValue.length <= 1) {
                            // Limpiar completamente los datos de ubicación
                            console.log('🧹 Borrando toda la ubicación (Backspace)');
                            setFormData(prev => ({
                              ...prev, 
                              ubicacion: '',
                              latitud: undefined,
                              longitud: undefined
                            }));
                          }
                        }
                      }}onBlur={(e) => {
                        // No procesar blur si estamos manejando una selección
                        if (isHandlingPlaceSelection.current) {
                          console.log('🚫 Ignorando onBlur durante selección de lugar');
                          return;
                        }
                        
                        console.log('👁️‍🗨️ Campo de ubicación perdió el foco');
                        
                        // Cerrar dropdown suavemente con un pequeño delay
                        setTimeout(() => {
                          closeGooglePlacesDropdown();
                        }, 150);
                        
                        // Sincronizar el estado con el valor del input solo si es diferente
                        const currentValue = e.target.value;
                        if (currentValue !== formData.ubicacion) {
                          console.log('📌 Sincronizando estado con valor del input:', currentValue);
                          setFormData(prev => ({
                            ...prev,
                            ubicacion: currentValue,
                            // Solo mantener coordenadas si hay una ubicación Y ya tenemos coordenadas
                            latitud: (currentValue && prev.latitud) ? prev.latitud : undefined,
                            longitud: (currentValue && prev.longitud) ? prev.longitud : undefined
                          }));
                        }
                      }}placeholder={placesApiLoaded ? "Ej: Torre Eiffel, París, Francia" : "Cargando autocompletado..."}                      className={`w-full px-4 py-4 pl-12 pr-10 border-2 ${
                        formData.latitud && formData.longitud 
                          ? 'border-green-400 bg-green-50/50 text-gray-900' 
                          : formData.ubicacion 
                            ? 'border-amber-400 bg-amber-50/30 text-gray-900' 
                            : 'border-indigo-200 text-gray-900'
                      } rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder-gray-500 bg-white/80`}
                    />                    {placesLoading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                        <div className="animate-spin h-4 w-4 border-b-2 rounded-full border-indigo-500"></div>
                      </div>
                    )}
                    
                    {/* Indicador de estado */}
                    {!placesLoading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                        {formData.latitud && formData.longitud ? (
                          <div className="text-green-500 text-lg" title="Ubicación válida con coordenadas">✓</div>
                        ) : formData.ubicacion ? (
                          <div className="text-amber-500 text-lg animate-pulse" title="Selecciona una sugerencia">⚠</div>
                        ) : (
                          <div className="text-gray-400 text-lg" title="Escribe para buscar">📍</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                  <div className="flex items-start gap-2 mt-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {formData.latitud && formData.longitud ? (
                      <div className="text-green-500 text-sm">✓</div>
                    ) : formData.ubicacion ? (
                      <div className="text-red-500 text-sm">⚠</div>
                    ) : placesApiLoaded ? (
                      <div className="text-blue-500 text-sm">ℹ</div>
                    ) : (
                      <div className="text-amber-500 text-sm">⚠</div>
                    )}
                  </div>                  <p className="text-xs text-gray-500 ml-0.5">
                    {formData.latitud && formData.longitud
                      ? "¡Perfecto! Ubicación seleccionada con coordenadas precisas."
                      : formData.ubicacion 
                        ? "⚠️ Debes hacer clic en una de las sugerencias que aparecen al escribir. Esto asegura coordenadas precisas para mostrar correctamente en el mapa."
                        : placesApiLoaded 
                          ? "Escribe el nombre del lugar y SELECCIONA una de las sugerencias que aparecerán." 
                          : "Cargando servicio de ubicaciones..."}
                  </p>
                </div>
                
                {/* Coordenadas (opcional) */}
                {formData.latitud && formData.longitud && (
                  <div className="mt-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                    <div className="flex items-center gap-2 text-xs text-indigo-700">
                      <MapPin className="h-3 w-3" />
                      <span className="font-semibold">Coordenadas:</span>
                      <span className="font-mono bg-white px-2 py-1 rounded">
                        {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
                      </span>
                      <Sparkles className="h-3 w-3 text-purple-500" />
                    </div>
                  </div>
                )}
                
                {errors.ubicacion && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-red-600 text-sm font-medium">{errors.ubicacion}</p>
                  </div>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label htmlFor="fecha" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  Fecha del recuerdo *
                </label>
                <div className="relative">                  <input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log('📅 Cambio en campo fecha:');
                      console.log('  • Valor anterior:', formData.fecha);
                      console.log('  • Valor nuevo:', newValue);
                      console.log('  • Tipo del valor nuevo:', typeof newValue);
                      console.log('  • Fecha como Date object:', new Date(newValue));
                      console.log('  • Timestamp actual:', Date.now());
                      
                      setFormData({ ...formData, fecha: newValue });
                    }}
                    className="w-full px-4 py-4 pl-12 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 bg-white/80"
                  />
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                </div>
                {errors.fecha && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-red-600 text-sm font-medium">{errors.fecha}</p>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="lg:col-span-2">
                <label htmlFor="descripcion" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  Descripción del momento *
                </label>
                <div className="relative">
                  <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Cuéntanos sobre este momento especial... ¿Qué lo hizo único? ¿Cómo te sentiste? Describe todos los detalles que quieras recordar para siempre..."
                    rows={5}
                    className="w-full px-4 py-4 pl-12 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 resize-none text-gray-900 placeholder-gray-500 bg-white/80"
                  />
                  <Heart className="absolute left-4 top-4 h-4 w-4 text-pink-400" />
                </div>
                {errors.descripcion && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-red-600 text-sm font-medium">{errors.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>          {/* Error general mejorado */}
          {errors.general && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Oops, algo salió mal</h3>
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción mejorados */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 order-2 sm:order-1 hover:scale-105"
            >
              ← Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-xl font-bold hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl order-1 sm:order-2 hover:scale-105 group"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Subiendo imagen...</span>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </>
              ) : isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando recuerdo...</span>
                  <Heart className="h-4 w-4 animate-pulse" />
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Guardar Recuerdo</span>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </>
              )}
            </button>
          </div>          {/* Mensaje inspiracional */}
          <div className="text-center pt-6">
            <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 rounded-2xl p-6 shadow-lg">
              <p className="text-gray-700 italic leading-relaxed">
                &ldquo;Los recuerdos son los tesoros más preciados que podemos guardar. 
                Cada momento compartido se convierte en una historia que atesoraremos para siempre&rdquo;
                <span className="text-pink-500">💕</span>
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
