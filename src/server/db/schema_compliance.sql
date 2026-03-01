-- ===================================================================
-- FAIR SUPPORT FAIR PLAY - Compliance Module Database Schema
-- Child Rights Impact Assessment (CRIA) Implementation
-- Based on: Privacy by Design Framework (Addae et al. 2026)
-- ===================================================================

-- ===================================================================
-- 1. TABLA: complaint_log
-- Registro de quejas/reportes de los niños (CRC Art. 12)
-- ===================================================================
CREATE TABLE IF NOT EXISTS complaint_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id),
    
    -- Tipo de problema reportado
    issue_type VARCHAR(20) NOT NULL CHECK (issue_type IN ('technical', 'content', 'privacy')),
    child_comment TEXT,
    
    -- Notificación a padres
    parent_notified_at TIMESTAMP,
    
    -- Revisión interna (48h SLA)
    reviewed_at TIMESTAMP,
    reviewer_id UUID REFERENCES users(id),
    resolution_notes TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_complaint_user ON complaint_log(user_id);
CREATE INDEX idx_complaint_status ON complaint_log(reviewed_at) WHERE reviewed_at IS NULL;
CREATE INDEX idx_complaint_created ON complaint_log(created_at DESC);

-- ===================================================================
-- 2. TABLA: review_queue
-- Cola de revisión con SLA tracking (48h para quejas, 1h para crisis)
-- ===================================================================
CREATE TABLE IF NOT EXISTS review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referencia al item a revisar
    complaint_id UUID REFERENCES complaint_log(id),
    crisis_log_id UUID REFERENCES crisis_log(id),
    
    -- Prioridad y asignación
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES users(id),
    
    -- SLA tracking
    due_date TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    
    -- Estado
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'escalated')),
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_review_status ON review_queue(status, due_date);
CREATE INDEX idx_review_priority ON review_queue(priority, due_date);
CREATE INDEX idx_review_overdue ON review_queue(due_date) WHERE status IN ('pending', 'in_progress') AND due_date < NOW();

-- ===================================================================
-- 3. TABLA: crisis_log
-- Registro de detecciones de crisis (CRC Art. 19)
-- ===================================================================
CREATE TABLE IF NOT EXISTS crisis_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id),
    
    -- Contenido y detección
    message_text TEXT NOT NULL,
    detected_keywords TEXT[],
    detected_categories TEXT[], -- ['suicide', 'self_harm', 'abuse', 'sexual']
    
    -- Severidad
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('yellow', 'orange', 'red')),
    
    -- Notificaciones
    parent_notified_at TIMESTAMP,
    authorities_notified_at TIMESTAMP,
    authorities_notified_to VARCHAR(255), -- Nombre de la autoridad contactada
    
    -- Seguimiento
    follow_up_notes TEXT,
    resolved_at TIMESTAMP,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_crisis_user ON crisis_log(user_id);
CREATE INDEX idx_crisis_severity ON crisis_log(severity, created_at DESC);
CREATE INDEX idx_crisis_unresolved ON crisis_log(resolved_at) WHERE resolved_at IS NULL;

-- ===================================================================
-- 4. TABLA: user_sessions
-- Tracking de sesiones para límites de tiempo (CRC Art. 3)
-- ===================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tiempos de sesión
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT NOW(),
    
    -- Métricas de uso
    message_count INTEGER DEFAULT 0,
    duration_seconds INTEGER, -- Calculado al cerrar sesión
    
    -- Metadata
    platform VARCHAR(50), -- 'web', 'ios', 'android'
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_user_date ON user_sessions(user_id, started_at DESC);
CREATE INDEX idx_session_active ON user_sessions(ended_at) WHERE ended_at IS NULL;

-- ===================================================================
-- 5. TABLA: parent_settings
-- Configuración de controles parentales
-- ===================================================================
CREATE TABLE IF NOT EXISTS parent_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Límites de tiempo (CRC Art. 3 - Best Interest)
    daily_limit_minutes INTEGER DEFAULT 30 CHECK (daily_limit_minutes >= 0),
    
    -- Alertas (CRC Art. 19 - Protection)
    crisis_alerts_enabled BOOLEAN DEFAULT TRUE,
    sentiment_alerts_enabled BOOLEAN DEFAULT TRUE,
    sentiment_threshold VARCHAR(20) DEFAULT 'medium' CHECK (sentiment_threshold IN ('low', 'medium', 'high')),
    
    -- Acceso a transcripts
    weekly_transcript_enabled BOOLEAN DEFAULT FALSE,
    full_transcript_access BOOLEAN DEFAULT FALSE, -- Solo para < 13 años
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(parent_id, child_id)
);

CREATE INDEX idx_parent_settings_child ON parent_settings(child_id);
CREATE INDEX idx_parent_settings_parent ON parent_settings(parent_id);

-- ===================================================================
-- 6. TABLA: pii_detection_log
-- Log de detecciones de PII (GDPR Art. 9 compliance)
-- ===================================================================
CREATE TABLE IF NOT EXISTS pii_detection_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id),
    
    -- Detección
    message_text TEXT, -- Solo guardado si es necesario para auditoría
    detected_entities TEXT[], -- ['PERSON', 'LOCATION', 'PHONE_NUMBER']
    filtered BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    detection_method VARCHAR(50) DEFAULT 'presidio', -- 'presidio', 'manual', 'pattern_match'
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pii_user ON pii_detection_log(user_id);
CREATE INDEX idx_pii_date ON pii_detection_log(created_at DESC);
CREATE INDEX idx_pii_entities ON pii_detection_log USING GIN (detected_entities);

-- ===================================================================
-- 7. TABLA: parental_consents
-- Registro de consentimientos parentales verificables (COPPA compliance)
-- ===================================================================
CREATE TABLE IF NOT EXISTS parental_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Método de verificación (COPPA Section 312.5)
    verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN (
        'digital_signature',
        'credit_card',
        'government_id',
        'video_call',
        'email_plus_verification'
    )),
    
    -- Estado
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'revoked', 'expired')),
    verified_at TIMESTAMP,
    
    -- Granularidad de consentimientos
    consent_system_use BOOLEAN DEFAULT FALSE,
    consent_sentiment_analysis BOOLEAN DEFAULT FALSE,
    consent_parent_notifications BOOLEAN DEFAULT FALSE,
    consent_data_retention_30d BOOLEAN DEFAULT FALSE, -- 30 días
    consent_system_improvement BOOLEAN DEFAULT FALSE, -- Uso anónimo para mejoras
    consent_research BOOLEAN DEFAULT FALSE, -- Uso anónimo para investigación
    
    -- Revalidación anual
    last_reconfirmed_at TIMESTAMP,
    next_reconfirmation_due TIMESTAMP,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    
    UNIQUE(parent_id, child_id)
);

CREATE INDEX idx_consent_child ON parental_consents(child_id);
CREATE INDEX idx_consent_status ON parental_consents(status);
CREATE INDEX idx_consent_reconfirmation ON parental_consents(next_reconfirmation_due) WHERE status = 'verified';

-- ===================================================================
-- 8. TABLA: consent_audit_log
-- Registro de cambios en consentimientos (accountability)
-- ===================================================================
CREATE TABLE IF NOT EXISTS consent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_id UUID NOT NULL REFERENCES parental_consents(id) ON DELETE CASCADE,
    
    -- Cambio realizado
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'verified', 'modified', 'revoked', 'reconfirmed')),
    previous_state JSONB,
    new_state JSONB,
    
    -- Contexto
    changed_by UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consent_audit_consent ON consent_audit_log(consent_id, created_at DESC);

-- ===================================================================
-- 9. TABLA: data_deletion_requests
-- Registro de solicitudes de borrado de datos (GDPR Art. 17)
-- ===================================================================
CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id), -- Parent ID
    
    -- Estado del proceso
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'in_progress',
        'completed',
        'on_hold' -- Legal hold
    )),
    
    -- Scope del borrado
    delete_queries BOOLEAN DEFAULT TRUE,
    delete_sessions BOOLEAN DEFAULT TRUE,
    delete_alerts BOOLEAN DEFAULT TRUE,
    delete_complaints BOOLEAN DEFAULT TRUE,
    delete_from_backups BOOLEAN DEFAULT TRUE,
    
    -- Legal hold
    legal_hold_reason TEXT,
    legal_hold_authority VARCHAR(255),
    legal_hold_case_number VARCHAR(255),
    
    -- Timeline (GDPR: 30 días)
    initiated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    deletion_confirmed_at TIMESTAMP,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deletion_user ON data_deletion_requests(user_id);
CREATE INDEX idx_deletion_status ON data_deletion_requests(status, initiated_at DESC);

-- ===================================================================
-- 10. TABLA: compliance_metrics
-- Métricas agregadas para reporting (dashboard interno)
-- ===================================================================
CREATE TABLE IF NOT EXISTS compliance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Privacy & Security
    encryption_coverage_at_rest NUMERIC(5,2) DEFAULT 0.00, -- Percentage
    encryption_coverage_in_transit NUMERIC(5,2) DEFAULT 0.00,
    unauthorized_access_incidents INTEGER DEFAULT 0,
    
    -- Child Safety
    crisis_detections INTEGER DEFAULT 0,
    crisis_false_positives INTEGER DEFAULT 0,
    crisis_avg_escalation_minutes NUMERIC(10,2),
    sexual_content_blocks INTEGER DEFAULT 0,
    
    -- Parental Rights
    deletion_requests_received INTEGER DEFAULT 0,
    deletion_requests_completed INTEGER DEFAULT 0,
    deletion_avg_completion_days NUMERIC(10,2),
    parent_complaints_received INTEGER DEFAULT 0,
    parent_complaints_resolved INTEGER DEFAULT 0,
    
    -- Child Participation
    child_complaints_received INTEGER DEFAULT 0,
    child_complaints_resolved INTEGER DEFAULT 0,
    child_complaints_avg_resolution_hours NUMERIC(10,2),
    
    -- Session Limits
    sessions_total INTEGER DEFAULT 0,
    sessions_exceeding_limit INTEGER DEFAULT 0,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(metric_date)
);

CREATE INDEX idx_metrics_date ON compliance_metrics(metric_date DESC);

-- ===================================================================
-- 11. VISTA: active_review_queue_summary
-- Vista consolidada de items pendientes de revisión
-- ===================================================================
CREATE OR REPLACE VIEW active_review_queue_summary AS
SELECT 
    rq.id,
    rq.priority,
    rq.status,
    rq.due_date,
    rq.created_at,
    CASE 
        WHEN rq.complaint_id IS NOT NULL THEN 'complaint'
        WHEN rq.crisis_log_id IS NOT NULL THEN 'crisis'
        ELSE 'unknown'
    END AS item_type,
    COALESCE(rq.complaint_id::TEXT, rq.crisis_log_id::Text) AS item_id,
    CASE 
        WHEN rq.due_date < NOW() THEN TRUE
        ELSE FALSE
    END AS is_overdue,
    EXTRACT(EPOCH FROM (NOW() - rq.due_date)) / 3600 AS hours_overdue,
    u.email AS assigned_to_email
FROM review_queue rq
LEFT JOIN users u ON rq.assigned_to = u.id
WHERE rq.status IN ('pending', 'in_progress')
ORDER BY 
    CASE rq.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    rq.due_date ASC;

-- ===================================================================
-- 12. FUNCIÓN: calculate_daily_usage
-- Calcula el uso diario de un niño para enforcement de límites
-- ===================================================================
CREATE OR REPLACE FUNCTION calculate_daily_usage(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    total_seconds INTEGER,
    total_minutes INTEGER,
    session_count INTEGER,
    limit_minutes INTEGER,
    remaining_minutes INTEGER,
    is_over_limit BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_sessions AS (
        SELECT 
            COALESCE(SUM(duration_seconds), 0)::INTEGER AS total_secs,
            COUNT(*)::INTEGER AS sess_count
        FROM user_sessions
        WHERE user_id = p_user_id
        AND DATE(started_at) = p_date
        AND ended_at IS NOT NULL
    ),
    settings AS (
        SELECT COALESCE(daily_limit_minutes, 30) AS limit_mins
        FROM parent_settings
        WHERE child_id = p_user_id
        LIMIT 1
    )
    SELECT 
        ds.total_secs,
        (ds.total_secs / 60)::INTEGER AS total_mins,
        ds.sess_count,
        COALESCE(s.limit_mins, 30) AS limit_mins,
        GREATEST(0, COALESCE(s.limit_mins, 30) - (ds.total_secs / 60))::INTEGER AS remaining_mins,
        (ds.total_secs / 60) >= COALESCE(s.limit_mins, 30) AS over_limit
    FROM daily_sessions ds
    LEFT JOIN settings s ON TRUE;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 13. FUNCIÓN: trigger_update_timestamp
-- Actualiza updated_at automáticamente
-- ===================================================================
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_complaint_timestamp
    BEFORE UPDATE ON complaint_log
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_review_timestamp
    BEFORE UPDATE ON review_queue
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_crisis_timestamp
    BEFORE UPDATE ON crisis_log
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_parent_settings_timestamp
    BEFORE UPDATE ON parent_settings
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_consent_timestamp
    BEFORE UPDATE ON parental_consents
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_deletion_timestamp
    BEFORE UPDATE ON data_deletion_requests
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_metrics_timestamp
    BEFORE UPDATE ON compliance_metrics
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

-- ===================================================================
-- 14. COMENTARIOS EN TABLAS (documentación)
-- ===================================================================
COMMENT ON TABLE complaint_log IS 'Child-reported issues per CRC Article 12 (right to be heard)';
COMMENT ON TABLE review_queue IS 'SLA-tracked review queue: 48h for complaints, 1h for crises';
COMMENT ON TABLE crisis_log IS 'Crisis detections per CRC Article 19 (protection from abuse)';
COMMENT ON TABLE user_sessions IS 'Session tracking for time limits per CRC Article 3 (best interest)';
COMMENT ON TABLE parent_settings IS 'Parental controls configuration';
COMMENT ON TABLE pii_detection_log IS 'PII detection events per GDPR Article 9';
COMMENT ON TABLE parental_consents IS 'Verifiable parental consents per COPPA Section 312.5';
COMMENT ON TABLE consent_audit_log IS 'Audit trail for all consent changes';
COMMENT ON TABLE data_deletion_requests IS 'GDPR Article 17 deletion requests (30-day SLA)';
COMMENT ON TABLE compliance_metrics IS 'Daily aggregated metrics for transparency reporting';
