/**
 * Cliente API centralizado para consumir el backend Spring Boot
 * Todas las llamadas REST están aquí organizadas por funcionalidad
 */

import API_CONFIG, { ENDPOINTS } from '@/config/api';

// 📋 TIPOS DE DATOS
export interface Recuerdo {
  id?: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  fecha: string; // YYYY-MM-DD
  userId: string;
  imagenes?: string[]; // URLs de imágenes
  latitud?: number;
  longitud?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EstadisticasRecuerdos {
  totalRecuerdos: number;
  recuerdosEsteAnio: number;
  recuerdosEsteMes: number;
  ubicacionesFavoritas: Array<{
    ubicacion: string;
    cantidad: number;
  }>;
  recuerdosPorMes: Array<{
    mes: string;
    cantidad: number;
  }>;
}

export interface CalendarioMensual {
  year: number;
  month: number;
  dias: Array<{
    dia: number;
    recuerdos: Array<{
      id: string;
      titulo: string;
      ubicacion: string;
    }>;
  }>;
}

export interface CalendarioAnual {
  year: number;
  meses: Array<{
    mes: number;
    nombreMes: string;
    totalRecuerdos: number;
    primerRecuerdo?: {
      id: string;
      titulo: string;
      fecha: string;
    };
  }>;
}

// 🔧 UTILIDADES INTERNAS
class ApiError extends Error {
  constructor(    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Si la respuesta está vacía (204 No Content), retorna undefined
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Timeout: La petición tardó demasiado', 408);
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Error de conexión con el servidor',
      0
    );
  }
}

// 🎯 CLIENTE API PRINCIPAL
export const apiClient = {
  // ========================
  // 📝 CRUD DE RECUERDOS
  // ========================
  
  /**
   * Obtener todos los recuerdos de un usuario
   */
  async obtenerRecuerdos(userId: string): Promise<Recuerdo[]> {
    return await makeRequest<Recuerdo[]>(`${ENDPOINTS.RECUERDOS}?userId=${userId}`);
  },

  /**
   * Obtener un recuerdo específico por ID
   */
  async obtenerRecuerdo(id: string): Promise<Recuerdo> {
    return await makeRequest<Recuerdo>(ENDPOINTS.RECUERDO_BY_ID(id));
  },

  /**
   * Crear un nuevo recuerdo
   */
  async crearRecuerdo(recuerdo: Omit<Recuerdo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recuerdo> {
    return await makeRequest<Recuerdo>(ENDPOINTS.RECUERDOS, {
      method: 'POST',
      body: JSON.stringify(recuerdo),
    });
  },

  /**
   * Actualizar un recuerdo existente
   */
  async actualizarRecuerdo(id: string, recuerdo: Partial<Omit<Recuerdo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Recuerdo> {
    return await makeRequest<Recuerdo>(ENDPOINTS.RECUERDO_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(recuerdo),
    });
  },

  /**
   * Eliminar un recuerdo
   */
  async eliminarRecuerdo(id: string): Promise<void> {
    await makeRequest<void>(ENDPOINTS.RECUERDO_BY_ID(id), {
      method: 'DELETE',
    });
  },

  // ========================
  // 🔍 BÚSQUEDAS
  // ========================

  /**
   * Buscar recuerdos por título
   */
  async buscarPorTitulo(userId: string, titulo: string): Promise<Recuerdo[]> {
    const params = new URLSearchParams({
      userId,
      titulo
    });
    return await makeRequest<Recuerdo[]>(`${ENDPOINTS.SEARCH_RECUERDOS}?${params}`);
  },

  /**
   * Buscar recuerdos por ubicación
   */
  async buscarPorUbicacion(userId: string, ubicacion: string): Promise<Recuerdo[]> {
    const params = new URLSearchParams({
      userId,
      ubicacion
    });
    return await makeRequest<Recuerdo[]>(`${ENDPOINTS.SEARCH_RECUERDOS}?${params}`);
  },

  /**
   * Búsqueda general (título + ubicación)
   */
  async buscarRecuerdos(userId: string, termino: string): Promise<Recuerdo[]> {
    // Buscar primero por título, luego por ubicación
    const [porTitulo, porUbicacion] = await Promise.all([
      this.buscarPorTitulo(userId, termino).catch(() => []),
      this.buscarPorUbicacion(userId, termino).catch(() => [])
    ]);

    // Combinar resultados y eliminar duplicados
    const resultados = [...porTitulo, ...porUbicacion];
    const unicos = resultados.filter((recuerdo, index, arr) => 
      arr.findIndex(r => r.id === recuerdo.id) === index
    );

    return unicos;
  },

  // ========================
  // 📊 ESTADÍSTICAS
  // ========================

  /**
   * Obtener estadísticas del usuario
   */
  async obtenerEstadisticas(userId: string): Promise<EstadisticasRecuerdos> {
    return await makeRequest<EstadisticasRecuerdos>(ENDPOINTS.STATS(userId));
  },

  // ========================
  // 📅 CALENDARIO
  // ========================

  /**
   * Obtener recuerdos de un mes específico
   */
  async obtenerCalendarioMensual(userId: string, year: number, month: number): Promise<CalendarioMensual> {
    const params = new URLSearchParams({
      year: year.toString(),
      month: month.toString()
    });
    return await makeRequest<CalendarioMensual>(`${ENDPOINTS.CALENDAR_MONTHLY(userId)}?${params}`);
  },

  /**
   * Obtener vista anual del calendario
   */
  async obtenerCalendarioAnual(userId: string, year: number): Promise<CalendarioAnual> {
    const params = new URLSearchParams({
      year: year.toString()
    });
    return await makeRequest<CalendarioAnual>(`${ENDPOINTS.CALENDAR_YEARLY(userId)}?${params}`);
  },

  // ========================
  // 🔧 UTILIDADES
  // ========================

  /**
   * Verificar la salud del backend
   */
  async verificarSalud(): Promise<{ status: string; message: string }> {
    return await makeRequest<{ status: string; message: string }>(ENDPOINTS.HEALTH);
  },

  /**
   * Obtener recuerdos del mes actual
   */
  async obtenerRecuerdosDelMes(userId: string): Promise<Recuerdo[]> {
    const ahora = new Date();
    const calendario = await this.obtenerCalendarioMensual(
      userId, 
      ahora.getFullYear(), 
      ahora.getMonth() + 1
    );
    
    // Extraer todos los recuerdos del calendario mensual
    const recuerdosIds = calendario.dias
      .flatMap(dia => dia.recuerdos)
      .map(r => r.id);
    
    // Obtener los recuerdos completos
    const recuerdosCompletos = await Promise.all(
      recuerdosIds.map(id => this.obtenerRecuerdo(id))
    );
    
    return recuerdosCompletos;
  }
};

// 🚨 MANEJO DE ERRORES ESPECÍFICOS
export function esErrorDeApi(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function manejarErrorApi(error: unknown): string {
  if (esErrorDeApi(error)) {
    switch (error.status) {
      case 404:
        return 'Recuerdo no encontrado';
      case 400:
        return 'Datos inválidos. Revisa la información ingresada';
      case 401:
        return 'No autorizado. Inicia sesión nuevamente';
      case 403:
        return 'No tienes permiso para realizar esta acción';
      case 408:
        return 'La conexión tardó demasiado. Intenta nuevamente';
      case 500:
        return 'Error en el servidor. Intenta más tarde';
      default:
        return error.message || 'Error desconocido';
    }
  }
  
  return 'Error de conexión. Verifica tu internet';
}

export default apiClient;
