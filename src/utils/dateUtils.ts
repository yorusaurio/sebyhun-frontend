/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Formatea una fecha string (YYYY-MM-DD) a formato legible sin problemas de zona horaria
 * @param dateString Fecha en formato "YYYY-MM-DD"
 * @returns Fecha formateada en español
 */
export const formatDateSafe = (dateString: string): string => {
  console.log('🎨 formatDateSafe - Formateando fecha:', dateString);
  
  // Crear fecha sin problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11 para meses
  
  console.log('  • Fecha creada localmente:', localDate);
  console.log('  • Día obtenido:', localDate.getDate());
  console.log('  • Mes obtenido:', localDate.getMonth() + 1);
  console.log('  • Año obtenido:', localDate.getFullYear());
  
  const formattedDate = localDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  console.log('  • Fecha formateada final:', formattedDate);
  
  return formattedDate;
};

/**
 * Convierte una fecha string (YYYY-MM-DD) a objeto Date local sin problemas de zona horaria
 * @param dateString Fecha en formato "YYYY-MM-DD"
 * @returns Objeto Date local
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD sin problemas de zona horaria
 * @returns Fecha actual en formato string
 */
export const getCurrentLocalDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const fechaFormateada = `${year}-${month}-${day}`;
  
  // LOG: Información detallada sobre la fecha inicial
  console.log('📅 getCurrentLocalDateString() - Información de fecha inicial:');
  console.log('  • Objeto Date original:', today);
  console.log('  • Zona horaria del navegador:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log('  • Año:', year);
  console.log('  • Mes (corregido):', month);
  console.log('  • Día:', day);
  console.log('  • Fecha formateada final:', fechaFormateada);
  
  return fechaFormateada;
};

/**
 * Compara dos fechas string sin problemas de zona horaria
 * @param date1 Primera fecha en formato "YYYY-MM-DD"
 * @param date2 Segunda fecha en formato "YYYY-MM-DD"
 * @returns Número negativo si date1 < date2, positivo si date1 > date2, 0 si son iguales
 */
export const compareDates = (date1: string, date2: string): number => {
  const d1 = parseLocalDate(date1);
  const d2 = parseLocalDate(date2);
  return d1.getTime() - d2.getTime();
};
