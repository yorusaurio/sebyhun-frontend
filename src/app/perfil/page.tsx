"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
  Heart, 
  Edit3, 
  Save, 
  X, 
  Calendar,
  MapPin,
  Sparkles,
  Star,
  Gift,
  Users,
  Flame,
  Crown,
  Award,
  Zap,
  Moon,
  Sun,
  Music,
  Flower,
  Rainbow,
  Gem,
  TrendingUp,
  Activity
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { recuerdosApi, type RecuerdoFrontend } from "@/lib/recuerdosApi";

interface UserProfile {
  nombre: string;
  email: string;
  avatar: string;
  fechaRegistro: string;
  bio: string;
  pareja: string;
  fechaRelacion: string;
  lugarFavorito: string;
  cancionFavorita: string;
  comidaFavorita: string;
  colorFavorito: string;  fraseFavorita: string;
  suenoCompartido: string;
}

interface Estadisticas {
  totalRecuerdos: number;
  lugaresVisitados: number;
  añosJuntos: number;
  recuerdosEsteAno: number;
  mesConMasRecuerdos: string;
  lugarMasVisitado: string;
  rachaActual: number;
  puntosAmor: number;
}

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    nombre: "",
    email: "",
    avatar: "",
    fechaRegistro: new Date().toISOString(),
    bio: "",
    pareja: "",
    fechaRelacion: "",
    lugarFavorito: "",
    cancionFavorita: "",
    comidaFavorita: "",
    colorFavorito: "#ec4899",
    fraseFavorita: "",
    suenoCompartido: ""
  });
    const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalRecuerdos: 0,
    lugaresVisitados: 0,
    añosJuntos: 0,
    recuerdosEsteAno: 0,
    mesConMasRecuerdos: "",
    lugarMasVisitado: "",
    rachaActual: 0,
    puntosAmor: 0
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'sunset' | 'galaxy' | 'spring' | 'ocean'>('sunset');

  const calcularEstadisticas = useCallback((recuerdos: RecuerdoFrontend[]) => {
    const ahora = new Date();
    const lugares = new Set(recuerdos.map(r => r.ubicacion));
    
    // Contar recuerdos por mes
    const recuerdosPorMes: { [key: string]: number } = {};
    recuerdos.forEach(r => {
      const mes = new Date(r.fecha).toLocaleDateString('es-ES', { month: 'long' });
      recuerdosPorMes[mes] = (recuerdosPorMes[mes] || 0) + 1;
    });

    // Manejar array vacío para el mes con más recuerdos
    const mesConMas = Object.entries(recuerdosPorMes).length > 0 
      ? Object.entries(recuerdosPorMes).reduce((a, b) => 
          recuerdosPorMes[a[0]] > recuerdosPorMes[b[0]] ? a : b
        )[0] 
      : "Enero";

    // Contar lugares únicos
    const lugaresPorFrecuencia: { [key: string]: number } = {};
    recuerdos.forEach(r => {
      lugaresPorFrecuencia[r.ubicacion] = (lugaresPorFrecuencia[r.ubicacion] || 0) + 1;
    });

    // Manejar array vacío para el lugar más visitado
    const lugarMasVisitado = Object.entries(lugaresPorFrecuencia).length > 0
      ? Object.entries(lugaresPorFrecuencia).reduce((a, b) => 
          lugaresPorFrecuencia[a[0]] > lugaresPorFrecuencia[b[0]] ? a : b
        )[0]
      : "Madrid";

    // Calcular años juntos
    const fechaRelacion = new Date(profile.fechaRelacion);
    const añosJuntos = Math.floor((ahora.getTime() - fechaRelacion.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Recuerdos este año
    const recuerdosEsteAno = recuerdos.filter(r => 
      new Date(r.fecha).getFullYear() === ahora.getFullYear()
    ).length;

    // Calcular racha y puntos
    const rachaActual = Math.min(recuerdos.length, 30);
    const puntosAmor = recuerdos.length * 10 + lugares.size * 25 + añosJuntos * 100;

    setEstadisticas({
      totalRecuerdos: recuerdos.length,
      lugaresVisitados: lugares.size,
      añosJuntos,
      recuerdosEsteAno,
      mesConMasRecuerdos: mesConMas,
      lugarMasVisitado,
      rachaActual,
      puntosAmor
    });
  }, [profile.fechaRelacion]);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    // Cargar perfil del localStorage
    const savedProfile = localStorage.getItem('sebyhun-profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setTempProfile(parsed);
    } else {
      // Perfil inicial con datos de la sesión
      const initialProfile: UserProfile = {
        nombre: session.user?.name || "Mi Amor",
        email: session.user?.email || "",
        avatar: session.user?.image || "",
        fechaRegistro: new Date().toISOString(),
        bio: "Viviendo nuestra historia de amor un recuerdo a la vez 💕",
        pareja: "",
        fechaRelacion: "",
        lugarFavorito: "",
        cancionFavorita: "",
        comidaFavorita: "",
        colorFavorito: "#ec4899",
        fraseFavorita: "Contigo, cada día es una aventura especial",
        suenoCompartido: ""
      };
      setProfile(initialProfile);
      setTempProfile(initialProfile);    }

    // Cargar recuerdos desde la API para estadísticas
    const cargarRecuerdos = async () => {
      try {
        const recuerdosData = await recuerdosApi.getAll();
        // Calcular estadísticas
        calcularEstadisticas(recuerdosData);
      } catch (error) {
        console.error('Error al cargar recuerdos:', error);
      }
    };

    cargarRecuerdos();}, [session, status, router, calcularEstadisticas]);

  const handleSaveProfile = () => {
    localStorage.setItem('sebyhun-profile', JSON.stringify(tempProfile));
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (estadisticas.totalRecuerdos >= 1) {
      achievements.push({ icon: Heart, title: "Primer Recuerdo", desc: "Creaste tu primer recuerdo", color: "text-pink-500" });
    }
    if (estadisticas.totalRecuerdos >= 10) {
      achievements.push({ icon: Star, title: "Coleccionista", desc: "10 recuerdos guardados", color: "text-yellow-500" });
    }
    if (estadisticas.totalRecuerdos >= 50) {
      achievements.push({ icon: Crown, title: "Maestro de Recuerdos", desc: "50 recuerdos guardados", color: "text-purple-500" });
    }
    if (estadisticas.lugaresVisitados >= 5) {
      achievements.push({ icon: MapPin, title: "Explorador", desc: "5 lugares visitados", color: "text-blue-500" });
    }
    if (estadisticas.añosJuntos >= 1) {
      achievements.push({ icon: Gift, title: "Aniversario", desc: "1 año juntos", color: "text-red-500" });
    }
    if (estadisticas.puntosAmor >= 1000) {
      achievements.push({ icon: Flame, title: "Amor Infinito", desc: "1000+ puntos de amor", color: "text-orange-500" });
    }
    if (estadisticas.rachaActual >= 7) {
      achievements.push({ icon: Zap, title: "Racha Semanal", desc: "7 días consecutivos", color: "text-green-500" });
    }
    if (estadisticas.recuerdosEsteAno >= 20) {
      achievements.push({ icon: Sparkles, title: "Año Especial", desc: "20 recuerdos este año", color: "text-indigo-500" });
    }

    return achievements;
  };

  const getThemeClasses = () => {
    const themes = {
      sunset: "from-orange-100 via-pink-100 to-purple-100",
      galaxy: "from-purple-100 via-blue-100 to-indigo-100",
      spring: "from-green-100 via-yellow-100 to-pink-100",
      ocean: "from-blue-100 via-cyan-100 to-teal-100"
    };
    return themes[currentTheme];
  };

  const getNivelAmor = () => {
    if (estadisticas.puntosAmor >= 5000) return { nivel: "Alma Gemela", color: "text-purple-600", icon: Gem };
    if (estadisticas.puntosAmor >= 2500) return { nivel: "Amor Eterno", color: "text-pink-600", icon: Crown };
    if (estadisticas.puntosAmor >= 1000) return { nivel: "Corazón Ardiente", color: "text-red-600", icon: Flame };
    if (estadisticas.puntosAmor >= 500) return { nivel: "Enamorado", color: "text-orange-600", icon: Heart };
    if (estadisticas.puntosAmor >= 100) return { nivel: "Cupido", color: "text-yellow-600", icon: Star };
    return { nivel: "Nuevo Amor", color: "text-green-600", icon: Sparkles };
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-700 font-medium">Cargando tu perfil romántico...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const nivelAmor = getNivelAmor();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()}`}>
      <Navbar />
      
      {/* Partículas románticas flotantes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-30`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header del perfil con avatar y info básica */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-pink-200 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-200/30 to-pink-200/30 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt={profile.nombre}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                        <Heart className="h-12 w-12 text-pink-500" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Nivel de amor */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border-2 border-pink-200">
                  <nivelAmor.icon className={`h-6 w-6 ${nivelAmor.color}`} />
                </div>
              </div>

              {/* Info principal */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {profile.nombre}
                  </h1>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className={`text-lg font-semibold ${nivelAmor.color} mb-3`}>
                  {nivelAmor.nivel} • {estadisticas.puntosAmor.toLocaleString()} puntos de amor
                </div>
                
                <p className="text-gray-600 mb-4 max-w-2xl leading-relaxed">
                  {profile.bio}
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-full">
                    <Calendar className="h-4 w-4 text-pink-600" />
                    <span className="text-sm font-medium text-pink-700">
                      Desde {new Date(profile.fechaRegistro).toLocaleDateString('es-ES', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  {profile.pareja && (
                    <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        Con {profile.pareja}
                      </span>
                    </div>
                  )}
                  
                  {estadisticas.añosJuntos > 0 && (
                    <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                        {estadisticas.añosJuntos} año{estadisticas.añosJuntos !== 1 ? 's' : ''} juntos
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar Perfil
                </button>
                
                <button
                  onClick={() => setShowAchievements(true)}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  Logros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas románticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 group">
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-3xl font-bold text-pink-600 mb-1">{estadisticas.totalRecuerdos}</div>
            <div className="text-sm text-gray-600">Recuerdos</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 group">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{estadisticas.lugaresVisitados}</div>
            <div className="text-sm text-gray-600">Lugares</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 group">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">{estadisticas.rachaActual}</div>
            <div className="text-sm text-gray-600">Racha (días)</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 group">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{estadisticas.recuerdosEsteAno}</div>
            <div className="text-sm text-gray-600">Este Año</div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Información personal */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-pink-500" />
              Información Personal
            </h2>
            
            <div className="space-y-4">
              {profile.pareja && (
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-semibold text-gray-700">Mi pareja</div>
                    <div className="text-gray-600">{profile.pareja}</div>
                  </div>
                </div>
              )}
              
              {profile.fechaRelacion && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-semibold text-gray-700">Juntos desde</div>
                    <div className="text-gray-600">
                      {new Date(profile.fechaRelacion).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {profile.lugarFavorito && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-semibold text-gray-700">Lugar favorito</div>
                    <div className="text-gray-600">{profile.lugarFavorito}</div>
                  </div>
                </div>
              )}
              
              {profile.cancionFavorita && (
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-semibold text-gray-700">Canción favorita</div>
                    <div className="text-gray-600">{profile.cancionFavorita}</div>
                  </div>
                </div>
              )}
              
              {profile.fraseFavorita && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Rainbow className="h-4 w-4 text-pink-500" />
                    Nuestra frase
                  </div>
                  <div className="text-gray-600 italic">&ldquo;{profile.fraseFavorita}&rdquo;</div>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas avanzadas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Activity className="h-6 w-6 text-purple-500" />
              Estadísticas de Amor
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg p-4 border border-pink-200">
                <div className="font-semibold text-gray-700 mb-2">Mes con más recuerdos</div>
                <div className="text-2xl font-bold text-pink-600">{estadisticas.mesConMasRecuerdos}</div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <div className="font-semibold text-gray-700 mb-2">Lugar más visitado</div>
                <div className="text-lg font-bold text-blue-600">{estadisticas.lugarMasVisitado}</div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="font-semibold text-gray-700 mb-2">Nivel de amor</div>
                <div className="flex items-center gap-2">
                  <nivelAmor.icon className={`h-6 w-6 ${nivelAmor.color}`} />
                  <span className={`text-lg font-bold ${nivelAmor.color}`}>
                    {nivelAmor.nivel}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                <div className="font-semibold text-gray-700 mb-2">Progreso hacia siguiente nivel</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((estadisticas.puntosAmor % 1000) / 10, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {estadisticas.puntosAmor % 1000} / 1000 puntos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de tema */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Tema del Perfil
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'sunset', name: 'Atardecer', colors: 'from-orange-400 to-pink-500', icon: Sun },
              { key: 'galaxy', name: 'Galaxia', colors: 'from-purple-400 to-blue-500', icon: Star },
              { key: 'spring', name: 'Primavera', colors: 'from-green-400 to-yellow-400', icon: Flower },
              { key: 'ocean', name: 'Océano', colors: 'from-blue-400 to-teal-400', icon: Moon }
            ].map(theme => (
              <button
                key={theme.key}
                onClick={() => setCurrentTheme(theme.key as 'sunset' | 'galaxy' | 'spring' | 'ocean')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  currentTheme === theme.key 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.colors} mx-auto mb-2`}>
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <theme.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">{theme.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Editar Perfil</h2>
                <button
                  onClick={handleCancelEdit}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={tempProfile.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Pareja</label>
                  <input
                    type="text"
                    value={tempProfile.pareja}
                    onChange={(e) => handleInputChange('pareja', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Biografía</label>
                <textarea
                  value={tempProfile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                />
              </div>              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Fecha de relación</label>
                  <input
                    type="date"
                    value={tempProfile.fechaRelacion}
                    onChange={(e) => handleInputChange('fechaRelacion', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Lugar favorito</label>
                  <input
                    type="text"
                    value={tempProfile.lugarFavorito}
                    onChange={(e) => handleInputChange('lugarFavorito', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Canción favorita</label>
                  <input
                    type="text"
                    value={tempProfile.cancionFavorita}
                    onChange={(e) => handleInputChange('cancionFavorita', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Comida favorita</label>
                  <input
                    type="text"
                    value={tempProfile.comidaFavorita}
                    onChange={(e) => handleInputChange('comidaFavorita', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Frase favorita</label>
                <input
                  type="text"
                  value={tempProfile.fraseFavorita}
                  onChange={(e) => handleInputChange('fraseFavorita', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Sueño compartido</label>
                <textarea
                  value={tempProfile.suenoCompartido}
                  onChange={(e) => handleInputChange('suenoCompartido', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de logros */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Award className="h-6 w-6" />
                  Logros de Amor
                </h2>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid gap-4">
                {getAchievements().map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="bg-white rounded-full p-3 shadow-md">
                      <achievement.icon className={`h-8 w-8 ${achievement.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{achievement.title}</h3>
                      <p className="text-gray-600">{achievement.desc}</p>
                    </div>
                    <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✨ Desbloqueado
                    </div>
                  </div>
                ))}
                
                {getAchievements().length === 0 && (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">¡Primeros logros por desbloquear!</h3>
                    <p className="text-gray-500">Comienza creando recuerdos para obtener tus primeros logros de amor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
