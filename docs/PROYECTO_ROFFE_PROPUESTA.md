# Proyecto: App de Apoyo Emocional para Niños Deportistas
## Basado en el trabajo de Marcelo Roffé

---

## 📋 RESUMEN EJECUTIVO

### Objetivo Principal
Adaptar el repositorio **Sentient** (asistente personal open-source) para crear una plataforma de apoyo emocional especializada en niños deportistas de competencia, con énfasis inicial en fútbol, pero extensible a todos los deportes.

### Asesor Profesional Principal
**Marcelo Roffé** - Psicólogo deportivo especializado en gestión del éxito y la presión en el ámbito atlético infantil.

---

## 🎯 PÚBLICO OBJETIVO

### Usuarios Primarios
- **Niños deportistas**: 8-18 años en deportes de competencia
- **Deporte inicial**: Fútbol (escalable a todos los deportes)
- **Geografía**: Inicialmente hispanohablantes (expansión global futura)

### Usuarios Secundarios
- **Padres/Tutores**: Receptores de alertas y seguimiento
- **Entrenadores**: Acceso a insights agregados (opcional)

---

## 🔑 CARACTERÍSTICAS CLAVE REQUERIDAS

### 1. **Sistema de Consultas FAQ Cerrado**
- Base de conocimiento curada por Marcelo Roffé
- Preguntas frecuentes categorizadas:
  - Presión competitiva
  - Relación con padres/entrenadores
  - Manejo de fracaso/éxito
  - Ansiedad pre-competencia
  - Conflictos de equipo
  - Balance vida deportiva/escolar

### 2. **Sistema de Alertas a Padres (Semáforo)**
- **Verde**: Conversaciones normales, desarrollo saludable
- **Amarillo**: Señales de estrés moderado, requiere atención
- **Rojo**: Indicadores de crisis, requiere intervención profesional

#### Triggers de Alertas
- Lenguaje relacionado con ansiedad extrema
- Expresiones de desmotivación persistente
- Menciones de presión excesiva
- Indicadores de conflictos familiares
- Señales de agotamiento (burnout)

### 3. **Generación de Comunidad**
- Foros moderados por categoría de edad
- Historias de éxito compartidas (anónimas)
- Grupos de soporte peer-to-peer
- Eventos virtuales con Marcelo Roffé

### 4. **Contenido Curado y Generado**
- **Videos educativos** de Marcelo Roffé
- **Artículos** sobre psicología deportiva infantil
- **Ejercicios de mindfulness** adaptados a deportistas
- **Casos de estudio** anonimizados
- **Podcast/Audio content**

### 5. **Disclaimers y Límites Claros**
- **NO es asesoramiento psicológico profesional**
- **Enfoque en coaching deportivo y apoyo emocional**
- Enlaces a recursos de salud mental profesional
- Protocolo de crisis para casos severos

---

## 🏗️ ARQUITECTURA TÉCNICA PROPUESTA

### Adaptaciones al Repositorio Sentient

#### 1. **Frontend (Next.js)**
```
src/client/
├── app/
│   ├── (auth)/          # Login niños/padres separado
│   ├── (dashboard)/      # Dashboard adaptado a niños
│   ├── faq/             # Sistema FAQ interactivo
│   ├── community/       # Foros y comunidad
│   ├── content/         # Biblioteca de recursos
│   └── parent-portal/   # Portal para padres
```

#### 2. **Backend APIs Nuevas**
```
src/client/app/api/
├── faq/
│   ├── query/          # Búsqueda inteligente en FAQ
│   ├── categories/     # Categorías de preguntas
│   └── feedback/       # Feedback de utilidad
├── alerts/
│   ├── analyze/        # Análisis de conversaciones
│   ├── notify-parent/  # Envío de alertas
│   └── history/        # Historial de alertas
├── community/
│   ├── posts/          # Publicaciones comunidad
│   ├── moderation/     # Sistema de moderación
│   └── events/         # Eventos virtuales
└── content/
    ├── videos/         # Biblioteca videos
    ├── articles/       # Artículos
    └── exercises/      # Ejercicios mindfulness
```

#### 3. **Base de Datos**
```sql
-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  role ENUM('child', 'parent', 'admin'),
  age INT, -- Solo para niños
  sport VARCHAR(100),
  parent_id UUID REFERENCES users(id), -- Link niño-padre
  created_at TIMESTAMP
);

-- Sistema de Alertas
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES users(id),
  severity ENUM('green', 'yellow', 'red'),
  trigger_type VARCHAR(100),
  conversation_snippet TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

-- FAQ System
CREATE TABLE faq_items (
  id UUID PRIMARY KEY,
  category VARCHAR(100),
  question TEXT,
  answer TEXT,
  author VARCHAR(255), -- Marcelo Roffé
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP
);

-- Community
CREATE TABLE community_posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES users(id),
  content TEXT,
  anonymous BOOLEAN DEFAULT TRUE,
  moderation_status ENUM('pending', 'approved', 'rejected'),
  created_at TIMESTAMP
);

-- Content Library
CREATE TABLE content_items (
  id UUID PRIMARY KEY,
  type ENUM('video', 'article', 'exercise', 'podcast'),
  title VARCHAR(255),
  description TEXT,
  url TEXT,
  author VARCHAR(255), -- Marcelo Roffé
  tags JSONB,
  created_at TIMESTAMP
);
```

#### 4. **Sistema de Análisis de Sentimiento**
```javascript
// Integración con LLM para análisis
async function analyzeConversation(messages, childProfile) {
  const prompt = `
    Analiza la siguiente conversación de un niño deportista (${childProfile.age} años, ${childProfile.sport}).
    
    Identifica:
    1. Nivel de ansiedad/estrés (0-10)
    2. Señales de presión excesiva
    3. Indicadores de burnout
    4. Conflictos familiares/equipo
    5. Nivel de motivación
    
    Conversación:
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Responde en JSON con:
    {
      "severity": "green|yellow|red",
      "indicators": [...],
      "recommendation": "..."
    }
  `;
  
  return await callLLM(prompt);
}
```

#### 5. **Sistema de Moderación Comunitaria**
- Moderación automática con IA
- Filtros de lenguaje inapropiado
- Detección de bullying
- Revisión humana para casos ambiguos

---

## 🎨 EXPERIENCIA DE USUARIO (UX)

### Para Niños Deportistas

#### 1. **Onboarding**
- Registro simple con edad, deporte, nivel
- Explicación clara de disclaimers
- Tour interactivo de la plataforma
- Vinculación con cuenta de padre/tutor

#### 2. **Dashboard Principal**
```
┌─────────────────────────────────────────────┐
│  👋 Hola [Nombre]                     🏆    │
├─────────────────────────────────────────────┤
│                                             │
│  💬 Pregunta del Día                       │
│  "¿Cómo manejas la presión antes de un     │
│   partido importante?"                      │
│                                             │
│  [Responder] [Ver respuestas]              │
│                                             │
├─────────────────────────────────────────────┤
│  📚 Contenido Recomendado                  │
│  • Video: "Manejo de ansiedad pre-partido" │
│  • Artículo: "El fracaso como aprendizaje" │
│                                             │
├─────────────────────────────────────────────┤
│  👥 Comunidad                              │
│  • Nueva historia: "Superé mi miedo..."    │
│  • Evento próximo: Charla con M. Roffé    │
│                                             │
├─────────────────────────────────────────────┤
│  🤖 Chat con Asistente                     │
│  [Iniciar conversación]                     │
│                                             │
└─────────────────────────────────────────────┘
```

#### 3. **Chat Asistente Adaptado**
- Lenguaje apropiado para la edad
- Emojis y tono amigable
- Respuestas basadas en FAQ de Roffé
- Escalamiento automático a recursos profesionales si detecta crisis

#### 4. **Sistema FAQ Interactivo**
- Búsqueda por categorías o keywords
- "Preguntas similares a tu búsqueda"
- Rating de utilidad
- Opción "Esto no responde mi pregunta" → Chat con asistente

### Para Padres/Tutores

#### 1. **Portal de Padres**
```
┌─────────────────────────────────────────────┐
│  Portal de Padres - [Nombre del Hijo]      │
├─────────────────────────────────────────────┤
│                                             │
│  🚦 Estado General: VERDE ✓                │
│  Última actividad: Hace 2 horas            │
│                                             │
├─────────────────────────────────────────────┤
│  📊 Resumen Semanal                        │
│  • Conversaciones: 8                        │
│  • Temas principales: Ansiedad (3),        │
│    Motivación (2), Entrenador (1)          │
│  • Alertas: 0                              │
│                                             │
├─────────────────────────────────────────────┤
│  ⚠️ Alertas Recientes                      │
│  [Ninguna alerta en los últimos 30 días]   │
│                                             │
├─────────────────────────────────────────────┤
│  📚 Recursos para Padres                   │
│  • "Cómo apoyar sin presionar"             │
│  • "Señales de burnout deportivo"          │
│                                             │
├─────────────────────────────────────────────┤
│  ⚙️ Configuración                          │
│  • Notificaciones de alertas               │
│  • Frecuencia de reportes                  │
│                                             │
└─────────────────────────────────────────────┘
```

#### 2. **Sistema de Notificaciones**
- **Email**: Alertas amarillas/rojas inmediatas
- **SMS**: Solo alertas rojas críticas
- **In-app**: Resumen semanal y alertas verdes

#### 3. **Reporte Mensual**
- PDF descargable con insights
- Gráficos de evolución emocional
- Recomendaciones de Marcelo Roffé
- Recursos adicionales

---

## 🔐 PRIVACIDAD Y SEGURIDAD

### Consideraciones Especiales para Menores

1. **COPPA Compliance** (EE.UU.)
   - Consentimiento parental verificable
   - Control parental sobre datos
   - No publicidad dirigida a menores

2. **GDPR Compliance** (Europa)
   - Consentimiento explícito
   - Derecho al olvido
   - Portabilidad de datos

3. **Encriptación**
   - Conversaciones encriptadas end-to-end
   - Datos sensibles en reposo encriptados
   - Acceso restringido por roles

4. **Anonimización**
   - Publicaciones comunitarias anónimas por defecto
   - Datos agregados para análisis
   - Sin identificadores en reportes compartidos

---

## 📈 MODELO DE NEGOCIO

### Opciones de Monetización

#### 1. **Freemium**
- **Gratis**: Acceso a FAQ, chat básico, comunidad
- **Premium** ($9.99/mes):
  - Contenido exclusivo de Roffé
  - Análisis detallado semanal
  - Sesiones grupales virtuales mensuales
  - Ejercicios personalizados

#### 2. **Licencias Institucionales**
- **Clubes deportivos**: $299/mes (hasta 50 niños)
- **Escuelas**: $499/mes (hasta 100 estudiantes)
- **Federaciones**: Planes enterprise personalizados

#### 3. **Contenido Premium**
- Cursos específicos ($29.99)
- Webinars con Marcelo Roffé ($49.99)
- Consultas 1-on-1 (referral a profesionales)

---

## 🚀 ROADMAP DE IMPLEMENTACIÓN

### Fase 1: MVP (Meses 1-3)
- [x] Análisis de requisitos (este documento)
- [ ] Adaptar sistema de autenticación dual (niño/padre)
- [ ] Implementar sistema FAQ básico
- [ ] Adaptar chat con disclaimers
- [ ] Sistema de alertas básico (análisis simple)
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

## 💡 DIFERENCIADORES CLAVE

### vs. Apps de Salud Mental Generales
- ✅ Especialización en deportes infantiles
- ✅ Contenido curado por experto reconocido (Roffé)
- ✅ Sistema de alertas preventivo para padres
- ✅ Comunidad específica de atletas jóvenes

### vs. Coaching Deportivo Tradicional
- ✅ Accesible 24/7
- ✅ Costo menor que sesiones presenciales
- ✅ Anonimato y comodidad para niños
- ✅ Escalable a miles de usuarios

### vs. Plataformas Educativas Deportivas
- ✅ Foco en salud emocional, no solo técnica
- ✅ Involucramiento de padres sin intrusión
- ✅ Detección temprana de problemas
- ✅ Construcción de comunidad de soporte

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgo 1: Responsabilidad Legal
- **Mitigación**: Disclaimers claros, T&C robustos, seguro de responsabilidad profesional

### Riesgo 2: Crisis no Detectadas
- **Mitigación**: Protocolo de escalamiento a servicios de emergencia, palabras clave críticas

### Riesgo 3: Abuso de la Plataforma
- **Mitigación**: Moderación activa, reportes de usuarios, verificación de identidad

### Riesgo 4: Privacidad de Menores
- **Mitigación**: Cumplimiento estricto COPPA/GDPR, auditorías de seguridad regulares

### Riesgo 5: Dependencia de Roffé
- **Mitigación**: Construir equipo de profesionales, licenciamiento de contenido, marca institucional

---

## 📞 PRÓXIMOS PASOS

1. **Validación con Marcelo Roffé**
   - Presentar esta propuesta
   - Obtener feedback sobre contenido
   - Definir rol y compensación

2. **Prototipo Rápido**
   - Adaptar Sentient en 2 semanas
   - Crear demo funcional
   - Testear con 10 familias piloto

3. **Fundraising**
   - Preparar pitch deck
   - Buscar inversión ángel ($100K-$250K)
   - Grants de salud mental infantil

4. **Equipo Core**
   - CTO (desarrollo)
   - Psicólogo deportivo (contenido + moderación)
   - Community manager
   - Marketing especializado en deportes infantiles

---

## 📚 REFERENCIAS

- Libro: "Mi hijo el campeón" - Marcelo Roffé
- Documento fuente: NotebookLM con 7 fuentes de Roffé
- Repositorio base: Sentient (Open-Source Personal Assistant)

---

**Marcelo Roffe © 2026 - Todos los Derechos Reservados**
*Documento técnico preparado para la adaptación del proyecto Sentient*

---

## ANEXO: Adaptaciones Técnicas Específicas

### A. Modificaciones a Sentient

#### 1. Sistema de Roles
```javascript
// src/lib/auth.js
export const USER_ROLES = {
  CHILD: 'child',
  PARENT: 'parent',
  COACH: 'coach',
  ADMIN: 'admin'
};

export function getUserDashboard(role) {
  switch(role) {
    case USER_ROLES.CHILD:
      return '/dashboard/child';
    case USER_ROLES.PARENT:
      return '/dashboard/parent';
    case USER_ROLES.COACH:
      return '/dashboard/coach';
    default:
      return '/dashboard';
  }
}
```

#### 2. Prompt System Adaptado
```javascript
// src/lib/prompts/child-support.js
export const CHILD_SUPPORT_SYSTEM_PROMPT = `
Eres un asistente de apoyo emocional para niños deportistas, basado en el trabajo de Marcelo Roffé, reconocido psicólogo deportivo.

IMPORTANTE:
- NO eres un psicólogo y NO brindas asesoramiento psicológico profesional
- Tu rol es de coaching deportivo y apoyo emocional
- Usa lenguaje apropiado para la edad del niño
- Si detectas crisis, recomienda hablar con padres o profesional

ENFOQUE:
- Ayuda a manejar presión competitiva
- Apoya en relación con padres/entrenadores
- Fomenta aprendizaje del fracaso
- Promueve balance vida deportiva/personal

TONO:
- Amigable, empático, alentador
- Usa emojis moderadamente
- Preguntas abiertas para reflexión

CONTEXTO DEL NIÑO:
- Edad: {age}
- Deporte: {sport}
- Nivel: {level}

Responde con empatía y basándote en los principios de Roffé sobre gestión del éxito y la presión en deportes infantiles.
`;
```

#### 3. Sistema de Alertas
```javascript
// src/lib/alerts/analyzer.js
const ALERT_KEYWORDS = {
  RED: [
    'quiero morirme',
    'no vale la pena',
    'odio mi vida',
    'todos me odian',
    'no puedo más',
    'dolor físico constante'
  ],
  YELLOW: [
    'muy estresado',
    'no puedo dormir',
    'ansiedad',
    'presión excesiva',
    'no quiero ir',
    'discuto mucho con mis padres'
  ]
};

export async function analyzeForAlerts(conversation, childProfile) {
  const recentMessages = conversation.slice(-10);
  const text = recentMessages.map(m => m.content).join(' ').toLowerCase();
  
  // Keyword matching
  const hasRedKeywords = ALERT_KEYWORDS.RED.some(k => text.includes(k));
  const hasYellowKeywords = ALERT_KEYWORDS.YELLOW.some(k => text.includes(k));
  
  // IA analysis
  const aiAnalysis = await analyzeSentimentWithAI(recentMessages);
  
  if (hasRedKeywords || aiAnalysis.severity === 'red') {
    await triggerAlert({
      childId: childProfile.id,
      severity: 'red',
      triggerType: 'crisis_detected',
      snippet: recentMessages.slice(-3),
      aiInsights: aiAnalysis
    });
  } else if (hasYellowKeywords || aiAnalysis.severity === 'yellow') {
    await triggerAlert({
      childId: childProfile.id,
      severity: 'yellow',
      triggerType: 'stress_detected',
      snippet: recentMessages.slice(-3),
      aiInsights: aiAnalysis
    });
  }
  
  return aiAnalysis;
}
```

---

