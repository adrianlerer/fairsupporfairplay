-- ===================================================================
-- FAIR SUPPORT FAIR PLAY - Admin Module Database Schema
-- Sistema de Gestión de Contenido con Circuito Cerrado
-- ===================================================================

-- ===================================================================
-- 1. TABLA: content_review_queue
-- Cola de revisión para contenido importado desde NotebookLM
-- TODO EL CONTENIDO DEBE SER REVISADO ANTES DE PUBLICARSE
-- ===================================================================
CREATE TABLE IF NOT EXISTS content_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Metadatos del contenido
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('faq', 'exercise', 'video', 'article', 'podcast', 'raw_import')),
  content_data JSONB NOT NULL,
  category VARCHAR(100),
  
  -- Origen y autoría
  source VARCHAR(100) NOT NULL DEFAULT 'notebooklm',
  author VARCHAR(255) DEFAULT 'Fair Support Fair Play',
  imported_at TIMESTAMP DEFAULT NOW(),
  
  -- Estado de revisión (CIRCUITO CERRADO)
  status VARCHAR(50) NOT NULL DEFAULT 'pending_review' 
    CHECK (status IN ('pending_review', 'approved', 'rejected', 'needs_editing', 'published')),
  needs_human_review BOOLEAN DEFAULT TRUE,
  
  -- Verificación automática de seguridad con IA
  ai_safety_check JSONB,
  
  -- Revisión humana
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda y filtrado
CREATE INDEX idx_review_queue_status ON content_review_queue(status);
CREATE INDEX idx_review_queue_type ON content_review_queue(content_type);
CREATE INDEX idx_review_queue_category ON content_review_queue(category);
CREATE INDEX idx_review_queue_created_at ON content_review_queue(created_at DESC);

-- ===================================================================
-- 2. TABLA: faq_items
-- FAQ aprobadas y publicadas (solo contenido que pasó revisión)
-- ===================================================================
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organización
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  -- Metadatos
  author VARCHAR(255) DEFAULT 'Fair Support Fair Play',
  age_group VARCHAR(50) CHECK (age_group IN ('8-12', '13-15', '16-18', 'all')),
  sport VARCHAR(100) DEFAULT 'fútbol',
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Engagement
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  
  -- Auditoría
  published_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  source_review_id VARCHAR(255) REFERENCES content_review_queue(review_id)
);

-- Índices para búsqueda semántica
CREATE INDEX idx_faq_category ON faq_items(category);
CREATE INDEX idx_faq_age_group ON faq_items(age_group);
CREATE INDEX idx_faq_sport ON faq_items(sport);
CREATE INDEX idx_faq_tags ON faq_items USING GIN (tags);
CREATE INDEX idx_faq_question_search ON faq_items USING GIN (to_tsvector('spanish', question));
CREATE INDEX idx_faq_answer_search ON faq_items USING GIN (to_tsvector('spanish', answer));

-- ===================================================================
-- 3. TABLA: exercise_items
-- Ejercicios prácticos aprobados
-- ===================================================================
CREATE TABLE IF NOT EXISTS exercise_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contenido del ejercicio
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  instructions JSONB, -- Pasos del ejercicio
  
  -- Metadatos
  category VARCHAR(100),
  duration_minutes INT DEFAULT 10,
  difficulty VARCHAR(50) CHECK (difficulty IN ('fácil', 'medio', 'avanzado')),
  age_group VARCHAR(50),
  sport VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Media
  video_url TEXT,
  audio_url TEXT,
  image_url TEXT,
  
  -- Engagement
  completed_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  
  -- Auditoría
  author VARCHAR(255) DEFAULT 'Fair Support Fair Play',
  published_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  source_review_id VARCHAR(255) REFERENCES content_review_queue(review_id)
);

CREATE INDEX idx_exercise_category ON exercise_items(category);
CREATE INDEX idx_exercise_difficulty ON exercise_items(difficulty);
CREATE INDEX idx_exercise_age_group ON exercise_items(age_group);

-- ===================================================================
-- 4. TABLA: content_library
-- Biblioteca de videos, artículos, podcasts aprobados
-- ===================================================================
CREATE TABLE IF NOT EXISTS content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de contenido
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'article', 'podcast', 'webinar')),
  
  -- Información básica
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Metadatos
  author VARCHAR(255) DEFAULT 'Fair Support Fair Play',
  category VARCHAR(100),
  duration_minutes INT, -- Para videos y podcasts
  tags JSONB DEFAULT '[]'::jsonb,
  age_group VARCHAR(50),
  sport VARCHAR(100),
  
  -- Acceso
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  completed_count INT DEFAULT 0,
  
  -- Auditoría
  published_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  source_review_id VARCHAR(255) REFERENCES content_review_queue(review_id)
);

CREATE INDEX idx_content_type ON content_library(content_type);
CREATE INDEX idx_content_category ON content_library(category);
CREATE INDEX idx_content_premium ON content_library(is_premium);

-- ===================================================================
-- 5. TABLA: child_queries
-- Log de todas las consultas de niños (para análisis de alertas)
-- ===================================================================
CREATE TABLE IF NOT EXISTS child_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario
  child_id UUID NOT NULL REFERENCES users(id),
  parent_id UUID REFERENCES users(id),
  
  -- Contenido de la consulta
  query_text TEXT NOT NULL,
  response_text TEXT,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('web', 'discord', 'whatsapp', 'sms')),
  
  -- Análisis de sentimiento
  sentiment_score FLOAT, -- -1 (muy negativo) a 1 (muy positivo)
  emotion_detected VARCHAR(100), -- 'ansiedad', 'presión', 'frustración', 'alegría', etc.
  keywords_detected JSONB DEFAULT '[]'::jsonb,
  
  -- Sistema de alertas
  alert_generated BOOLEAN DEFAULT FALSE,
  alert_level VARCHAR(50) CHECK (alert_level IN ('green', 'yellow', 'red')),
  alert_reason TEXT,
  
  -- Privacidad
  is_private BOOLEAN DEFAULT TRUE,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_queries_child ON child_queries(child_id);
CREATE INDEX idx_queries_platform ON child_queries(platform);
CREATE INDEX idx_queries_alert_level ON child_queries(alert_level);
CREATE INDEX idx_queries_created_at ON child_queries(created_at DESC);

-- ===================================================================
-- 6. TABLA: alerts
-- Sistema de alertas semáforo para padres
-- ===================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuarios involucrados
  child_id UUID NOT NULL REFERENCES users(id),
  parent_id UUID NOT NULL REFERENCES users(id),
  
  -- Nivel de alerta (SEMÁFORO)
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('green', 'yellow', 'red')),
  
  -- Tipo y contexto
  trigger_type VARCHAR(100) NOT NULL, -- 'keyword_detected', 'sentiment_negative', 'crisis_indicators', etc.
  conversation_snippet TEXT,
  ai_analysis JSONB,
  
  -- Notificaciones enviadas
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_channels JSONB DEFAULT '[]'::jsonb, -- ['email', 'sms', 'whatsapp', 'in_app']
  notification_sent_at TIMESTAMP,
  
  -- Estado
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_child ON alerts(child_id);
CREATE INDEX idx_alerts_parent ON alerts(parent_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- ===================================================================
-- 7. TABLA: community_posts
-- Foros de comunidad (moderados)
-- ===================================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Autor
  author_id UUID NOT NULL REFERENCES users(id),
  anonymous BOOLEAN DEFAULT TRUE,
  display_name VARCHAR(100), -- "Futbolista de 14 años", si es anónimo
  
  -- Contenido
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Organización
  category VARCHAR(100),
  sport VARCHAR(100),
  age_group VARCHAR(50),
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Moderación (CIRCUITO CERRADO)
  moderation_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_reason TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP,
  
  -- Engagement
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_status ON community_posts(moderation_status);
CREATE INDEX idx_posts_category ON community_posts(category);
CREATE INDEX idx_posts_created_at ON community_posts(created_at DESC);

-- ===================================================================
-- 8. TABLA: platform_integration_log
-- Log de mensajes por plataforma (WhatsApp, Discord, SMS)
-- ===================================================================
CREATE TABLE IF NOT EXISTS platform_integration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario
  user_id UUID REFERENCES users(id),
  user_type VARCHAR(50) CHECK (user_type IN ('child', 'parent', 'coach')),
  
  -- Plataforma
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('whatsapp', 'discord', 'sms', 'email')),
  platform_user_id VARCHAR(255), -- Discord ID, WhatsApp phone, etc.
  
  -- Mensaje
  direction VARCHAR(50) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type VARCHAR(50), -- 'text', 'alert', 'notification', etc.
  message_content TEXT,
  
  -- Metadatos
  metadata JSONB,
  
  -- Estado
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'read')),
  error_message TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_log_user ON platform_integration_log(user_id);
CREATE INDEX idx_platform_log_platform ON platform_integration_log(platform);
CREATE INDEX idx_platform_log_created_at ON platform_integration_log(created_at DESC);

-- ===================================================================
-- 9. TABLA: admin_audit_log
-- Log de todas las acciones administrativas
-- ===================================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Admin que realizó la acción
  admin_id UUID NOT NULL REFERENCES users(id),
  admin_email VARCHAR(255),
  
  -- Acción realizada
  action_type VARCHAR(100) NOT NULL, -- 'content_approved', 'content_rejected', 'user_banned', etc.
  resource_type VARCHAR(100), -- 'content_review_queue', 'community_post', etc.
  resource_id UUID,
  
  -- Detalles
  action_details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_action_type ON admin_audit_log(action_type);
CREATE INDEX idx_audit_created_at ON admin_audit_log(created_at DESC);

-- ===================================================================
-- TRIGGERS AUTOMÁTICOS
-- ===================================================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_review_queue_updated_at 
  BEFORE UPDATE ON content_review_queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at 
  BEFORE UPDATE ON community_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- VISTAS ÚTILES PARA DASHBOARD
-- ===================================================================

-- Vista: Resumen de contenido pendiente de revisión
CREATE OR REPLACE VIEW v_pending_content_summary AS
SELECT 
  content_type,
  category,
  COUNT(*) as pending_count,
  MIN(created_at) as oldest_item,
  MAX(created_at) as newest_item
FROM content_review_queue
WHERE status = 'pending_review'
GROUP BY content_type, category;

-- Vista: Alertas activas por severidad
CREATE OR REPLACE VIEW v_active_alerts_summary AS
SELECT 
  severity,
  COUNT(*) as alert_count,
  COUNT(DISTINCT child_id) as unique_children
FROM alerts
WHERE resolved = FALSE
GROUP BY severity;

-- Vista: Estadísticas de plataformas
CREATE OR REPLACE VIEW v_platform_stats AS
SELECT 
  platform,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as message_count,
  COUNT(DISTINCT user_id) as unique_users
FROM platform_integration_log
GROUP BY platform, DATE_TRUNC('day', created_at);

-- ===================================================================
-- DATOS DE EJEMPLO (Seed data)
-- ===================================================================

-- Categorías predefinidas para FAQ
INSERT INTO faq_items (category, question, answer, age_group, sport) VALUES
('Presión Competitiva', '¿Cómo manejo la presión antes de un partido importante?', 'La presión es normal y puede ser tu aliada. Aquí tienes 3 técnicas: 1) Respiración profunda 4-7-8, 2) Visualización positiva, 3) Rutina pre-competencia consistente. Recuerda: la presión significa que te importa, y eso es bueno.', '13-15', 'fútbol'),
('Manejo de Fracaso', '¿Qué hago cuando perdemos un partido?', 'Perder es parte del deporte y una oportunidad de aprendizaje. Pasos: 1) Permítete sentir la frustración (es normal), 2) Analiza qué puedes mejorar (no culpes), 3) Habla con compañeros y entrenador, 4) Vuelve a entrenar con más motivación. Los mejores atletas han perdido muchas veces.', 'all', 'fútbol'),
('Relación con Padres', 'Mis padres me presionan mucho, ¿qué hago?', 'Es común que los padres quieran que seas el mejor, pero a veces no saben que su forma de alentarte puede presionarte. Intenta: 1) Hablar con ellos con calma y honestidad, 2) Explicarles cómo te sientes, 3) Si es difícil hablar, pide ayuda a tu entrenador. Recuerda: tus padres te quieren y quieren lo mejor para ti.', '13-15', 'fútbol');

-- ===================================================================
-- COMENTARIOS FINALES
-- ===================================================================

-- Este schema implementa el sistema de CIRCUITO CERRADO:
-- 1. TODO contenido importado va a content_review_queue
-- 2. Se analiza automáticamente con IA (ai_safety_check)
-- 3. REQUIERE aprobación humana obligatoria (needs_human_review = TRUE)
-- 4. Solo después de aprobación se publica en tablas públicas (faq_items, etc.)
-- 5. Log completo de auditoría para trazabilidad
--
-- Protección de menores:
-- - Moderación obligatoria de posts de comunidad
-- - Sistema de alertas automático para padres
-- - Log completo de conversaciones para análisis
-- - Sin contenido generado "on the fly" sin revisión
--
-- Consultor y Curador: Marcelo Roffé
-- © Fair Support Fair Play 2026 - Todos los derechos reservados - Fair Support Fair Play
