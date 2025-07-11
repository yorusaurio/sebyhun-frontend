"use client";

import { Heart, MapPin, Mail, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className="text-pink-500 h-6 w-6" />
                <MapPin className="text-indigo-500 h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">SebYhun</h3>
                <p className="text-sm text-gray-500">Nuestros Recuerdos de Viaje</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Un diario personal para guardar y compartir los momentos especiales 
              de nuestros viajes juntos. Cada recuerdo cuenta una historia única.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Enlaces Rápidos
            </h4>
            <div className="space-y-2">
              <a href="/home" className="block text-gray-600 hover:text-gray-900 text-sm transition-colors">
                Inicio
              </a>
              <a href="/nuevo-lugar" className="block text-gray-600 hover:text-gray-900 text-sm transition-colors">
                Nuevo Recuerdo
              </a>
              <a href="/calendario" className="block text-gray-600 hover:text-gray-900 text-sm transition-colors">
                Calendario
              </a>
              <a href="/mapa" className="block text-gray-600 hover:text-gray-900 text-sm transition-colors">
                Mapa de Viajes
              </a>
            </div>
          </div>

          {/* Contacto y redes */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Contacto
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="h-4 w-4" />
                <span>contacto@sebyhun.com</span>
              </div>              <div className="flex items-center gap-4 mt-4">
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-black transition-colors"
                  title="TikTok"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} SebYhun. Hecho con {" "}
              <Heart className="inline h-4 w-4 text-pink-500" /> {" "}
              para nuestros recuerdos juntos.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Términos
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
