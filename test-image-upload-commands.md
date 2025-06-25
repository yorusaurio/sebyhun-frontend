# Comandos de prueba para el endpoint de subida de imágenes

## Prueba 1: Crear una imagen de prueba y subirla
# Primero, crea una imagen de prueba pequeña:
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > test-image.png

# Luego súbela al backend:
curl -X POST http://localhost:8080/api/images/upload \
  -F "file=@test-image.png" \
  -H "Content-Type: multipart/form-data" \
  -v

## Prueba 2: Con PowerShell (Windows)
# Crear imagen de prueba en PowerShell:
[System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==") | Set-Content -Path "test-image.png" -Encoding Byte

# Subir con Invoke-RestMethod:
$uri = "http://localhost:8080/api/images/upload"
$filePath = "test-image.png"
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$boundary = [System.Guid]::NewGuid().ToString()
$body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="test-image.png"
Content-Type: image/png

$([System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes))
--$boundary--
"@

Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary"

## Prueba 3: Test rápido con cualquier imagen existente
# Si tienes alguna imagen en tu sistema, puedes usar:
curl -X POST http://localhost:8080/api/images/upload \
  -F "file=@C:\ruta\a\tu\imagen.jpg" \
  -H "Content-Type: multipart/form-data" \
  -v

## Qué buscar en la respuesta:
# - Status Code: 200 OK
# - Content-Type: application/json (probablemente)
# - Body: puede ser:
#   - Un string con la URL: "uploads/imagen123.jpg"
#   - Un objeto JSON: {"url": "uploads/imagen123.jpg"}
#   - Un objeto JSON: {"path": "uploads/imagen123.jpg"}
#   - Un objeto JSON: {"filename": "imagen123.jpg"}

## Ejemplo de respuestas esperadas:
# Opción 1 (string):
# "uploads/images/2024/01/15/imagen-123.jpg"

# Opción 2 (objeto):
# {"url": "uploads/images/2024/01/15/imagen-123.jpg"}

# Opción 3 (objeto con más info):
# {
#   "filename": "imagen-123.jpg",
#   "path": "uploads/images/2024/01/15/imagen-123.jpg",
#   "url": "uploads/images/2024/01/15/imagen-123.jpg",
#   "size": 1234
# }
