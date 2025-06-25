/**
 * Configuración centralizada de la API
 * Cambia las variables de entorno para apuntar a producción
 */

// 🔧 CONFIGURACIÓN DE LA API
const API_CONFIG = {
  // URL base del backend Spring Boot (desde variables de entorno)
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  
  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export default API_CONFIG;

// Endpoints disponibles (para referencia)
export const ENDPOINTS = {
  // CRUD básico
  RECUERDOS: '/recuerdos',
  RECUERDO_BY_ID: (id: string) => `/recuerdos/${id}`,
  
  // Búsquedas
  SEARCH_RECUERDOS: '/recuerdos/search',
  
  // Estadísticas
  STATS: (userId: string) => `/stats/${userId}`,
  
  // Calendario
  CALENDAR_MONTHLY: (userId: string) => `/calendar/${userId}`,
  CALENDAR_YEARLY: (userId: string) => `/calendar/${userId}/year`,
  
  // Utilidades
  HEALTH: '/health'
};
