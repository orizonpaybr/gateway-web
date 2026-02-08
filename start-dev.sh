#!/bin/bash

# Script para iniciar o servidor de desenvolvimento com Node.js 18 e Yarn

# NVM não funciona com NPM_CONFIG_PREFIX definido
unset NPM_CONFIG_PREFIX 2>/dev/null

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Usar Node.js 18 (obrigatório para Next.js 14)
nvm use 18 2>/dev/null || nvm use default
if [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]; then
  echo "❌ Este projeto precisa de Node.js 18+. Instale com: nvm install 18 && nvm use 18"
  exit 1
fi

echo "📋 Node.js: $(node --version)"
if command -v yarn >/dev/null 2>&1; then
  echo "📋 Yarn: $(yarn --version)"
  echo "🚀 Iniciando servidor (Yarn)..."
  yarn dev
else
  echo "📋 Yarn não encontrado, usando npm. Para usar Yarn: npm install -g yarn"
  echo "🚀 Iniciando servidor (npm)..."
  npm run dev
fi
