"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, MapPin, Upload, ArrowLeft, Save, X } from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface FormData {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  imagen: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    // Cargar el recuerdo a editar
    const recuerdosGuardados = JSON.parse(localStorage.getItem('sebyhun-recuerdos') || '[]');
    const recuerdo = recuerdosGuardados.find((r: any) => r.id === parseInt(recuerdoId));
    
    if (!recuerdo) {
      router.push("/home");
      return;
    }

    setFormData({
      titulo: recuerdo.titulo,
      descripcion: recuerdo.descripcion,
      ubicacion: recuerdo.ubicacion,
      fecha: recuerdo.fecha,
      imagen: recuerdo.imagen
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
    
    if (!imagePreview && !formData.imagen) {
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
      
      // Actualizar el recuerdo
      const recuerdosExistentes = JSON.parse(localStorage.getItem('sebyhun-recuerdos') || '[]');
      const updatedRecuerdos = recuerdosExistentes.map((r: any) => {
        if (r.id === parseInt(recuerdoId)) {
          return {
            ...r,
            ...formData,
            imagen: imageUrl,
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
              </div>

              <div>
                <label htmlFor="ubicacion" className="block text-sm font-bold text-gray-900 mb-2">
                  Ubicación *
                </label>
                <input
                  id="ubicacion"
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  placeholder="Ej: Santorini, Grecia"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 placeholder-gray-500"
                />
                {errors.ubicacion && (
                  <p className="text-red-600 text-sm font-medium mt-1">{errors.ubicacion}</p>
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
