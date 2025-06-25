// Script de prueba para verificar el endpoint de subida de imágenes
// Ejecutar con: node test-image-upload.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

async function testImageUpload() {
  try {
    console.log('🔧 Iniciando prueba de subida de imagen...');
    console.log('📡 URL del backend:', API_BASE_URL);
    
    // Crear una imagen de prueba simple (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE5, 0x27, 0xDE, 0xFC,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Crear FormData
    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Enviando imagen de prueba...');
    
    // Realizar la petición
    const response = await axios.post(
      `${API_BASE_URL}/images/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
    
    console.log('✅ Respuesta exitosa:');
    console.log('  Status:', response.status);
    console.log('  Headers:', response.headers);
    console.log('  Data type:', typeof response.data);
    console.log('  Data:', response.data);
    
    // Analizar la respuesta
    if (typeof response.data === 'string') {
      console.log('📝 Respuesta es un string:', response.data);
    } else if (response.data && typeof response.data === 'object') {
      console.log('📦 Respuesta es un objeto:');
      Object.keys(response.data).forEach(key => {
        console.log(`  ${key}:`, response.data[key]);
      });
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Headers:', error.response.headers);
      console.error('  Data:', error.response.data);
    } else if (error.request) {
      console.error('  No response received:', error.request);
    } else {
      console.error('  Error:', error.message);
    }
  }
}

// Ejecutar la prueba
testImageUpload();
