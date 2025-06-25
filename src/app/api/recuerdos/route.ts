import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Obtener todos los recuerdos de un usuario
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Usuario requerido' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('recuerdos')
      .select('*')
      .eq('user_id', userId)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('❌ Supabase GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('❌ Error en GET /api/recuerdos:', err)
    return NextResponse.json({ error: 'Error al obtener recuerdos' }, { status: 500 })
  }
}

// Crear un nuevo recuerdo
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { userId, titulo, descripcion, ubicacion, fecha, imagen, latitud, longitud } = body

  if (!userId || !titulo || !ubicacion || !fecha) {
    return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('recuerdos')
      .insert([{ user_id: userId, titulo, descripcion, ubicacion, fecha, imagen, latitud, longitud }])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error en POST /api/recuerdos:', err)
    return NextResponse.json({ error: 'Error al crear recuerdo' }, { status: 500 })
  }
}
