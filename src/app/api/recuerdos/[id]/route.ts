import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Actualizar un recuerdo por ID
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
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
          longitud: body.longitud,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', body.userId)
        .select()
        .single();

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({ 
            success: true, 
            recuerdo: {
              id,
              user_id: body.userId,
              ...body,
              fecha_actualizacion: new Date().toISOString()
            }
          })
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'Recuerdo no encontrado' }, { status: 404 });
      }

      return NextResponse.json({ success: true, recuerdo: data });
    } catch (networkError) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          success: true, 
          recuerdo: {
            id,
            user_id: body.userId,
            ...body,
            fecha_actualizacion: new Date().toISOString()
          }
        })
      }
      throw networkError;
    }
  } catch (err) {
    console.error('Error al actualizar recuerdo:', err);
    return NextResponse.json({ error: 'Error al actualizar recuerdo' }, { status: 500 });
  }
}

// Eliminar un recuerdo por ID
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Usuario requerido' }, { status: 400 });
    }    try {
      const { error } = await supabase
        .from('recuerdos')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } catch (networkError) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true });
      }
      throw networkError;
    }
  } catch (err) {
    console.error('Error al eliminar recuerdo:', err);
    return NextResponse.json({ error: 'Error al eliminar recuerdo' }, { status: 500 });
  }
}
