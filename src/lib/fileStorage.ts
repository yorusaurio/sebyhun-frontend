import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/recuerdos.json');

export interface Recuerdo {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  imagen?: string;
  latitud?: number;
  longitud?: number;
  userId: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface DataFile {
  recuerdos: Recuerdo[];
  lastUpdated: string;
}

// Leer archivo JSON
export const readRecuerdos = (): DataFile => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data) as DataFile;
    }
    return { recuerdos: [], lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error('Error al leer recuerdos:', error);
    return { recuerdos: [], lastUpdated: new Date().toISOString() };
  }
};

// Escribir archivo JSON
export const writeRecuerdos = (data: DataFile): boolean => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error al escribir recuerdos:', error);
    return false;
  }
};

// Obtener siguiente ID
export const getNextId = (): number => {
  const data = readRecuerdos();
  const maxId = data.recuerdos.reduce((max, r) => (r.id > max ? r.id : max), 0);
  return maxId + 1;
};
