/**
 * 📚 EJEMPLOS DE USO - API MIGRADA A SPRING BOOT
 * 
 * Este archivo contiene ejemplos de cómo usar la nueva API
 * después de la migración al backend Spring Boot
 */

import { apiClient, type Recuerdo } from '@/lib/apiClient';
import { recuerdosApi, type RecuerdoFrontend } from '@/lib/recuerdosApi';

// 🎯 EJEMPLOS CON LA API DIRECTA (apiClient)

/**
 * Ejemplo 1: CRUD básico con manejo de errores
 */
export async function ejemploCrudBasico() {
  const userId = 'user123';
  
  try {
    // 📖 Obtener todos los recuerdos
    console.log('📖 Obteniendo recuerdos...');
    const recuerdos = await apiClient.obtenerRecuerdos(userId);
    console.log(`✅ Encontrados ${recuerdos.length} recuerdos`);

    // 📝 Crear un nuevo recuerdo
    console.log('📝 Creando nuevo recuerdo...');
    const nuevoRecuerdo: Omit<Recuerdo, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
      userId: userId,
      titulo: 'Viaje a París',
      descripcion: 'Una experiencia increíble en la ciudad del amor',
      ubicacion: 'París, Francia',
      fecha: '2024-12-25',
      imagen: 'https://i.ibb.co/xyz/paris1.jpg', // Campo principal de imagen
      latitud: 48.8566,
      longitud: 2.3522
    };
    
    const recuerdoCreado = await apiClient.crearRecuerdo(nuevoRecuerdo);
    console.log('✅ Recuerdo creado:', recuerdoCreado.id);    // ✏️ Actualizar el recuerdo
    console.log('✏️ Actualizando recuerdo...');
    await apiClient.actualizarRecuerdo(recuerdoCreado.id!, {
      descripcion: 'Una experiencia ABSOLUTAMENTE increíble en la ciudad del amor'
    });
    console.log('✅ Recuerdo actualizado');

    // 🗑️ Eliminar el recuerdo
    console.log('🗑️ Eliminando recuerdo...');
    await apiClient.eliminarRecuerdo(recuerdoCreado.id!);
    console.log('✅ Recuerdo eliminado');

  } catch (error) {
    console.error('❌ Error en CRUD:', error);
  }
}

/**
 * Ejemplo 2: Búsquedas avanzadas
 */
export async function ejemploBusquedas() {
  const userId = 'user123';
  
  try {
    // 🔍 Búsqueda por título
    console.log('🔍 Buscando por título "vacaciones"...');
    const porTitulo = await apiClient.buscarPorTitulo(userId, 'vacaciones');
    console.log(`✅ Encontrados ${porTitulo.length} recuerdos por título`);

    // 📍 Búsqueda por ubicación
    console.log('📍 Buscando por ubicación "españa"...');
    const porUbicacion = await apiClient.buscarPorUbicacion(userId, 'españa');
    console.log(`✅ Encontrados ${porUbicacion.length} recuerdos por ubicación`);

    // 🔎 Búsqueda general (combina título y ubicación)
    console.log('🔎 Búsqueda general "madrid"...');
    const busquedaGeneral = await apiClient.buscarRecuerdos(userId, 'madrid');
    console.log(`✅ Encontrados ${busquedaGeneral.length} recuerdos en total`);

  } catch (error) {
    console.error('❌ Error en búsquedas:', error);
  }
}

/**
 * Ejemplo 3: Estadísticas y analytics
 */
export async function ejemploEstadisticas() {
  const userId = 'user123';
  
  try {
    console.log('📊 Obteniendo estadísticas...');
    const stats = await apiClient.obtenerEstadisticas(userId);
    
    console.log('✅ Estadísticas obtenidas:');
    console.log(`  📈 Total de recuerdos: ${stats.totalRecuerdos}`);
    console.log(`  📅 Recuerdos este año: ${stats.recuerdosEsteAnio}`);
    console.log(`  📆 Recuerdos este mes: ${stats.recuerdosEsteMes}`);
    console.log('  🌍 Ubicaciones favoritas:');
    stats.ubicacionesFavoritas.forEach((ub, index) => {
      console.log(`    ${index + 1}. ${ub.ubicacion} (${ub.cantidad} recuerdos)`);
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

/**
 * Ejemplo 4: Calendario y fechas
 */
export async function ejemploCalendario() {
  const userId = 'user123';
  const year = 2024;
  const month = 12;
  
  try {
    // 📅 Calendario mensual
    console.log(`📅 Obteniendo calendario de ${month}/${year}...`);
    const calendarioMensual = await apiClient.obtenerCalendarioMensual(userId, year, month);
    console.log(`✅ Calendario mensual: ${calendarioMensual.dias.length} días con recuerdos`);
    
    calendarioMensual.dias.forEach(dia => {
      if (dia.recuerdos.length > 0) {
        console.log(`  📆 Día ${dia.dia}: ${dia.recuerdos.length} recuerdo(s)`);
        dia.recuerdos.forEach(rec => {
          console.log(`    - ${rec.titulo} (${rec.ubicacion})`);
        });
      }
    });

    // 📊 Calendario anual
    console.log(`📊 Obteniendo resumen anual de ${year}...`);
    const calendarioAnual = await apiClient.obtenerCalendarioAnual(userId, year);
    console.log(`✅ Resumen anual: ${calendarioAnual.meses.length} meses con datos`);
    
    calendarioAnual.meses.forEach(mes => {
      console.log(`  📆 ${mes.nombreMes}: ${mes.totalRecuerdos} recuerdo(s)`);
      if (mes.primerRecuerdo) {
        console.log(`    Primer recuerdo: "${mes.primerRecuerdo.titulo}" (${mes.primerRecuerdo.fecha})`);
      }
    });

  } catch (error) {
    console.error('❌ Error con calendario:', error);
  }
}

// 🎨 EJEMPLOS CON LA API DE COMPATIBILIDAD (recuerdosApi)

/**
 * Ejemplo 5: Usando la API de compatibilidad
 */
export async function ejemploCompatibilidad() {
  try {
    // Usar la API de compatibilidad (mantiene la interfaz anterior)
    console.log('🔄 Usando API de compatibilidad...');
    
    const recuerdos = await recuerdosApi.getAll();
    console.log(`✅ Obtenidos ${recuerdos.length} recuerdos con API de compatibilidad`);

    // Los tipos siguen siendo RecuerdoFrontend
    recuerdos.forEach((recuerdo: RecuerdoFrontend) => {
      console.log(`  - ${recuerdo.titulo} (ID: ${recuerdo.id}, Tipo: ${typeof recuerdo.id})`);
    });

    // Health check
    const isHealthy = await recuerdosApi.checkHealth();
    console.log(`💚 Backend status: ${isHealthy ? 'OK' : 'ERROR'}`);

  } catch (error) {
    console.error('❌ Error con API de compatibilidad:', error);
  }
}

/**
 * Ejemplo 6: Manejo avanzado de errores
 */
export async function ejemploManejoErrores() {
  try {
    // Intentar obtener un recuerdo que no existe
    console.log('🔍 Intentando obtener recuerdo inexistente...');
    await apiClient.obtenerRecuerdo('id-que-no-existe');
      } catch (error) {
    console.log('✅ Error capturado correctamente:');
    console.log(`  Tipo: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
    console.log(`  Mensaje: ${error instanceof Error ? error.message : String(error)}`);
    
    // Usar la función de manejo de errores
    const { manejarErrorApi } = await import('@/lib/apiClient');
    const errorMessage = manejarErrorApi(error);
    console.log(`  Mensaje user-friendly: ${errorMessage}`);
  }
}

/**
 * Ejemplo 7: Usar en un componente React
 */
export function EjemploComponenteReact() {
  const [recuerdos, setRecuerdos] = useState<RecuerdoFrontend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarRecuerdos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await recuerdosApi.getAll();
      setRecuerdos(data);
    } catch (err) {
      const { manejarErrorApi } = await import('@/lib/apiClient');
      setError(manejarErrorApi(err));
    } finally {
      setLoading(false);
    }
  };

  const buscarRecuerdos = async (termino: string) => {
    if (!termino.trim()) return;
    
    setLoading(true);
    try {
      const resultados = await recuerdosApi.search(termino);
      setRecuerdos(resultados);
    } catch (err) {
      const { manejarErrorApi } = await import('@/lib/apiClient');
      setError(manejarErrorApi(err));
    } finally {
      setLoading(false);
    }
  };

  // Usar las funciones para evitar warnings
  console.log('Funciones disponibles:', { cargarRecuerdos, buscarRecuerdos });
  console.log('Estado actual:', { recuerdos: recuerdos.length, loading, error });

  return null; // Componente de ejemplo simplificado

  // Componente de ejemplo (JSX comentado)
  /*
  return (
    <div>
      <button onClick={cargarRecuerdos} disabled={loading}>
        {loading ? 'Cargando...' : 'Cargar Recuerdos'}
      </button>
      
      <input 
        type="text" 
        placeholder="Buscar recuerdos..."
        onChange={(e) => buscarRecuerdos(e.target.value)}
      />
      
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      
      <ul>
        {recuerdos.map(recuerdo => (
          <li key={recuerdo.id}>
            {recuerdo.titulo} - {recuerdo.ubicacion}
          </li>
        ))}
      </ul>
    </div>
  );
  */
}

// 🧪 FUNCIONES DE TESTING

/**
 * Ejecutar todos los ejemplos
 */
export async function ejecutarTodosLosEjemplos() {
  console.log('🚀 EJECUTANDO TODOS LOS EJEMPLOS...\n');
  
  const ejemplos = [
    { nombre: 'CRUD Básico', fn: ejemploCrudBasico },
    { nombre: 'Búsquedas', fn: ejemploBusquedas },
    { nombre: 'Estadísticas', fn: ejemploEstadisticas },
    { nombre: 'Calendario', fn: ejemploCalendario },
    { nombre: 'Compatibilidad', fn: ejemploCompatibilidad },
    { nombre: 'Manejo de Errores', fn: ejemploManejoErrores }
  ];

  for (const ejemplo of ejemplos) {
    console.log(`\n📋 Ejecutando: ${ejemplo.nombre}`);
    console.log('═'.repeat(50));
    
    try {
      await ejemplo.fn();
      console.log(`✅ ${ejemplo.nombre} completado`);
    } catch (error) {
      console.error(`❌ Error en ${ejemplo.nombre}:`, error);
    }
    
    console.log('═'.repeat(50));
  }
  
  console.log('\n🎉 TODOS LOS EJEMPLOS EJECUTADOS');
}

// Hook para usar useState (necesario para el ejemplo del componente)
import { useState } from 'react';

const ejemplosApi = {
  ejemploCrudBasico,
  ejemploBusquedas,
  ejemploEstadisticas,
  ejemploCalendario,
  ejemploCompatibilidad,
  ejemploManejoErrores,
  EjemploComponenteReact,
  ejecutarTodosLosEjemplos
};

export default ejemplosApi;
