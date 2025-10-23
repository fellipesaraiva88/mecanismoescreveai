#!/bin/bash

# ============================================
# 🚀 SCRIPT DE INICIALIZAÇÃO
# Sistema de Análise Comportamental - WhatsApp
# ============================================

echo "
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   📊 WhatsApp Analytics - Inicialização              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# VERIFICAR ARQUIVOS DE CONFIGURAÇÃO
# ============================================

echo -e "${YELLOW}📋 Verificando configuração...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado. Por favor, configure suas credenciais!${NC}"
    echo ""
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Arquivo frontend/.env.local não encontrado. Criando...${NC}"
    cp frontend/.env.local.example frontend/.env.local
    echo -e "${GREEN}✅ Arquivo frontend/.env.local criado!${NC}"
fi

# ============================================
# VERIFICAR NODE_MODULES
# ============================================

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    cd frontend && npm install && cd ..
fi

# ============================================
# VERIFICAR POSTGRESQL
# ============================================

echo -e "${YELLOW}🔍 Verificando PostgreSQL...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL não encontrado!${NC}"
    echo "Por favor, instale o PostgreSQL primeiro."
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL encontrado${NC}"

# ============================================
# LER PORTA DO .ENV
# ============================================

if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

BACKEND_PORT=${PORT:-3333}
FRONTEND_PORT=${FRONTEND_PORT:-3001}

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Sistema pronto para iniciar!                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📍 URLs:${NC}"
echo -e "   Backend:  http://localhost:${BACKEND_PORT}"
echo -e "   Frontend: http://localhost:${FRONTEND_PORT}"
echo ""
echo -e "${YELLOW}🚀 Para iniciar os servidores:${NC}"
echo ""
echo "   Terminal 1 (Backend):"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo "   Terminal 2 (Frontend):"
echo -e "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo -e "${YELLOW}📚 Documentação:${NC}"
echo "   - README: SISTEMA-ANALYTICS-README.md"
echo "   - Quick Start: QUICK-START.md"
echo "   - Portas: PORTAS-CONFIGURACAO.md"
echo ""
echo -e "${YELLOW}💡 Dica:${NC} Use 'npm run analytics:dev' para iniciar o backend"
echo ""
