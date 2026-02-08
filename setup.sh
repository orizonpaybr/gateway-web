#!/bin/bash

echo "🚀 Configurando Gateway Web..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo "📦 Instale o Node.js: https://nodejs.org/"
    exit 1
fi

# Verificar se o yarn está instalado, caso contrário usar npm
if command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
else
    PACKAGE_MANAGER="npm"
    echo "⚠️  Yarn não encontrado, usando npm..."
fi

# Instalar dependências
echo "📦 Instalando dependências..."
$PACKAGE_MANAGER install

echo "✅ Gateway Web configurado!"
echo ""
echo "📝 Para iniciar o servidor de desenvolvimento:"
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    echo "   yarn dev"
else
    echo "   npm run dev"
fi
echo ""
echo "🌐 O frontend estará disponível em: http://localhost:3000"
