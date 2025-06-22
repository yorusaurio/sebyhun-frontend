"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, MapPin, Upload, ArrowLeft, Save, X, Sparkles, Camera, Calendar } from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface FormData {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  imagen: string;
}

export default function NuevoLugar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    fecha: new Date().toISOString().split('T')[0],
    imagen: ""
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        formData,
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
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio";
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }
    
    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = "La ubicación es obligatoria";
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
    
    if (!validateForm()) {
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
      
      // Aquí normalmente guardarías en una base de datos
      // Por ahora simularemos el guardado en localStorage
      const nuevoRecuerdo = {
        id: Date.now(),
        ...formData,
        imagen: imageUrl,
        fechaCreacion: new Date().toISOString()
      };
      
      // Obtener recuerdos existentes del localStorage
      const recuerdosExistentes = JSON.parse(localStorage.getItem('sebyhun-recuerdos') || '[]');
      recuerdosExistentes.push(nuevoRecuerdo);
      localStorage.setItem('sebyhun-recuerdos', JSON.stringify(recuerdosExistentes));
      
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
              </div>

              {/* Ubicación */}
              <div>
                <label htmlFor="ubicacion" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  Ubicación *
                </label>
                <div className="relative">
                  <input
                    id="ubicacion"
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    placeholder="Ej: Santorini, Grecia"
                    className="w-full px-4 py-4 pl-12 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80"
                  />
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                </div>
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
                <div className="relative">
                  <input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
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
          </div>

          {/* Mensaje inspiracional */}
          <div className="text-center pt-6">
            <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 rounded-2xl p-6 shadow-lg">
              <p className="text-gray-700 italic leading-relaxed">
                "                &ldquo;Los recuerdos son los tesoros más preciados que podemos guardar. 
                Cada momento compartido se convierte en una historia que atesoraremos para siempre&rdquo;" 
                <span className="text-pink-500">💕</span>
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
