#!/bin/bash

# ============================================================================
# Fair Support Fair Play - Deploy Demo Público
# ============================================================================
# Este script automatiza el deploy a Vercel + Railway
# 
# Requisitos:
# - Cuenta en Vercel (vercel.com)
# - Cuenta en Railway (railway.app)
# - Vercel CLI: npm install -g vercel
# - Railway CLI: brew install railway (Mac) o curl -fsSL https://railway.app/install.sh | sh
#
# Uso:
# ./deploy_demo.sh
# ============================================================================

set -e  # Exit on error

echo "🏆 Fair Support Fair Play - Deploy Automatizado"
echo "================================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# 1. VERIFICAR DEPENDENCIAS
# ============================================================================

echo -e "${BLUE}📦 Verificando dependencias...${NC}"

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no encontrado${NC}"
    echo "Instalar con: npm install -g vercel"
    exit 1
fi
echo -e "${GREEN}✅ Vercel CLI instalado${NC}"

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI no encontrado${NC}"
    echo "Instalar con: curl -fsSL https://railway.app/install.sh | sh"
    echo "Continuar sin Railway? (y/n)"
    read -r skip_railway
    if [ "$skip_railway" != "y" ]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Railway CLI instalado${NC}"
fi

echo ""

# ============================================================================
# 2. CONFIGURAR VARIABLES DE ENTORNO
# ============================================================================

echo -e "${BLUE}🔧 Configuración de variables de entorno${NC}"
echo ""

# Pedir OpenAI API Key
echo "Ingresa tu OpenAI API Key:"
read -s OPENAI_API_KEY
echo ""

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OpenAI API Key requerida${NC}"
    exit 1
fi

echo -e "${GREEN}✅ OpenAI API Key configurada${NC}"
echo ""

# ============================================================================
# 3. DEPLOY BACKEND A RAILWAY (Opcional)
# ============================================================================

if command -v railway &> /dev/null; then
    echo -e "${BLUE}🚂 Deploy Backend a Railway${NC}"
    echo ""
    
    echo "¿Desplegar backend a Railway? (y/n)"
    read -r deploy_railway
    
    if [ "$deploy_railway" = "y" ]; then
        # Login a Railway
        echo "Conectando a Railway..."
        railway login
        
        # Crear proyecto o usar existente
        echo "¿Crear nuevo proyecto o usar existente? (new/existing)"
        read -r railway_project
        
        if [ "$railway_project" = "new" ]; then
            railway init
        else
            echo "ID del proyecto Railway:"
            read -r railway_project_id
            railway link "$railway_project_id"
        fi
        
        # Agregar variables de entorno
        echo "Configurando variables de entorno..."
        railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
        railway variables set PORT=8000
        
        # Deploy
        echo "Desplegando backend..."
        railway up
        
        # Obtener URL
        BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
        echo -e "${GREEN}✅ Backend desplegado en: $BACKEND_URL${NC}"
    else
        echo "Ingresa URL del backend (ej: https://api.example.com):"
        read -r BACKEND_URL
    fi
else
    echo -e "${YELLOW}⚠️  Railway CLI no disponible, usando URL manual${NC}"
    echo "Ingresa URL del backend (ej: https://api.example.com):"
    read -r BACKEND_URL
fi

echo ""

# ============================================================================
# 4. DEPLOY FRONTEND A VERCEL
# ============================================================================

echo -e "${BLUE}▲ Deploy Frontend a Vercel${NC}"
echo ""

# Login a Vercel
echo "Conectando a Vercel..."
vercel login

# Navegar a directorio del cliente
cd src/client

# Crear .env.local con la URL del backend
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > .env.local
echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"

# Deploy a producción
echo "Desplegando frontend a Vercel..."
vercel --prod --yes

# Obtener URL de producción
FRONTEND_URL=$(vercel inspect --wait 2>&1 | grep -o 'https://[^"]*' | head -1)

cd ../..

echo ""
echo -e "${GREEN}✅ Frontend desplegado en: $FRONTEND_URL${NC}"

# ============================================================================
# 5. RESUMEN FINAL
# ============================================================================

echo ""
echo "================================================="
echo -e "${GREEN}🎉 Deploy Completado Exitosamente!${NC}"
echo "================================================="
echo ""
echo "URLs de tu demo público:"
echo ""
echo -e "${BLUE}🌐 Investor Landing:${NC}"
echo "   $FRONTEND_URL/investor"
echo ""
echo -e "${BLUE}🎛️  Admin Dashboard:${NC}"
echo "   $FRONTEND_URL/admin"
echo ""
echo -e "${BLUE}🔌 API REST:${NC}"
echo "   $BACKEND_URL/docs"
echo ""
echo "================================================="
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo ""
echo "1. Verificar que todo funciona:"
echo "   curl $BACKEND_URL/health"
echo ""
echo "2. Abrir en navegador:"
echo "   open $FRONTEND_URL/investor"
echo ""
echo "3. Compartir URLs con inversores"
echo ""
echo "================================================="
echo ""

# Guardar URLs en archivo
cat > DEMO_URLS.txt << EOF
Fair Support Fair Play - Demo URLs
===================================

Investor Landing: $FRONTEND_URL/investor
Admin Dashboard:  $FRONTEND_URL/admin
API REST:         $BACKEND_URL/docs

Generado: $(date)
EOF

echo -e "${GREEN}✅ URLs guardadas en DEMO_URLS.txt${NC}"
echo ""
echo "¡Listo para mostrar a inversores! 🚀"
