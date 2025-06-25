import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no configuradas. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Cliente Supabase para lectura y escritura
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Interfaz para la tabla 'recuerdos'
export interface Recuerdo {
  id: number
  user_id: string
  titulo: string
  descripcion?: string
  ubicacion: string
  fecha: string
  imagen?: string
  latitud?: number
  longitud?: number
  fecha_creacion?: string
  fecha_actualizacion?: string
}
