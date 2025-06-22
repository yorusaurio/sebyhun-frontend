"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart, MapPin } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Aún cargando

    if (session) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="text-pink-500 h-12 w-12 animate-pulse" />
            <MapPin className="text-indigo-500 h-12 w-12 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SebYhun</h1>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return null;
}
