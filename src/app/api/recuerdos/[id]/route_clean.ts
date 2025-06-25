import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Actualizar un recuerdo por ID
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = parseInt(idParam)
  const body = await request.json()

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  if (!body.userId) {
    return NextResponse.json({ error: 'Usuario requerido' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('recuerdos')
      .update({
        titulo: body.titulo,
        descripcion: body.descripcion,
        ubicacion: body.ubicacion,
        fecha: body.fecha,
        imagen: body.imagen,
        latitud: body.latitud,
        longitud: body.longitud
      })
      .eq('id', id)
      .eq('user_id', body.userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase PUT error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Recuerdo no encontrado' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Error en PUT /api/recuerdos/[id]:', err)
    return NextResponse.json({ error: 'Error al actualizar recuerdo' }, { status: 500 })
  }
}

// Eliminar un recuerdo por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = parseInt(idParam)
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'Usuario requerido' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('recuerdos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Supabase DELETE error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error en DELETE /api/recuerdos/[id]:', err)
    return NextResponse.json({ error: 'Error al eliminar recuerdo' }, { status: 500 })
  }
}
