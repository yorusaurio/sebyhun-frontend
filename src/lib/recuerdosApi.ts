/**
 * 🔄 API de Recuerdos - MIGRADA A BACKEND SPRING BOOT
 * 
 * Este archivo mantiene la misma interfaz que antes para no romper
 * el código existente, pero ahora consume el backend Spring Boot
 * en lugar de Supabase o las API routes de Next.js
 */

import { apiClient, type Recuerdo, manejarErrorApi } from './apiClient';

// ✅ Interfaz para el frontend (mantiene compatibilidad)
export interface RecuerdoFrontend {
  id: string; // Cambiado de number a string para el backend Spring Boot
  userId: string;
  titulo: string;
  descripcion?: string;
  ubicacion: string;
  fecha: string;
  imagen?: string;
  imagenes?: string[]; // Soporte para múltiples imágenes
  latitud?: number;
  longitud?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

// 🔄 Función para convertir del backend (Spring Boot) al frontend
const convertToFrontend = (backendRecord: Recuerdo): RecuerdoFrontend => {
  return {
    id: backendRecord.id || '',
    userId: backendRecord.userId,
    titulo: backendRecord.titulo,
    descripcion: backendRecord.descripcion,
    ubicacion: backendRecord.ubicacion,
    fecha: backendRecord.fecha,
    imagen: backendRecord.imagenes?.[0], // Primera imagen como imagen principal
    imagenes: backendRecord.imagenes,
    latitud: backendRecord.latitud,
    longitud: backendRecord.longitud,
    fechaCreacion: backendRecord.createdAt,
    fechaActualizacion: backendRecord.updatedAt
  };
};

// 🔄 Función para convertir del frontend al backend
const convertToBackend = (frontendRecord: Partial<RecuerdoFrontend>): Partial<Recuerdo> => {
  return {
    titulo: frontendRecord.titulo,
    descripcion: frontendRecord.descripcion,
    ubicacion: frontendRecord.ubicacion,
    fecha: frontendRecord.fecha,
    userId: frontendRecord.userId,
    imagenes: frontendRecord.imagenes || (frontendRecord.imagen ? [frontendRecord.imagen] : []),
    latitud: frontendRecord.latitud,
    longitud: frontendRecord.longitud
  };
};

// 🔧 Obtener usuario actual (mantiene la misma lógica)
const getCurrentUser = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sebyhun-current-user') || 'anonymous';
  }
  return 'anonymous';
};

// 🎯 API PRINCIPAL - MIGRADA AL BACKEND SPRING BOOT
export const recuerdosApi = {
  
  /**
   * ✅ Obtener todos los recuerdos del usuario
   */
  async getAll(): Promise<RecuerdoFrontend[]> {
    try {
      const userId = getCurrentUser();
      const recuerdos = await apiClient.obtenerRecuerdos(userId);
      return recuerdos.map(convertToFrontend);
    } catch (error) {
      console.error('Error al obtener recuerdos:', manejarErrorApi(error));
      return [];
    }
  },

  /**
   * ✅ Crear un nuevo recuerdo
   */
  async create(rec: Omit<RecuerdoFrontend, 'id'|'fechaCreacion'|'fechaActualizacion'>): Promise<RecuerdoFrontend> {
    try {
      const userId = getCurrentUser();
      const recuerdoParaBackend = convertToBackend({ ...rec, userId });
      
      // Asegurar que todos los campos requeridos estén presentes
      if (!recuerdoParaBackend.titulo || !recuerdoParaBackend.ubicacion || !recuerdoParaBackend.fecha) {
        throw new Error('Faltan campos requeridos: título, ubicación y fecha');
      }
      
      const nuevoRecuerdo = await apiClient.crearRecuerdo(recuerdoParaBackend as Omit<Recuerdo, 'id' | 'createdAt' | 'updatedAt'>);
      return convertToFrontend(nuevoRecuerdo);
    } catch (error) {
      const errorMsg = manejarErrorApi(error);
      console.error('Error al crear recuerdo:', errorMsg);
      throw new Error(errorMsg);
    }
  },
  /**
   * ✅ Actualizar un recuerdo existente
   */
  async update(id: string, rec: Partial<RecuerdoFrontend>): Promise<RecuerdoFrontend> {
    try {
      const recuerdoParaBackend = convertToBackend(rec);
      const recuerdoActualizado = await apiClient.actualizarRecuerdo(id, recuerdoParaBackend);
      return convertToFrontend(recuerdoActualizado);
    } catch (error) {
      const errorMsg = manejarErrorApi(error);
      console.error('Error al actualizar recuerdo:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * ✅ Eliminar un recuerdo
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.eliminarRecuerdo(id);
    } catch (error) {
      const errorMsg = manejarErrorApi(error);
      console.error('Error al eliminar recuerdo:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * 🆕 Obtener un recuerdo específico por ID
   */
  async getById(id: string): Promise<RecuerdoFrontend | null> {
    try {
      const recuerdo = await apiClient.obtenerRecuerdo(id);
      return convertToFrontend(recuerdo);
    } catch (error) {
      console.error('Error al obtener recuerdo:', manejarErrorApi(error));
      return null;
    }
  },

  /**
   * 🆕 Buscar recuerdos
   */
  async search(termino: string): Promise<RecuerdoFrontend[]> {
    try {
      const userId = getCurrentUser();
      const recuerdos = await apiClient.buscarRecuerdos(userId, termino);
      return recuerdos.map(convertToFrontend);
    } catch (error) {
      console.error('Error al buscar recuerdos:', manejarErrorApi(error));
      return [];
    }
  },

  /**
   * 🆕 Obtener estadísticas del usuario
   */
  async getStats() {
    try {
      const userId = getCurrentUser();
      return await apiClient.obtenerEstadisticas(userId);
    } catch (error) {
      console.error('Error al obtener estadísticas:', manejarErrorApi(error));
      return {
        totalRecuerdos: 0,
        recuerdosEsteAnio: 0,
        recuerdosEsteMes: 0,
        ubicacionesFavoritas: [],
        recuerdosPorMes: []
      };
    }
  },

  /**
   * 🆕 Obtener calendario mensual
   */
  async getCalendarioMensual(year: number, month: number) {
    try {
      const userId = getCurrentUser();
      return await apiClient.obtenerCalendarioMensual(userId, year, month);
    } catch (error) {
      console.error('Error al obtener calendario mensual:', manejarErrorApi(error));
      return {
        year,
        month,
        dias: []
      };
    }
  },

  /**
   * 🆕 Obtener calendario anual
   */
  async getCalendarioAnual(year: number) {
    try {
      const userId = getCurrentUser();
      return await apiClient.obtenerCalendarioAnual(userId, year);
    } catch (error) {
      console.error('Error al obtener calendario anual:', manejarErrorApi(error));
      return {
        year,
        meses: []
      };
    }
  },

  /**
   * 🆕 Verificar conexión con el backend
   */
  async checkHealth(): Promise<boolean> {
    try {
      const health = await apiClient.verificarSalud();
      return health.status === 'OK';
    } catch (error) {
      console.error('Backend no disponible:', manejarErrorApi(error));
      return false;
    }
  }
};
