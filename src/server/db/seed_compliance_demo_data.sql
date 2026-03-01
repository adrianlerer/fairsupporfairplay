-- ===================================================================
-- FAIR SUPPORT FAIR PLAY - Compliance Demo Data
-- Seed data for testing compliance features
-- ===================================================================

-- Note: Assumes users table already exists with some parent/child users
-- If not, create them first

-- ===================================================================
-- 1. Create demo parent and child users (if not exist)
-- ===================================================================

-- Demo parent
INSERT INTO users (id, email, full_name, role, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'padre.demo@fairsupportfairplay.com',
    'Padre Demo',
    'parent',
    NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Demo child
INSERT INTO users (id, email, full_name, role, parent_id, date_of_birth, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000002'::UUID,
    'nino.demo@fairsupportfairplay.com',
    'Niño Demo',
    'child',
    '00000000-0000-0000-0000-000000000001'::UUID,
    '2014-05-15', -- 11 años
    NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 2. Parental Consent (verified)
-- ===================================================================
INSERT INTO parental_consents (
    parent_id,
    child_id,
    verification_method,
    status,
    verified_at,
    consent_system_use,
    consent_sentiment_analysis,
    consent_parent_notifications,
    consent_data_retention_30d,
    last_reconfirmed_at,
    next_reconfirmation_due
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000002'::UUID,
    'digital_signature',
    'verified',
    NOW() - INTERVAL '29 days',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    NOW() - INTERVAL '29 days',
    NOW() + INTERVAL '11 months'
) ON CONFLICT (parent_id, child_id) DO NOTHING;

-- ===================================================================
-- 3. Parent Settings (default)
-- ===================================================================
INSERT INTO parent_settings (
    parent_id,
    child_id,
    daily_limit_minutes,
    crisis_alerts_enabled,
    sentiment_alerts_enabled,
    sentiment_threshold,
    weekly_transcript_enabled
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000002'::UUID,
    30, -- 30 min/day
    TRUE,
    TRUE,
    'medium',
    FALSE
) ON CONFLICT (parent_id, child_id) DO NOTHING;

-- ===================================================================
-- 4. User Sessions (últimos 7 días)
-- ===================================================================

-- Hoy (dentro del límite)
INSERT INTO user_sessions (
    id,
    user_id,
    started_at,
    ended_at,
    message_count,
    duration_seconds,
    platform
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002'::UUID,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 42 minutes',
    8,
    1080, -- 18 minutos
    'web'
);

-- Ayer (excedió límite)
INSERT INTO user_sessions (
    id,
    user_id,
    started_at,
    ended_at,
    message_count,
    duration_seconds,
    platform
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002'::UUID,
    NOW() - INTERVAL '1 day 3 hours',
    NOW() - INTERVAL '1 day 2 hours 15 minutes',
    15,
    2700, -- 45 minutos (excedió)
    'web'
);

-- Hace 2 días
INSERT INTO user_sessions (
    id,
    user_id,
    started_at,
    ended_at,
    message_count,
    duration_seconds,
    platform
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002'::UUID,
    NOW() - INTERVAL '2 days 4 hours',
    NOW() - INTERVAL '2 days 3 hours 35 minutes',
    10,
    1500, -- 25 minutos
    'web'
);

-- ===================================================================
-- 5. Child Complaints (varios tipos)
-- ===================================================================

-- Complaint 1: Technical (resuelto)
INSERT INTO complaint_log (
    id,
    user_id,
    issue_type,
    child_comment,
    parent_notified_at,
    reviewed_at,
    resolution_notes
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002'::UUID,
    'technical',
    'El asistente no me entendió cuando le pregunté sobre nervios antes del partido',
    NOW() - INTERVAL '5 days 2 hours',
    NOW() - INTERVAL '4 days 18 hours',
    'Ajustamos el modelo de lenguaje para mejor comprensión de expresiones coloquiales argentinas.'
);

-- Complaint 2: Content (pendiente)
INSERT INTO complaint_log (
    id,
    user_id,
    issue_type,
    child_comment,
    parent_notified_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002'::UUID,
    'content',
    'Me dio una respuesta rara sobre mis papás',
    NOW() - INTERVAL '6 hours'
);

-- Complaint 3: Privacy (resuelto rápido)
INSERT INTO complaint_log (
    id,
    user_id,
    issue_type,
    child_comment,
    parent_notified_at,
    reviewed_at,
    resolution_notes
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002'::UUID,
    'privacy',
    'No quiero compartir mi escuela',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days 20 hours',
    'Confirmamos que el sistema ya filtra nombres de escuelas. Enviamos explicación al niño y padre.'
);

-- ===================================================================
-- 6. Review Queue (algunos pendientes, algunos completados)
-- ===================================================================

-- Pendiente (complaint #2 arriba) - dentro de SLA
INSERT INTO review_queue (
    complaint_id,
    priority,
    due_date,
    status
) VALUES (
    (SELECT id FROM complaint_log WHERE child_comment LIKE '%respuesta rara%' LIMIT 1),
    'medium',
    NOW() + INTERVAL '42 hours', -- Todavía dentro de 48h
    'pending'
);

-- Completado (complaint #1)
INSERT INTO review_queue (
    complaint_id,
    priority,
    due_date,
    completed_at,
    status
) VALUES (
    (SELECT id FROM complaint_log WHERE child_comment LIKE '%nervios antes del partido%' LIMIT 1),
    'medium',
    NOW() - INTERVAL '4 days 6 hours',
    NOW() - INTERVAL '4 days 18 hours',
    'completed'
);

-- ===================================================================
-- 7. Crisis Log (1 ejemplo resuelto)
-- ===================================================================
INSERT INTO crisis_log (
    id,
    user_id,
    message_text,
    detected_keywords,
    detected_categories,
    severity,
    parent_notified_at,
    follow_up_notes,
    resolved_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002'::UUID,
    'Estoy muy mal, siento que no sirvo para nada después de perder ese partido',
    ARRAY['no sirvo para nada', 'muy mal'],
    ARRAY['self_harm'],
    'orange',
    NOW() - INTERVAL '12 days',
    'Padre contactó. Niño está recibiendo apoyo de psicólogo deportivo. Situación estabilizada.',
    NOW() - INTERVAL '11 days'
);

-- Review queue para crisis (completado rápido)
INSERT INTO review_queue (
    crisis_log_id,
    priority,
    due_date,
    completed_at,
    status
) VALUES (
    (SELECT id FROM crisis_log WHERE message_text LIKE '%no sirvo para nada%' LIMIT 1),
    'critical',
    NOW() - INTERVAL '12 days' + INTERVAL '1 hour',
    NOW() - INTERVAL '12 days' + INTERVAL '25 minutes',
    'completed'
);

-- ===================================================================
-- 8. PII Detection Log (múltiples detecciones)
-- ===================================================================
INSERT INTO pii_detection_log (user_id, detected_entities, filtered, created_at)
SELECT
    '00000000-0000-0000-0000-000000000002'::UUID,
    CASE 
        WHEN i % 3 = 0 THEN ARRAY['PERSON']
        WHEN i % 3 = 1 THEN ARRAY['LOCATION']
        ELSE ARRAY['PHONE_NUMBER']
    END,
    TRUE,
    NOW() - (i || ' days')::INTERVAL
FROM generate_series(1, 20) AS i;

-- ===================================================================
-- 9. Compliance Metrics (últimos 30 días)
-- ===================================================================
INSERT INTO compliance_metrics (
    metric_date,
    encryption_coverage_at_rest,
    encryption_coverage_in_transit,
    unauthorized_access_incidents,
    crisis_detections,
    crisis_false_positives,
    crisis_avg_escalation_minutes,
    sexual_content_blocks,
    deletion_requests_received,
    deletion_requests_completed,
    parent_complaints_received,
    parent_complaints_resolved,
    child_complaints_received,
    child_complaints_resolved,
    child_complaints_avg_resolution_hours,
    sessions_total,
    sessions_exceeding_limit
)
SELECT
    CURRENT_DATE - i,
    100.00, -- Full encryption
    100.00,
    0, -- No incidents
    CASE WHEN i = 12 THEN 1 ELSE 0 END, -- 1 crisis 12 días atrás
    0,
    CASE WHEN i = 12 THEN 25.0 ELSE NULL END,
    0, -- No sexual content attempts
    0,
    0,
    0,
    0,
    CASE 
        WHEN i = 5 THEN 1
        WHEN i = 10 THEN 1
        WHEN i = 1 THEN 1
        ELSE 0
    END, -- Complaints en días específicos
    CASE 
        WHEN i = 5 THEN 1
        WHEN i = 10 THEN 1
        ELSE 0
    END, -- Resueltos
    CASE 
        WHEN i = 5 THEN 30.0
        WHEN i = 10 THEN 26.0
        ELSE NULL
    END,
    CASE 
        WHEN i <= 7 THEN 3 + (i % 3)
        ELSE 0
    END, -- Sesiones últimos 7 días
    CASE WHEN i = 1 THEN 1 ELSE 0 END -- 1 sesión excedió ayer
FROM generate_series(0, 29) AS i;

-- ===================================================================
-- 10. Consent Audit Log (cambios en consentimiento)
-- ===================================================================
INSERT INTO consent_audit_log (
    consent_id,
    action,
    previous_state,
    new_state,
    changed_by
) VALUES (
    (SELECT id FROM parental_consents WHERE child_id = '00000000-0000-0000-0000-000000000002'::UUID LIMIT 1),
    'created',
    NULL,
    jsonb_build_object(
        'status', 'pending',
        'verification_method', 'digital_signature'
    ),
    '00000000-0000-0000-0000-000000000001'::UUID
);

INSERT INTO consent_audit_log (
    consent_id,
    action,
    previous_state,
    new_state,
    changed_by
) VALUES (
    (SELECT id FROM parental_consents WHERE child_id = '00000000-0000-0000-0000-000000000002'::UUID LIMIT 1),
    'verified',
    jsonb_build_object('status', 'pending'),
    jsonb_build_object(
        'status', 'verified',
        'verified_at', NOW() - INTERVAL '29 days'
    ),
    '00000000-0000-0000-0000-000000000001'::UUID
);

-- ===================================================================
-- VERIFICACIÓN
-- ===================================================================

-- Show summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===================================';
    RAISE NOTICE 'Compliance Demo Data Seeded';
    RAISE NOTICE '===================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - 1 parent user';
    RAISE NOTICE '  - 1 child user (11 años)';
    RAISE NOTICE '  - 1 verified consent';
    RAISE NOTICE '  - 3 sessions (1 excedió límite)';
    RAISE NOTICE '  - 3 child complaints (1 pendiente)';
    RAISE NOTICE '  - 1 crisis log (resuelto)';
    RAISE NOTICE '  - 20 PII detections';
    RAISE NOTICE '  - 30 días de metrics';
    RAISE NOTICE '';
    RAISE NOTICE 'Test users:';
    RAISE NOTICE '  Parent: padre.demo@fairsupportfairplay.com';
    RAISE NOTICE '  Child:  nino.demo@fairsupportfairplay.com';
    RAISE NOTICE '';
END $$;
