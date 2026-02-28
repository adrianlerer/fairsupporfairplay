<div align="center">

# ⚽ Fair Support Fair Play

### Plataforma de Apoyo Emocional para Niños Deportistas

<p>
  <strong>Contenido curado por Marcelo Roffé (Consultor y Curador)</strong>
</p>

<p>
  <em>"Transformando la presión en motivación, el fracaso en aprendizaje"</em>
</p>

</div>

---

## 🚀 Quick Links

### Para Inversores
- 📊 **[Investor Demo Guide](INVESTOR_DEMO_GUIDE.md)** - Guía completa de demostración
- 💰 **[Investment Ask](#inversión-requerida)** - $250K USD por 11.1% equity
- 📈 **Demo en Vivo:** `/investor` (Landing Page) + `/admin` (Dashboard)

### Para Desarrolladores
- 🚀 **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy en Vercel + Railway
- 📚 **[API Docs](#api-documentation)** - 15+ endpoints REST
- 🔧 **[Tech Stack](#stack-tecnológico)** - Next.js, FastAPI, PostgreSQL, OpenAI

### Documentación Técnica
- 📋 **[Admin Module Spec](docs/ADMIN_MODULE_SPEC.md)** - Especificación completa
- 🔨 **[Implementation Guide](docs/ADMIN_MODULE_IMPLEMENTATION.md)** - Guía de implementación
- 📄 **[Project Proposal](docs/PROYECTO_ROFFE_PROPUESTA.md)** - Propuesta original

---

## 📋 Descripción

**Fair Support Fair Play** es una plataforma especializada de apoyo emocional para niños y adolescentes deportistas (8-18 años) en deportes de competencia. Adaptada del proyecto open-source [Sentient](https://github.com/existence-master/Sentient), esta plataforma ofrece:

- 🎯 **Sistema FAQ curado** por expertos en psicología deportiva
- 🚦 **Alertas preventivas** para padres (sistema semáforo 🟢🟡🔴)
- 🤖 **IA Real (OpenAI GPT-4)** para análisis de sentimiento en tiempo real
- 👥 **Comunidad moderada** multicanal (Web, Discord, WhatsApp)
- 📚 **Contenido educativo** científicamente validado
- 🔒 **Circuito cerrado** - sin alucinaciones de IA

### ⚠️ Importante
Esta plataforma **NO es asesoramiento psicológico profesional**. Es una herramienta de coaching deportivo y apoyo emocional. Para casos críticos, siempre recomendamos consultar con profesionales de salud mental.

---

## 🎯 Público Objetivo

### Usuarios Primarios
- **Niños deportistas**: 8-18 años en deportes de competencia
- **Deporte inicial**: Fútbol (escalable a todos los deportes)
- **Geografía**: Hispanohablantes (expansión global futura)

### Usuarios Secundarios
- **Padres/Tutores**: Monitoreo y alertas de bienestar emocional
- **Entrenadores**: Insights agregados (opcional)

---

## 🔑 Características Principales

### 💬 Para Niños Deportistas

#### 1. Sistema FAQ Interactivo
- Base de conocimiento curada por Marcelo Roffé
- Categorías: Presión competitiva, relación con padres/entrenadores, manejo de fracaso, ansiedad pre-competencia
- Búsqueda inteligente con IA
- Feedback de utilidad

#### 2. Chat Asistente con IA
- Lenguaje apropiado para la edad
- Tono empático y alentador
- Respuestas basadas en principios de psicología deportiva
- Escalamiento automático a recursos profesionales si detecta crisis

#### 3. Comunidad
- Foros moderados por categoría de edad
- Historias de éxito anónimas
- Soporte peer-to-peer
- Eventos virtuales con Marcelo Roffé

#### 4. Biblioteca de Contenido
- Videos educativos de Marcelo Roffé
- Artículos sobre psicología deportiva infantil
- Ejercicios de mindfulness adaptados a deportistas
- Casos de estudio anonimizados

### 👨‍👩‍👧 Para Padres

#### 1. Sistema de Alertas Semáforo 🚦
- **🟢 Verde**: Conversaciones normales, desarrollo saludable
- **🟡 Amarillo**: Señales de estrés moderado, requiere atención
- **🔴 Rojo**: Indicadores de crisis, intervención profesional necesaria

#### 2. Portal de Seguimiento
- Indicador de estado emocional general
- Resumen semanal de temas conversados
- Historial de alertas
- Recursos educativos para padres

#### 3. Notificaciones
- **Email**: Alertas amarillas y rojas
- **SMS**: Solo alertas rojas críticas
- **In-app**: Resumen semanal y verde

#### 4. Reportes Mensuales
- PDF descargable con insights
- Gráficos de evolución emocional
- Recomendaciones de Marcelo Roffé

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Frontend**: Next.js 14 (React)
- **Backend**: Node.js con API Routes
- **Database**: PostgreSQL
- **IA/ML**: LLM para análisis de sentimiento
- **Auth**: Multi-rol (child/parent/coach/admin)
- **Deployment**: Vercel/Railway/Docker

### Estructura del Proyecto

```
fairsupporfairplay/
├── src/
│   ├── client/              # Frontend Next.js
│   │   ├── app/
│   │   │   ├── (auth)/      # Autenticación
│   │   │   ├── (dashboard)/ # Dashboards por rol
│   │   │   ├── faq/         # Sistema FAQ
│   │   │   ├── community/   # Foros comunidad
│   │   │   ├── content/     # Biblioteca recursos
│   │   │   └── parent-portal/ # Portal padres
│   │   └── components/      # Componentes React
│   ├── lib/                 # Utilidades y helpers
│   ├── prompts/             # System prompts para IA
│   └── config/              # Configuraciones
├── docs/                    # Documentación
│   ├── PROYECTO_ROFFE_PROPUESTA.md  # Propuesta técnica completa
│   ├── RESUMEN_EJECUTIVO_ES.md      # Resumen ejecutivo
│   └── PROJECT_ANALYSIS.json        # Análisis estructurado
├── package.json
└── README.md
```

### Base de Datos

```sql
-- Usuarios con sistema multi-rol
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('child', 'parent', 'coach', 'admin'),
  age INT,  -- Solo para niños
  sport VARCHAR(100),
  parent_id UUID REFERENCES users(id),  -- Link niño-padre
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sistema de alertas (semáforo)
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES users(id),
  severity ENUM('green', 'yellow', 'red'),
  trigger_type VARCHAR(100),
  conversation_snippet TEXT,
  ai_analysis JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sistema FAQ
CREATE TABLE faq_items (
  id UUID PRIMARY KEY,
  category VARCHAR(100),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  author VARCHAR(255) DEFAULT 'Marcelo Roffé',
  tags JSONB,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comunidad
CREATE TABLE community_posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  anonymous BOOLEAN DEFAULT TRUE,
  moderation_status ENUM('pending', 'approved', 'rejected'),
  sport VARCHAR(100),
  age_group VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Biblioteca de contenido
CREATE TABLE content_items (
  id UUID PRIMARY KEY,
  type ENUM('video', 'article', 'exercise', 'podcast'),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT,
  author VARCHAR(255) DEFAULT 'Marcelo Roffé',
  tags JSONB,
  duration_minutes INT,  -- Para videos/podcasts
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn
- Cuenta de OpenAI (para IA) o LLM local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/adrianlerer/fairsupporfairplay.git
cd fairsupporfairplay
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/fairsupport

# Autenticación
NEXTAUTH_SECRET=tu_secret_key_aqui
NEXTAUTH_URL=http://localhost:3000

# OpenAI (para análisis de IA)
OPENAI_API_KEY=sk-...

# Email (para alertas a padres)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password

# SMS (opcional, para alertas rojas)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### 4. Configurar Base de Datos

```bash
# Crear base de datos
createdb fairsupport

# Ejecutar migraciones (TODO: agregar herramienta de migraciones)
npm run db:migrate
```

### 5. Inicializar Datos Semilla (FAQ de Roffé)

```bash
npm run db:seed
```

### 6. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📖 Uso

### Para Niños Deportistas

1. **Registro**: Crear cuenta con edad, deporte, nivel
2. **Vinculación**: Conectar con cuenta de padre/tutor
3. **Explorar**: FAQ, contenido educativo, comunidad
4. **Conversar**: Chat con asistente de apoyo emocional
5. **Participar**: Foros y eventos de comunidad

### Para Padres

1. **Registro**: Crear cuenta y vincular con hijo/a
2. **Monitoreo**: Ver dashboard con estado emocional
3. **Alertas**: Recibir notificaciones según semáforo
4. **Recursos**: Acceder a contenido educativo para padres
5. **Reportes**: Revisar análisis semanal/mensual

---

## 🔐 Privacidad y Seguridad

### Cumplimiento Legal
- ✅ **COPPA** (Children's Online Privacy Protection Act)
- ✅ **GDPR** (General Data Protection Regulation)
- ✅ Consentimiento parental verificable
- ✅ Derecho al olvido y portabilidad de datos

### Seguridad
- 🔒 Encriptación end-to-end de conversaciones
- 🔒 Datos sensibles en reposo encriptados
- 🔒 Acceso restringido por roles
- 🔒 Auditorías de seguridad regulares

### Anonimización
- Publicaciones comunitarias anónimas por defecto
- Datos agregados para análisis
- Sin identificadores en reportes compartidos

---

## 📈 Modelo de Negocio

### 1. Freemium
- **Gratis**: FAQ, chat básico, comunidad
- **Premium** ($9.99/mes):
  - Contenido exclusivo de Roffé
  - Análisis detallado semanal
  - Sesiones grupales virtuales mensuales
  - Ejercicios personalizados

### 2. Licencias Institucionales
- **Clubes deportivos**: $299/mes (hasta 50 niños)
- **Escuelas**: $499/mes (hasta 100 estudiantes)
- **Federaciones**: Planes enterprise personalizados

### 3. Contenido Premium
- Cursos específicos: $29.99
- Webinars con Marcelo Roffé: $49.99
- Consultas 1-on-1: Referral a profesionales

---

## 🗺️ Roadmap

### Fase 1: MVP (Meses 1-3) - **ACTUAL**
- [x] Documentación completa
- [ ] Sistema de autenticación dual (niño/padre)
- [ ] Sistema FAQ básico
- [ ] Chat con disclaimers
- [ ] Sistema de alertas básico (keywords)
- [ ] Portal de padres minimalista

### Fase 2: Core Features (Meses 4-6)
- [ ] Análisis de sentimiento avanzado con IA
- [ ] Sistema de comunidad con moderación
- [ ] Biblioteca de contenido completa
- [ ] Sistema de alertas sofisticado (semáforo)
- [ ] Dashboard de padres completo
- [ ] Onboarding interactivo

### Fase 3: Escala y Mejoras (Meses 7-9)
- [ ] Soporte multi-idioma (Inglés, Portugués)
- [ ] Integración con clubes deportivos
- [ ] App móvil (React Native)
- [ ] Analytics y reportes avanzados
- [ ] Programa de certificación para entrenadores

### Fase 4: Expansión (Meses 10-12)
- [ ] Expansión a otros deportes (tenis, natación, etc.)
- [ ] Marketplace de contenido (otros profesionales)
- [ ] API para integraciones externas
- [ ] Programa de afiliados
- [ ] Investigación académica (publicaciones)

---

## 👥 Equipo y Contribución

### Consultor y Curador de Contenido
**Marcelo Roffé** - Psicólogo deportivo
- Autor: "Mi hijo el campeón"
- Especialización: Gestión del éxito y la presión en el ámbito atlético infantil
- Rol: Consultor profesional y curador de contenido especializado

### ¿Cómo Contribuir?

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Áreas de Contribución
- 🎨 **Diseño UX/UI**: Mejoras de interfaz para niños y padres
- 🤖 **IA/ML**: Mejoras en análisis de sentimiento
- 📝 **Contenido**: Artículos, videos, ejercicios (bajo aprobación de Roffé)
- 🌍 **Traducciones**: Expansión a otros idiomas
- 🧪 **Testing**: Tests unitarios y de integración
- 📚 **Documentación**: Mejoras y traducciones

---

## 📚 Documentación

### Documentos Principales
- [Propuesta Técnica Completa](./PROYECTO_ROFFE_PROPUESTA.md) - 30+ páginas
- [Resumen Ejecutivo en Español](./RESUMEN_EJECUTIVO_ES.md)
- [Análisis de Requisitos](./PROJECT_ANALYSIS.json)
- [Documento Fuente Original](./Proyecto%20Marcelo%20Roffe%20-%20Apoyo%20a%20niños%20en%20el%20Deporte.md)

### Guías de Uso (TODO)
- [ ] Guía de instalación detallada
- [ ] Guía de configuración
- [ ] Guía de desarrollo
- [ ] API Documentation
- [ ] Guía de deployment

---

## ⚠️ Disclaimers y Consideraciones

### Responsabilidad
Esta plataforma NO reemplaza la atención psicológica profesional. Es una herramienta de apoyo emocional y coaching deportivo. En casos de crisis o problemas severos, siempre se debe consultar con profesionales de salud mental.

### Protocolo de Crisis
Si el sistema detecta indicadores críticos:
1. Alerta roja inmediata a padres (email + SMS)
2. Mensaje al niño con recursos de emergencia
3. Enlaces a líneas de ayuda 24/7
4. Recomendación de consulta profesional

### Limitaciones Actuales
- MVP en desarrollo, no todas las features están implementadas
- Sistema de alertas en versión básica (keywords)
- Contenido de Roffé en proceso de carga
- Solo disponible en español

---

## 📊 Métricas de Éxito

### Objetivos Año 1
- 10,000 familias activas
- 50,000 conversaciones/mes
- 5 clubes con licencia institucional
- 10% tasa de conversión a premium
- App móvil lanzada
- 3 deportes cubiertos (fútbol, tenis, natación)

---

## 📞 Contacto

- **Email**: [Tu email aquí]
- **Twitter**: [@fairsupport]
- **LinkedIn**: [Fair Support Fair Play]
- **Website**: [www.fairsupportfairplay.com] (TODO)

### Para Colaboración con Marcelo Roffé
- **Email**: [Email de contacto de Roffé]
- **Website**: [marceloroffe.com]

---

## 📄 Licencia

**Nota Importante**: Este proyecto está basado en Sentient (GNU AGPL License) pero el contenido específico de Marcelo Roffé y la adaptación para deportes infantiles tienen copyright propio.

### Código Base
- **Sentient**: GNU AGPL v3 License
- **Fair Support Fair Play**: GNU AGPL v3 License (código adaptado)

### Contenido
**Fair Support Fair Play © 2026 | Consultor: Marcelo Roffé - Todos los Derechos Reservados**
- Todo el contenido educativo (FAQ, artículos, videos, ejercicios)
- Metodología de análisis y alertas basada en su trabajo
- Marca "Fair Support Fair Play"

Para uso comercial del contenido de Roffé, contactar directamente con el autor.

---

## 🙏 Agradecimientos

- **Sentient Team** por el framework base open-source
- **Marcelo Roffé** por su expertise y contenido
- **Comunidad de psicología deportiva** por investigación y recursos
- Todos los **contribuidores** que ayudan a mejorar la plataforma

---

## 🌟 Visión

Nuestra visión es crear un ecosistema global de apoyo emocional para atletas jóvenes, donde:

- 🌍 Cada niño deportista tenga acceso a recursos de salud mental
- 👨‍👩‍👧 Los padres estén equipados para apoyar sin presionar
- 🏆 El éxito se mida por desarrollo personal, no solo medallas
- 💪 La resiliencia emocional sea tan importante como la física
- 🤝 La comunidad sea un espacio seguro de aprendizaje y apoyo

**"Fair Support, Fair Play - Porque el deporte debe ser un espacio de crecimiento, no de presión"**

---

<div align="center">

Hecho con ❤️ para niños deportistas y sus familias

[⬆ Volver arriba](#-fair-support-fair-play)

</div>

---

## ✅ Estado del Proyecto

### 100% Operativo y Listo para Demo a Inversores

| Componente | Estado | Descripción |
|------------|--------|-------------|
| 🎨 **Frontend** | ✅ Completo | Next.js 15 + Tailwind CSS |
| 🔌 **Backend API** | ✅ Completo | FastAPI con 15+ endpoints |
| 🤖 **IA Integration** | ✅ Real | OpenAI GPT-4 (no mockups) |
| 🗄️ **Database** | ✅ Schema Ready | PostgreSQL con datos demo |
| 🚨 **Alert System** | ✅ Funcional | Sistema semáforo 🟢🟡🔴 |
| 📊 **Admin Dashboard** | ✅ Completo | Gestión de contenido + métricas |
| 💼 **Landing Page** | ✅ Completo | Pitch profesional para inversores |
| 📚 **Documentación** | ✅ Completa | Deployment + Demo guides |
| 🚀 **Deploy Configs** | ✅ Ready | Vercel + Railway configurado |

### Metrics

- **📦 Code:** 4,734 líneas (Python + JavaScript/JSX)
- **📄 Docs:** 42 KB de documentación
- **🔀 Commits:** 10+ commits con mensajes descriptivos
- **🌿 Branch:** `main` (100% sincronizado con remoto)
- **📁 Repository:** [github.com/adrianlerer/fairsupporfairplay](https://github.com/adrianlerer/fairsupporfairplay)

---

## 💰 Inversión Requerida

### Seed Round - $250,000 USD

| Item | Valor |
|------|-------|
| **Monto** | $250,000 USD |
| **Valuación Pre-money** | $2,000,000 |
| **Equity Ofrecido** | 11.1% |
| **Tipo** | Seed / SAFE |
| **Uso Principal** | Tech (40%), Marketing (30%), Contenido (20%), Ops (10%) |

#### Milestones con Este Capital (12 meses)
- **Mes 3:** 1,000 familias + 5 clubes → $10K MRR
- **Mes 6:** 5,000 familias + 25 instituciones → $50K MRR
- **Mes 9:** 10,000 familias + 50 instituciones → $100K MRR
- **Mes 12:** Series A ready → $1.2M ARR

**Contacto:** investors@fairsupport.com

---

## 🏗️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Headless UI
- **State Management:** Zustand
- **API Client:** TanStack Query

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 14+
- **ORM:** asyncpg (async/await)
- **IA:** OpenAI API (GPT-4)
- **Authentication:** NextAuth.js / Auth0

### Integrations
- **Chat:** Discord.js
- **WhatsApp:** WAHA (WhatsApp HTTP API)
- **SMS:** Twilio
- **NotebookLM:** MCP Connector

### DevOps
- **Frontend Deploy:** Vercel
- **Backend Deploy:** Railway / Render
- **Database Host:** Railway / Supabase
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + PostHog

---

## 📦 Repositorio

### Estructura Principal

```
fairsupporfairplay/
├── src/
│   ├── client/                 # Next.js Frontend
│   │   ├── app/
│   │   │   ├── admin/          # Admin Dashboard
│   │   │   ├── investor/       # Landing Page
│   │   │   └── components/     # Componentes reutilizables
│   │   └── package.json
│   │
│   └── server/                 # Backend Python
│       ├── api/
│       │   └── main.py         # FastAPI app (26 KB)
│       ├── db/
│       │   ├── schema_admin.sql       # Schema completo
│       │   └── seed_demo_data.sql     # Datos demo
│       └── main/
│           ├── admin/          # Módulos admin
│           └── platforms/      # Integraciones
│
├── docs/                       # Documentación
│   ├── ADMIN_MODULE_SPEC.md
│   ├── ADMIN_MODULE_IMPLEMENTATION.md
│   ├── PROYECTO_ROFFE_PROPUESTA.md
│   └── RESUMEN_FINAL_IMPLEMENTACION.md
│
├── DEPLOYMENT_GUIDE.md         # Guía de deployment
├── INVESTOR_DEMO_GUIDE.md      # Guía para inversores
├── INVESTOR_DEMO_README.md     # Estado actual del proyecto
├── vercel.json                 # Config Vercel
├── railway.json                # Config Railway
└── Dockerfile.api              # Docker para API
```

---

## 🚀 Quick Start

### Opción 1: Demo Local (Desarrollo)

#### Backend API
```bash
# Clonar repo
git clone https://github.com/adrianlerer/fairsupporfairplay.git
cd fairsupporfairplay

# Instalar dependencias Python
pip install -r requirements.txt

# Configurar .env
export DATABASE_URL="postgresql://user:pass@localhost/fairsupport"
export OPENAI_API_KEY="sk-..."

# Crear DB y cargar schema
psql -f src/server/db/schema_admin.sql
psql -f src/server/db/seed_demo_data.sql

# Iniciar API
cd src/server/api
uvicorn main:app --reload --port 8000

# API disponible en: http://localhost:8000
# Docs en: http://localhost:8000/docs
```

#### Frontend Dashboard
```bash
# Navegar a cliente
cd src/client

# Instalar dependencias
npm install

# Configurar .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Iniciar dev server
npm run dev

# Frontend disponible en: http://localhost:3000
# Admin: http://localhost:3000/admin
# Investor: http://localhost:3000/investor
```

### Opción 2: Deploy a Producción

Ver **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** para instrucciones completas de deployment en Vercel + Railway.

---

## 📊 Demo para Inversores

### 1. Landing Page (/investor)
**Propósito:** Pitch completo de la oportunidad de inversión

**Contenido:**
- 📈 Market size y oportunidad ($4B TAM)
- 🎯 Problem / Solution
- 💰 Business model (B2C + B2B)
- 📊 Proyecciones financieras
- 🚀 Investment ask

### 2. Admin Dashboard (/admin)
**Propósito:** Demo del producto real funcionando

**Features:**
- 📊 Métricas en tiempo real
- ✅ Sistema de revisión de contenido
- 🚨 Monitoreo de alertas (🟢🟡🔴)
- 📚 Biblioteca de contenido curado

### 3. API REST (/api/docs)
**Propósito:** Demostrar la tecnología subyacente

**Capabilities:**
- 🔌 15+ endpoints funcionales
- 🤖 Análisis IA real (OpenAI GPT-4)
- ⚡ Respuesta < 1 segundo
- 📖 Swagger UI interactivo

---

## 🤝 Equipo y Consultoría

### Founders & Socios
Equipo de desarrollo técnico y de negocio

### Consultor y Curador de Contenido
**Marcelo Roffé**  
Psicólogo deportivo reconocido internacionalmente. Ha trabajado con selecciones nacionales y clubes de primer nivel. Su metodología y contenido forman la base de nuestra biblioteca educativa.

### Asesores Adicionales
Psicólogos deportivos y expertos en desarrollo infantil (en proceso de incorporación).

---

## 📞 Contacto

### Para Inversores
- **Email:** investors@fairsupport.com
- **Teléfono:** +54 11 1234-5678
- **Documentos:** Ver [INVESTOR_DEMO_GUIDE.md](INVESTOR_DEMO_GUIDE.md)

### Para Desarrolladores
- **Issues:** [GitHub Issues](https://github.com/adrianlerer/fairsupporfairplay/issues)
- **Pull Requests:** Bienvenidos
- **Documentación:** Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 📄 Licencia y Copyright

**Código:** Sentient AGPL v3.0  
**Contenido:** © 2026 Fair Support Fair Play  
**Consultor y Curador:** Marcelo Roffé

---

## 🙏 Agradecimientos

- Proyecto basado en [Sentient](https://github.com/existence-master/Sentient) por existence-master
- Contenido curado por Marcelo Roffé
- Comunidad de psicología deportiva

---

**¿Listo para proteger la salud mental de 100M+ niños deportistas?**

🎯 [Ver Demo](/investor) | 💰 [Solicitar Reunión](mailto:investors@fairsupport.com) | 📚 [Leer Docs](INVESTOR_DEMO_GUIDE.md)
