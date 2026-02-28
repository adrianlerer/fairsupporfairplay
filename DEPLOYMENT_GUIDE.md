# 🚀 Fair Support Fair Play - Deployment Guide

## 📋 Tabla de Contenidos
1. [Pre-requisitos](#pre-requisitos)
2. [Deployment Rápido](#deployment-rápido)
3. [Configuración Backend (Railway)](#configuración-backend-railway)
4. [Configuración Frontend (Vercel)](#configuración-frontend-vercel)
5. [Configuración Database (PostgreSQL)](#configuración-database-postgresql)
6. [Variables de Entorno](#variables-de-entorno)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Pre-requisitos

### Cuentas Necesarias
- ✅ GitHub account (para código)
- ✅ Vercel account (para frontend)
- ✅ Railway account (para backend + DB)
- ✅ OpenAI API key (para análisis IA)

### Software Local
```bash
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+ (opcional, para desarrollo local)
- Git
```

---

## ⚡ Deployment Rápido

### Opción 1: Todo en Railway (Más Fácil)

#### Paso 1: Deploy PostgreSQL Database
```bash
1. Ir a Railway.app
2. Crear nuevo proyecto
3. Agregar servicio "PostgreSQL"
4. Copiar DATABASE_URL
```

#### Paso 2: Deploy Backend API
```bash
1. En Railway, agregar servicio "GitHub Repo"
2. Conectar: github.com/adrianlerer/fairsupporfairplay
3. Root directory: /
4. Build command: pip install -r requirements.txt
5. Start command: cd src/server/api && uvicorn main:app --host 0.0.0.0 --port $PORT
6. Variables de entorno:
   - DATABASE_URL: (del Paso 1)
   - OPENAI_API_KEY: sk-...
   - PORT: 8000
```

#### Paso 3: Crear Schema en DB
```bash
# Conectar a Railway PostgreSQL
railway connect PostgreSQL

# Ejecutar migrations
psql < src/server/db/schema_admin.sql
psql < src/server/db/seed_demo_data.sql
```

#### Paso 4: Deploy Frontend en Vercel
```bash
1. Ir a vercel.com
2. "Import Git Repository"
3. Seleccionar: fairsupporfairplay
4. Root Directory: src/client
5. Framework Preset: Next.js
6. Build Command: npm run build
7. Output Directory: .next
8. Variables:
   - NEXT_PUBLIC_API_URL: (URL del backend Railway)
```

---

## 🐘 Configuración Database (PostgreSQL)

### Opción A: Railway Postgres (Recomendado)
```bash
# En Railway:
1. New Project → Add Service → PostgreSQL
2. Copiar connection string
3. Format: postgresql://user:pass@host:port/dbname
```

### Opción B: Supabase (Alternativa Gratis)
```bash
1. Ir a supabase.com
2. New Project
3. Copiar Postgres connection string
4. Habilitar "Direct connection"
```

### Crear Tablas
```bash
# Opción 1: Via Railway CLI
railway run psql < src/server/db/schema_admin.sql

# Opción 2: Via URL directa
psql "postgresql://..." < src/server/db/schema_admin.sql

# Cargar datos demo
psql "postgresql://..." < src/server/db/seed_demo_data.sql
```

---

## 🔧 Variables de Entorno

### Backend (.env para Railway)
```bash
DATABASE_URL=postgresql://user:pass@host:port/dbname
OPENAI_API_KEY=sk-proj-...
PORT=8000
NODE_ENV=production
CORS_ORIGINS=https://fairsupport.vercel.app
```

### Frontend (.env.local para Vercel)
```bash
NEXT_PUBLIC_API_URL=https://api-fairsupport.railway.app
NEXT_PUBLIC_APP_NAME=Fair Support Fair Play
```

---

## 🧪 Testing

### 1. Test Backend API
```bash
# Health check
curl https://api-fairsupport.railway.app/health

# Get FAQ
curl https://api-fairsupport.railway.app/api/content/faq

# Submit query (test análisis IA)
curl -X POST https://api-fairsupport.railway.app/api/queries/submit \
  -H "Content-Type: application/json" \
  -d '{
    "child_id": "22222222-2222-2222-2222-222222222221",
    "query_text": "Me siento muy nervioso antes de los partidos"
  }'
```

### 2. Test Frontend
```bash
# Abrir en navegador:
https://fairsupport.vercel.app/investor  # Landing page
https://fairsupport.vercel.app/admin     # Admin dashboard
```

### 3. Test Integración IA
```bash
# Verificar que OpenAI funciona
python -c "
import openai
import os
openai.api_key = os.getenv('OPENAI_API_KEY')
print(openai.Model.list())
"
```

---

## 🚨 Troubleshooting

### Error: "Database connection failed"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Test connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Verificar que tablas existen
psql "$DATABASE_URL" -c "\dt"
```

### Error: "OpenAI API error"
```bash
# Verificar API key
echo $OPENAI_API_KEY

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Error: "CORS policy blocking"
```bash
# Agregar origen a backend
CORS_ORIGINS=https://fairsupport.vercel.app,https://fairsupport-preview.vercel.app
```

### Error: Frontend build fails
```bash
# Verificar Node version
node --version  # Debe ser 18+

# Limpiar cache
rm -rf src/client/.next
rm -rf src/client/node_modules
cd src/client && npm install
```

---

## 📊 URLs de Producción

Una vez desplegado, tendrás:

### Frontend (Vercel)
```
https://fairsupport.vercel.app/investor  → Landing Page
https://fairsupport.vercel.app/admin     → Admin Dashboard
```

### Backend (Railway)
```
https://api-fairsupport.railway.app/health       → Health check
https://api-fairsupport.railway.app/docs         → API Documentation
https://api-fairsupport.railway.app/api/content/ → Content endpoints
```

---

## 🎯 Demo para Inversores

### 1. Landing Page
```
URL: https://fairsupport.vercel.app/investor

Features mostradas:
✅ Market size ($4B TAM, 100M+ niños)
✅ Problem/Solution
✅ Business model
✅ Revenue projections ($1.2M ARR Y1)
✅ Investment ask ($250K seed)
```

### 2. Admin Dashboard
```
URL: https://fairsupport.vercel.app/admin

Features operativas:
✅ Métricas en tiempo real
✅ Contenido pendiente de revisión
✅ Sistema de alertas 🟢🟡🔴
✅ Biblioteca de FAQ y ejercicios
```

### 3. API Live
```
URL: https://api-fairsupport.railway.app/docs

Features funcionales:
✅ 15+ endpoints REST
✅ Análisis IA real (OpenAI GPT-4)
✅ Swagger UI interactivo
✅ Datos demo realistas
```

---

## 📈 Monitoreo

### Railway
```bash
# Ver logs en tiempo real
railway logs --tail

# Ver métricas
railway status
```

### Vercel
```bash
# Ver deployments
vercel ls

# Ver logs
vercel logs [deployment-url]
```

---

## 🔐 Security Checklist

- [ ] OpenAI API key en variables de entorno (no en código)
- [ ] DATABASE_URL segura (no compartir públicamente)
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado en ambos servicios
- [ ] Rate limiting configurado en API
- [ ] Backups automáticos de DB habilitados

---

## 📞 Soporte

**Issues técnicos:** https://github.com/adrianlerer/fairsupporfairplay/issues
**Inversores:** investors@fairsupport.com

---

© 2026 Fair Support Fair Play - Consultor y Curador: Marcelo Roffé
