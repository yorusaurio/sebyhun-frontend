/**
 * 🩺 VERIFICACIÓN DEL SISTEMA - SEBYHUN FRONTEND
 * 
 * Este script verifica que todo esté funcionando correctamente
 * después de la migración al backend Spring Boot
 */

import { useState } from 'react';
import { apiClient, manejarErrorApi } from '@/lib/apiClient';
import { recuerdosApi } from '@/lib/recuerdosApi';

interface VerificationResult {
  component: string;
  status: 'OK' | 'ERROR' | 'WARNING';
  message: string;
  details?: unknown;
}

class SystemVerification {
  private results: VerificationResult[] = [];
    private addResult(component: string, status: 'OK' | 'ERROR' | 'WARNING', message: string, details?: unknown) {
    this.results.push({ component, status, message, details });
  }

  /**
   * Verificar la conexión con el backend
   */
  async verifyBackendConnection(): Promise<void> {
    try {
      const health = await apiClient.verificarSalud();
      if (health.status === 'OK') {
        this.addResult('Backend Connection', 'OK', 'Backend Spring Boot está disponible', health);
      } else {
        this.addResult('Backend Connection', 'WARNING', 'Backend responde pero con estado no OK', health);
      }
    } catch (error) {
      this.addResult('Backend Connection', 'ERROR', `No se puede conectar al backend: ${manejarErrorApi(error)}`, error);
    }
  }

  /**
   * Verificar la configuración de la API
   */
  async verifyApiConfiguration(): Promise<void> {
    try {
      const API_CONFIG = (await import('@/config/api')).default;
      
      if (API_CONFIG.BASE_URL.includes('localhost')) {
        this.addResult('API Config', 'WARNING', 'Usando configuración de desarrollo (localhost)', {
          baseUrl: API_CONFIG.BASE_URL,
          timeout: API_CONFIG.TIMEOUT
        });
      } else {
        this.addResult('API Config', 'OK', 'Usando configuración de producción', {
          baseUrl: API_CONFIG.BASE_URL,
          timeout: API_CONFIG.TIMEOUT
        });
      }
    } catch (error) {
      this.addResult('API Config', 'ERROR', 'Error al cargar configuración de la API', error);
    }
  }

  /**
   * Verificar las variables de entorno
   */
  async verifyEnvironmentVariables(): Promise<void> {
    const requiredEnvVars = [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
    ];

    const missingVars: string[] = [];
    const presentVars: Record<string, string> = {};

    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
      } else {
        // No mostrar valores completos por seguridad
        presentVars[varName] = value.length > 20 ? `${value.substring(0, 20)}...` : value;
      }
    });

    if (missingVars.length === 0) {
      this.addResult('Environment Variables', 'OK', 'Todas las variables de entorno están configuradas', presentVars);
    } else {
      this.addResult('Environment Variables', 'ERROR', `Variables faltantes: ${missingVars.join(', ')}`, {
        missing: missingVars,
        present: presentVars
      });
    }
  }

  /**
   * Verificar los endpoints principales
   */
  async verifyMainEndpoints(): Promise<void> {
    const testUserId = 'test-verification-user';
    
    try {
      // Test GET recuerdos
      const recuerdos = await apiClient.obtenerRecuerdos(testUserId);
      this.addResult('GET Recuerdos', 'OK', `Endpoint funciona. Recuerdos encontrados: ${recuerdos.length}`, {
        count: recuerdos.length
      });

      // Test búsqueda
      const busqueda = await apiClient.buscarRecuerdos(testUserId, 'test');
      this.addResult('Search Endpoint', 'OK', `Búsqueda funciona. Resultados: ${busqueda.length}`, {
        count: busqueda.length
      });

      // Test estadísticas
      const stats = await apiClient.obtenerEstadisticas(testUserId);
      this.addResult('Stats Endpoint', 'OK', 'Estadísticas funcionan', {
        totalRecuerdos: stats.totalRecuerdos
      });

    } catch (error) {
      this.addResult('Main Endpoints', 'ERROR', `Error en endpoints principales: ${manejarErrorApi(error)}`, error);
    }
  }

  /**
   * Verificar la compatibilidad de la API de recuerdos
   */
  async verifyRecuerdosApiCompatibility(): Promise<void> {
    try {
      // Probar la API de recuerdos (capa de compatibilidad)
      const recuerdos = await recuerdosApi.getAll();
      this.addResult('RecuerdosApi Compatibility', 'OK', `API de compatibilidad funciona. Recuerdos: ${recuerdos.length}`, {
        count: recuerdos.length,
        firstRecordType: recuerdos[0] ? typeof recuerdos[0].id : 'N/A'
      });

      // Verificar health check
      const isHealthy = await recuerdosApi.checkHealth();
      this.addResult('Health Check', isHealthy ? 'OK' : 'ERROR', 
        isHealthy ? 'Health check exitoso' : 'Health check falló'
      );

    } catch (error) {
      this.addResult('RecuerdosApi Compatibility', 'ERROR', 
        `Error en API de compatibilidad: ${manejarErrorApi(error)}`, error
      );
    }
  }

  /**
   * Ejecutar todas las verificaciones
   */
  async runAllVerifications(): Promise<VerificationResult[]> {
    console.log('🩺 Iniciando verificación del sistema...');
    
    await this.verifyEnvironmentVariables();
    await this.verifyApiConfiguration();
    await this.verifyBackendConnection();
    await this.verifyMainEndpoints();
    await this.verifyRecuerdosApiCompatibility();
    
    return this.results;
  }

  /**
   * Mostrar resultados de forma legible
   */
  displayResults(): void {
    console.log('\n📊 RESULTADOS DE LA VERIFICACIÓN\n');
    
    const okCount = this.results.filter(r => r.status === 'OK').length;
    const warningCount = this.results.filter(r => r.status === 'WARNING').length;
    const errorCount = this.results.filter(r => r.status === 'ERROR').length;
    
    this.results.forEach(result => {
      const emoji = result.status === 'OK' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${emoji} ${result.component}: ${result.message}`);
      
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   Detalles:`, result.details);
      }
    });
    
    console.log(`\n📈 RESUMEN: ${okCount} OK, ${warningCount} WARNINGS, ${errorCount} ERRORS`);
    
    if (errorCount === 0) {
      console.log('🎉 Sistema completamente funcional!');
    } else if (errorCount < 3) {
      console.log('🔧 Sistema mayormente funcional, revisa los errores');
    } else {
      console.log('🚨 Sistema con problemas, revisa la configuración');
    }
  }
}

// Función principal para usar en el frontend
export async function verificarSistema(): Promise<void> {
  const verification = new SystemVerification();
  await verification.runAllVerifications();
  verification.displayResults();
}

// Hook de React para usar en componentes
export function useSystemVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<VerificationResult[]>([]);
  
  const runVerification = async () => {
    setIsVerifying(true);
    try {
      const verification = new SystemVerification();
      const verificationResults = await verification.runAllVerifications();
      setResults(verificationResults);
    } catch (error) {
      console.error('Error durante la verificación:', error);
    } finally {
      setIsVerifying(false);
    }
  };
    return {
    isVerifying,
    results,
    runVerification,
    hasErrors: results.some((r: VerificationResult) => r.status === 'ERROR'),
    hasWarnings: results.some((r: VerificationResult) => r.status === 'WARNING'),
    isAllOk: results.length > 0 && results.every((r: VerificationResult) => r.status === 'OK')
  };
}

export default SystemVerification;
