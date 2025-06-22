"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Plus, LogOut, User, Home, Calendar, Map } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { name: "Inicio", href: "/home", icon: Home },
    { name: "Calendario", href: "/calendario", icon: Calendar },
    { name: "Mapa", href: "/mapa", icon: Map },
    { name: "Perfil", href: "/perfil", icon: User },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/home")}
          >
            <div className="flex items-center gap-1">
              <Heart className="text-pink-500 h-7 w-7" />
              <MapPin className="text-indigo-500 h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">SebYhun</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Nuestros Recuerdos</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* User greeting */}
            {session?.user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Hola, {session.user.name}!</span>
              </div>
            )}

            {/* Add new memory button */}
            <button
              onClick={() => router.push("/nuevo-lugar")}
              className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-indigo-600 transition-all flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Recuerdo</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors py-2"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
