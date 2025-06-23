import { NextResponse } from 'next/server';
import { readRecuerdos, writeRecuerdos, getNextId, Recuerdo } from '@/lib/fileStorage';

const jsonHeaders = { 'Content-Type': 'application/json' };

// Obtener todos los recuerdos (opcionalmente filtrados por userId)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const data = readRecuerdos();
  const recuerdos = userId
    ? data.recuerdos.filter(r => r.userId === userId)
    : data.recuerdos;
  return NextResponse.json({ success: true, recuerdos, total: recuerdos.length, lastUpdated: data.lastUpdated }, { headers: jsonHeaders });
}

// Crear un nuevo recuerdo
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, titulo, descripcion, ubicacion, fecha, imagen, latitud, longitud } = body;
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario requerido' }, { status: 400 });
  }
  const data = readRecuerdos();
  const now = new Date().toISOString();
  const nuevo: Recuerdo = {
    id: getNextId(),
    titulo,
    descripcion,
    ubicacion,
    fecha,
    imagen,
    latitud,
    longitud,
    userId,
    fechaCreacion: now,
    fechaActualizacion: now
  };
  data.recuerdos.push(nuevo);
  data.lastUpdated = now;
  writeRecuerdos(data);
  return NextResponse.json({ success: true, recuerdo: nuevo }, { headers: jsonHeaders });
}
