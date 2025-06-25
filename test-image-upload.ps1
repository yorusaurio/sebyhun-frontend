# Script de PowerShell para probar la subida de imágenes
# Guarda este archivo como test-image-upload.ps1

Write-Host "🧪 === TEST DE SUBIDA DE IMAGEN ===" -ForegroundColor Cyan

# Verificar si el backend está ejecutándose
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend está ejecutándose" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no está ejecutándose en http://localhost:8080" -ForegroundColor Red
    Write-Host "   Asegúrate de que el backend Spring Boot esté ejecutándose" -ForegroundColor Yellow
    exit 1
}

# Buscar un archivo de imagen para la prueba
$testFiles = @("test-image.jpg", "test-image.png", "logo_poste.png", "imagen-prueba.jpg", "imagen-prueba.png")
$testFile = $null

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        $testFile = $file
        break
    }
}

if (-not $testFile) {
    Write-Host "❌ No se encontró archivo de prueba" -ForegroundColor Red
    Write-Host "   Crea un archivo de imagen llamado 'test-image.jpg' o 'test-image.png'" -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Usando archivo: $testFile" -ForegroundColor Blue

# Preparar el comando curl
$curlCommand = @"
curl -X POST http://localhost:8080/api/images/upload \
  -H "Accept: */*" \
  -F "file=@$testFile" \
  --verbose
"@

Write-Host "🔄 Ejecutando comando curl..." -ForegroundColor Blue
Write-Host $curlCommand -ForegroundColor Gray

# Ejecutar curl (requiere que curl esté instalado en Windows)
try {
    $result = Invoke-Expression "curl -X POST http://localhost:8080/api/images/upload -H 'Accept: */*' -F 'file=@$testFile' --silent --show-error"
    Write-Host "✅ RESPUESTA DEL BACKEND:" -ForegroundColor Green
    Write-Host $result -ForegroundColor White
    
    # Intentar parsear como JSON
    try {
        $jsonResult = $result | ConvertFrom-Json
        Write-Host "📦 URL obtenida: $($jsonResult.url)" -ForegroundColor Cyan
        
        # Verificar que la URL sea accesible
        if ($jsonResult.url) {
            try {
                Invoke-RestMethod -Uri $jsonResult.url -Method HEAD -TimeoutSec 10
                Write-Host "✅ URL verificada - imagen accesible" -ForegroundColor Green
            } catch {
                Write-Host "❌ URL no accesible: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "⚠️ La respuesta no es JSON válido o tiene formato diferente" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ ERROR EN LA PETICIÓN:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "🏁 Test completado" -ForegroundColor Cyan
