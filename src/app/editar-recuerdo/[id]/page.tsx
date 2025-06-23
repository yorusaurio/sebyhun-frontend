"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Heart, MapPin, Upload, ArrowLeft, Save, X, Sparkles } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";

interface FormData {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  imagen: string;
  // Campos para datos de geolocalización
  latitud?: number;
  longitud?: number;
}

export default function EditarRecuerdo() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recuerdoId = params.id as string;
  
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    fecha: "",
    imagen: ""
  });
    const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Google Places API
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesApiLoaded, setPlacesApiLoaded] = useState(false);
  // Referencia para la instancia de autocompletado
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);
  // Bandera para evitar bucles infinitos de eventos
  const isHandlingPlaceSelection = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }    // Cargar el recuerdo a editar
    const recuerdosGuardados = JSON.parse(localStorage.getItem('sebyhun-recuerdos') || '[]');
    const recuerdo = recuerdosGuardados.find((r: { id: number }) => r.id === parseInt(recuerdoId));
    
    if (!recuerdo) {
      router.push("/home");
      return;
    }    setFormData({
      titulo: recuerdo.titulo,
      descripcion: recuerdo.descripcion,
      ubicacion: recuerdo.ubicacion,
      fecha: recuerdo.fecha,
      imagen: recuerdo.imagen,
      // Incluir coordenadas si existen
      latitud: recuerdo.latitud,
      longitud: recuerdo.longitud
    });
    
    setImagePreview(recuerdo.imagen);
    setIsLoading(false);
  }, [session, status, router, recuerdoId]);

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
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formDataImg = new FormData();
    formDataImg.append('image', file);
    
    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        formDataImg,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      throw new Error('Error al subir la imagen');
    }
  };  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio";
    }
    
    if (!formData.descripcion.trim()) {
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
    }
    
    if (!formData.fecha) {
      newErrors.fecha = "La fecha es obligatoria";
    }
    
    if (!imagePreview && !formData.imagen) {
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
      let imageUrl = formData.imagen;
      
      // Subir imagen si hay una nueva
      if (imageFile) {
        setIsUploading(true);
        imageUrl = await uploadImageToImgBB(imageFile);
        setIsUploading(false);
      }
        // Actualizar el recuerdo
      const recuerdosExistentes = JSON.parse(localStorage.getItem('sebyhun-recuerdos') || '[]');
      const updatedRecuerdos = recuerdosExistentes.map((r: { id: number; [key: string]: unknown }) => {
        if (r.id === parseInt(recuerdoId)) {          // Guardar las coordenadas para una mejor integración con el mapa
          return {
            ...r,
            ...formData,
            imagen: imageUrl,
            // Guardamos coordenadas de geolocalización si existen
            latitud: formData.latitud,
            longitud: formData.longitud,
            fechaActualizacion: new Date().toISOString()
          };
        }
        return r;
      });
      
      localStorage.setItem('sebyhun-recuerdos', JSON.stringify(updatedRecuerdos));
      
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir a home
      router.push('/home');
      
    } catch (error) {
      console.error('Error al actualizar:', error);
      setErrors({ general: 'Error al actualizar el recuerdo. Por favor, inténtalo de nuevo.' });
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
  // Función mejorada para cerrar el dropdown de Google Places, memorizada para mayor estabilidad
  const closeGooglePlacesDropdown = useCallback(() => {
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
  }, [isHandlingPlaceSelection]);
  // Función mejorada para manejar cuando se selecciona un lugar, memorizada para mayor estabilidad
  const handlePlaceChanged = useCallback(() => {
    // Marcar que estamos procesando una selección para evitar bucles
    isHandlingPlaceSelection.current = true;
    
    try {
      if (!autocompleteInstanceRef.current) return;
      
      const place = autocompleteInstanceRef.current.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.error('❌ No se pudieron obtener los detalles del lugar seleccionado');
        return;
      }
      
      // Extraer las coordenadas de forma segura
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      const selectedLocation = {
        ubicacion: place.formatted_address || place.name || '',
        latitud: lat,
        longitud: lng,
        place_id: place.place_id
      };
      
      console.log('✅ Lugar seleccionado:', selectedLocation);
      
      // Actualizar el formulario con la ubicación seleccionada
      setFormData(prev => ({
        ...prev,
        ubicacion: selectedLocation.ubicacion,
        latitud: selectedLocation.latitud,
        longitud: selectedLocation.longitud
      }));
      
      // Actualizar el valor del input directamente
      if (autocompleteInputRef.current) {
        autocompleteInputRef.current.value = selectedLocation.ubicacion;
        
        // Ya no necesitamos disparar eventos artificiales
        console.log('🌎 Ubicación actualizada con éxito:', selectedLocation.ubicacion);
        
        // Cerrar el dropdown de sugerencias
        closeGooglePlacesDropdown();
      }
    } finally {
      // Importante: establecer un timeout para resetear la bandera
      // esto permite que los eventos pendientes se procesen antes de aceptar nuevas selecciones
      setTimeout(() => {
        isHandlingPlaceSelection.current = false;
      }, 300);
    }
  }, [setFormData, closeGooglePlacesDropdown]);
  // Función mejorada y más robusta para reiniciar el autocompletado, memorizada para evitar recreaciones
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
        google.maps.event.addListenerOnce(
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
        }, 200);
        
        console.log('✅ Autocompletado reiniciado exitosamente');
      } catch (error) {
        console.error('❌ Error al reiniciar autocompletado:', error);
      }
    }, 50);
  }, [placesApiLoaded, handlePlaceChanged]);

  // Cargar la API de Google Maps/Places
  useEffect(() => {
    const loadGoogleMapsApi = async () => {
      try {
        setPlacesLoading(true);
        console.log('🚀 Iniciando carga de Google Places API...');
        
        const loader = new GoogleMapsLoader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
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
    }
  }, []);
    // Inicializar el autocompletado cuando la API esté cargada
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
    // Efecto para controlar el reinicio de autocompletado cuando el campo se borra completamente
  useEffect(() => {
    if (placesApiLoaded && autocompleteInputRef.current) {
      if (formData.ubicacion === '' && !isHandlingPlaceSelection.current) {
        // Reiniciar el autocompletado cuando la ubicación se ha borrado
        console.log('🔄 Reiniciando autocompletado porque el campo se vació');
        setTimeout(() => resetAutocomplete(), 50);
      }
    }
  }, [formData.ubicacion, placesApiLoaded, resetAutocomplete]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando recuerdo...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => router.push("/home")}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Heart className="text-pink-500 h-5 w-5 md:h-6 md:w-6" />
                <MapPin className="text-indigo-500 h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Editar Recuerdo</h1>
                <p className="text-xs md:text-sm text-gray-700 hidden sm:block">Actualiza los detalles de tu momento especial</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Imagen */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Imagen del recuerdo</h2>
            
            {imagePreview ? (
              <div className="relative">
                <div className="relative h-48 sm:h-56 md:h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  aria-label="Eliminar imagen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-pink-400 transition-colors">
                <Upload className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer block">
                  <span className="text-pink-600 font-semibold hover:text-pink-700 text-sm md:text-base">
                    Haz clic para cambiar la imagen
                  </span>
                  <span className="text-gray-700 text-sm md:text-base block sm:inline"> o arrastra y suelta</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs md:text-sm text-gray-600 mt-2">PNG, JPG, WebP hasta 10MB</p>
              </div>
            )}
            
            {errors.imagen && (
              <p className="text-red-600 text-sm font-medium mt-2">{errors.imagen}</p>
            )}
          </div>

          {/* Información del recuerdo */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Detalles del recuerdo</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="titulo" className="block text-sm font-bold text-gray-900 mb-2">
                  Título del recuerdo *
                </label>
                <input
                  id="titulo"
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Atardecer en Santorini"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 placeholder-gray-500"
                />
                {errors.titulo && (
                  <p className="text-red-600 text-sm font-medium mt-1">{errors.titulo}</p>
                )}
              </div>              <div>
                <label htmlFor="ubicacion" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
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
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400 z-10" />
                    <input
                      ref={autocompleteInputRef}
                      type="text"
                      id="ubicacion"
                      name="ubicacion"
                      defaultValue={formData.ubicacion}
                      onChange={(e) => {
                        // No procesar cambios si estamos manejando una selección
                        if (isHandlingPlaceSelection.current) return;
                        
                        console.log('📝 Input de ubicación actualizado:', e.target.value);
                        
                        // Si el campo está vacío, limpiar también la geolocalización
                        if (e.target.value === '') {
                          console.log('🧹 Limpiando datos de ubicación y geolocalización');
                          setFormData(prev => ({
                            ...prev, 
                            ubicacion: '',
                            latitud: undefined,
                            longitud: undefined
                          }));
                        } else {
                          // Actualización normal si no está vacío
                          setFormData(prevData => ({ 
                            ...prevData, 
                            ubicacion: e.target.value 
                          }));
                        }
                      }}
                      onFocus={() => {
                        // No procesar focus si estamos manejando una selección
                        if (isHandlingPlaceSelection.current) return;
                        
                        console.log('👁️ Campo de ubicación enfocado');
                        
                        // Solo reiniciar si no hay instancia de autocompletado
                        if (!autocompleteInstanceRef.current) {
                          console.log('🔄 Reiniciando autocompletado (sin instancia)');
                          resetAutocomplete();
                        }
                      }}
                      onKeyDown={(e) => {
                        // No procesar teclas si estamos manejando una selección
                        if (isHandlingPlaceSelection.current) return;
                        
                        // Cerrar dropdown al presionar Enter o Tab
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          closeGooglePlacesDropdown();
                          console.log('🔒 Dropdown cerrado por tecla:', e.key);
                        }
                        
                        // Si presionamos Backspace y estamos borrando todo el contenido
                        if (e.key === 'Backspace' && 
                            autocompleteInputRef.current?.value.length === 1) {
                          // Limpiar completamente los datos de ubicación
                          console.log('🧹 Borrando toda la ubicación (Backspace)');
                          setFormData(prev => ({
                            ...prev, 
                            ubicacion: '',
                            latitud: undefined,
                            longitud: undefined
                          }));
                          
                          // Solo resetear el autocompletado, sin forzar focus
                          setTimeout(() => resetAutocomplete(), 100);
                        }
                      }}
                      onBlur={() => {
                        // No procesar blur si estamos manejando una selección
                        if (isHandlingPlaceSelection.current) return;
                        
                        console.log('👁️‍🗨️ Campo de ubicación perdió el foco');
                        
                        // Cerrar dropdown suavemente
                        closeGooglePlacesDropdown();
                        
                        // Sincronizar el estado con el valor del input solo si es diferente
                        if (autocompleteInputRef.current) {
                          const currentValue = autocompleteInputRef.current.value;
                          if (currentValue !== formData.ubicacion) {
                            console.log('📌 Sincronizando estado con valor del input:', currentValue);
                            setFormData(prev => ({
                              ...prev,
                              ubicacion: currentValue,
                              // Solo mantener coordenadas si hay una ubicación
                              latitud: currentValue ? prev.latitud : undefined,
                              longitud: currentValue ? prev.longitud : undefined
                            }));
                          }
                        }
                      }}
                      placeholder={placesApiLoaded ? "Ej: Torre Eiffel, París, Francia" : "Cargando autocompletado..."}
                      className={`w-full px-4 py-3 pl-10 border ${formData.ubicacion ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80`}
                    />
                    {placesLoading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                        <div className="animate-spin h-4 w-4 border-b-2 rounded-full border-indigo-500"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-2 mt-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {formData.ubicacion ? (
                      <div className="text-green-500 text-sm">✓</div>
                    ) : placesApiLoaded ? (
                      <div className="text-blue-500 text-sm">ℹ</div>
                    ) : (
                      <div className="text-amber-500 text-sm">⚠</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 ml-0.5">
                    {formData.ubicacion 
                      ? "Ubicación seleccionada. Puedes continuar o seleccionar otra ubicación."
                      : placesApiLoaded 
                        ? "Comienza a escribir para ver sugerencias de ubicaciones precisas." 
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

              <div>
                <label htmlFor="fecha" className="block text-sm font-bold text-gray-900 mb-2">
                  Fecha *
                </label>
                <input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
                />
                {errors.fecha && (
                  <p className="text-red-600 text-sm font-medium mt-1">{errors.fecha}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="descripcion" className="block text-sm font-bold text-gray-900 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Cuéntanos sobre este momento especial..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none text-gray-900 placeholder-gray-500"
                />
                {errors.descripcion && (
                  <p className="text-red-600 text-sm font-medium mt-1">{errors.descripcion}</p>
                )}
              </div>
            </div>
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">{errors.general}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl order-1 sm:order-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Subiendo imagen...
                </>
              ) : isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Actualizar Recuerdo
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
