#!/bin/bash

echo "🚀 Iniciando deployment a GitHub Pages..."

# Verificar que estamos en la rama correcta
if [[ $(git branch --show-current) != "production" ]]; then
    echo "❌ Error: Debes estar en la rama 'production'"
    exit 1
fi

# Verificar que no hay cambios sin commitear
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Error: Hay cambios sin commitear. Haz commit de tus cambios primero."
    git status
    exit 1
fi

# Hacer build
echo "📦 Haciendo build de producción..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build"
    exit 1
fi

echo "✅ Build completado exitosamente"

# Verificar que el build se creó correctamente
if [ ! -d "dist" ]; then
    echo "❌ Error: No se encontró el directorio dist"
    exit 1
fi

# Hacer commit del build
echo "📝 Haciendo commit del build..."
git add dist/
git commit -m "Build de producción $(date '+%Y-%m-%d %H:%M:%S')"

# Push a GitHub
echo "⬆️ Subiendo a GitHub..."
git push origin production

if [ $? -eq 0 ]; then
    echo "✅ Deployment completado exitosamente!"
    echo "🌐 Tu aplicación estará disponible en: https://alexmc14.github.io/crms-dev/"
    echo "⏰ Puede tardar unos minutos en estar disponible"
else
    echo "❌ Error al hacer push"
    exit 1
fi 