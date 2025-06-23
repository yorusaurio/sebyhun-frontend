import { NextRequest, NextResponse } from 'next/server';
import { readRecuerdos, writeRecuerdos, Recuerdo } from '@/lib/fileStorage';

const jsonHeaders = { 'Content-Type': 'application/json' };

// Actualizar un recuerdo por ID
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  const body = await request.json();
  const { userId, titulo, descripcion, ubicacion, fecha, imagen, latitud, longitud } = body;
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario requerido' }, { status: 400 });
  }
  const data = readRecuerdos();
  const index = data.recuerdos.findIndex(r => r.id === id && r.userId === userId);
  if (index < 0) {
    return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
  }
  const updated: Recuerdo = {
    ...data.recuerdos[index],
    titulo,
    descripcion,
    ubicacion,
    fecha,
    imagen,
    latitud,
    longitud,
    fechaActualizacion: new Date().toISOString()
  };
  data.recuerdos[index] = updated;
  data.lastUpdated = updated.fechaActualizacion;
  writeRecuerdos(data);
  return NextResponse.json({ success: true, recuerdo: updated }, { headers: jsonHeaders });
}

// Eliminar un recuerdo por ID
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario requerido' }, { status: 400 });
  }
  const data = readRecuerdos();
  const index = data.recuerdos.findIndex(r => r.id === id && r.userId === userId);
  if (index < 0) {
    return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
  }
  data.recuerdos.splice(index, 1);
  data.lastUpdated = new Date().toISOString();
  writeRecuerdos(data);
  return NextResponse.json({ success: true }, { headers: jsonHeaders });
}
