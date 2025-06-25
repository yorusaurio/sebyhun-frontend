#!/usr/bin/env node

/**
 * Script de debug para probar la subida de imágenes
 * Simula exactamente lo que hace el frontend
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testImageUpload() {
  try {
    console.log('🧪 === TEST DE SUBIDA DE IMAGEN - DEBUG ===');
    
    // Crear FormData exactamente como lo hace el frontend
    const formData = new FormData();
    
    // Verificar si existe un archivo de prueba
    const testFiles = ['test-image.jpg', 'test-image.png', 'logo_poste.png'];
    let testFile = null;
    
    for (const file of testFiles) {
      if (fs.existsSync(file)) {
        testFile = file;
        break;
      }
    }
    
    if (!testFile) {
      console.log('❌ No se encontró archivo de prueba. Crea uno llamado test-image.jpg o test-image.png');
      return;
    }
    
    const fileBuffer = fs.readFileSync(testFile);
    console.log(`📁 Usando archivo: ${testFile}`);
    console.log(`📊 Tamaño: ${fileBuffer.length} bytes`);
    
    formData.append('file', fileBuffer, {
      filename: testFile,
      contentType: testFile.endsWith('.png') ? 'image/png' : 'image/jpeg'
    });
    
    console.log('🔄 Enviando petición al backend...');
    
    const response = await axios.post(
      'http://localhost:8080/api/images/upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Accept': '*/*'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ RESPUESTA EXITOSA:');
    console.log('📦 Status:', response.status);
    console.log('📦 Headers:', response.headers);
    console.log('📦 Data:', JSON.stringify(response.data, null, 2));
    console.log('📦 Tipo de data:', typeof response.data);
    
    // Simular el procesamiento del frontend
    let imageUrl = '';
    
    if (response.data && typeof response.data === 'object' && response.data.url) {
      imageUrl = response.data.url;
      console.log('✅ URL extraída correctamente:', imageUrl);
    } else {
      console.log('❌ No se pudo extraer la URL de la respuesta');
    }
    
    // Verificar que la URL sea accesible
    if (imageUrl) {
      try {
        const testUrlResponse = await axios.head(imageUrl);
        console.log('✅ URL verificada - imagen accesible:', testUrlResponse.status);
      } catch (urlError) {
        console.log('❌ URL no accesible:', urlError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:');
    console.error('📦 Message:', error.message);
    
    if (error.response) {
      console.error('📦 Status:', error.response.status);
      console.error('📦 Data:', error.response.data);
      console.error('📦 Headers:', error.response.headers);
    }
    
    if (error.request) {
      console.error('📦 Request:', error.request);
    }
  }
}

// Ejecutar el test
testImageUpload().then(() => {
  console.log('🏁 Test completado');
});
