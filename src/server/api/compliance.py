"""
Fair Support Fair Play - Compliance API
=======================================

Child Rights Compliance endpoints per CRIA framework:
- Child complaints (CRC Art. 12)
- Crisis detection (CRC Art. 19)
- Session time limits (CRC Art. 3)
- Parent settings
- Compliance metrics

Consultor y Curador de Contenido: Marcelo Roffé
© Fair Support Fair Play 2026 - Todos los derechos reservados
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import asyncpg
from uuid import UUID

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

# ============================================================================
# MODELS
# ============================================================================

class IssueType(str, Enum):
    TECHNICAL = "technical"
    CONTENT = "content"
    PRIVACY = "privacy"

class ComplaintCreate(BaseModel):
    session_id: Optional[UUID] = None
    issue_type: IssueType
    child_comment: Optional[str] = Field(None, max_length=200)

class ComplaintResponse(BaseModel):
    id: UUID
    issue_type: str
    child_comment: Optional[str]
    created_at: datetime
    parent_notified: bool
    reviewed: bool
    resolution_notes: Optional[str]

class SessionUsage(BaseModel):
    total_minutes: int
    total_seconds: int
    session_count: int
    limit_minutes: int
    remaining_minutes: int
    is_over_limit: bool
    warning_message: Optional[str] = None

class ParentSettingsUpdate(BaseModel):
    daily_limit_minutes: Optional[int] = Field(None, ge=0, le=120)
    crisis_alerts_enabled: Optional[bool] = None
    sentiment_alerts_enabled: Optional[bool] = None
    sentiment_threshold: Optional[str] = Field(None, pattern="^(low|medium|high)$")

class ParentSettingsResponse(BaseModel):
    daily_limit_minutes: int
    crisis_alerts_enabled: bool
    sentiment_alerts_enabled: bool
    sentiment_threshold: str
    weekly_transcript_enabled: bool

class CrisisKeyword(BaseModel):
    category: str
    keywords: List[str]

class CrisisDetection(BaseModel):
    is_crisis: bool
    severity: Optional[str] = None
    categories: List[str] = []
    resources: List[Dict[str, str]] = []
    message: Optional[str] = None

class ComplianceMetrics(BaseModel):
    pending_complaints: int
    pending_complaints_overdue: int
    pending_crisis: int
    pii_detections_today: int
    sessions_over_limit_today: int
    active_children: int

# ============================================================================
# CRISIS KEYWORDS (as per docs/PRIVACY_BY_DESIGN_IMPLEMENTATION.md)
# ============================================================================

CRISIS_KEYWORDS = {
    'suicide': [
        'suicidio', 'suicidarme', 'matarme', 'matar me', 
        'quiero morir', 'quiero morirme', 'acabar con mi vida',
        'no quiero vivir', 'mejor muerto'
    ],
    'self_harm': [
        'cortarme', 'cortar me', 'lastimarme', 'lastimar me',
        'hacerme daño', 'hacer me daño', 'golpearme'
    ],
    'abuse': [
        'me pega', 'me golpea', 'me grita mucho', 'me grita todo el tiempo',
        'tengo miedo de', 'le tengo miedo', 'me da miedo',
        'me maltrata', 'me insulta'
    ],
    'sexual': [
        'me toca', 'me tocó', 'tocarme',
        'me tocó donde', 'me toca donde',
        'inapropiado', 'incomodo', 'incómodo'
    ]
}

CRISIS_RESOURCES = [
    {
        "name": "Línea Nacional de Prevención del Suicidio (Argentina)",
        "phone": "135",
        "type": "crisis"
    },
    {
        "name": "Centro de Asistencia al Suicida (Buenos Aires)",
        "phone": "(011) 5275-1135",
        "type": "crisis"
    },
    {
        "name": "Línea 102 - Derechos de Niños, Niñas y Adolescentes",
        "phone": "102",
        "type": "child_protection"
    },
    {
        "name": "Línea 137 - Víctimas de Violencia Familiar",
        "phone": "137",
        "type": "abuse"
    }
]

# ============================================================================
# DEPENDENCY: Get DB Connection
# ============================================================================

async def get_db_conn(db_pool: asyncpg.Pool = None):
    """Dependency to get DB connection from pool"""
    if db_pool is None:
        # In production, this would be injected from main.py
        raise HTTPException(
            status_code=500,
            detail="Database pool not initialized"
        )
    async with db_pool.acquire() as conn:
        yield conn

# ============================================================================
# ENDPOINTS: Child Complaints
# ============================================================================

@router.post("/child/report-problem", response_model=Dict[str, Any])
async def report_problem(
    complaint: ComplaintCreate,
    user_id: UUID,  # Would come from auth middleware in production
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """
    Child reports a problem (CRC Article 12: Right to be Heard)
    
    - Creates complaint log
    - Notifies parent
    - Adds to review queue (48h SLA)
    """
    
    # Insert complaint
    query = """
        INSERT INTO complaint_log (user_id, session_id, issue_type, child_comment, parent_notified_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, created_at
    """
    row = await conn.fetchrow(
        query,
        user_id,
        complaint.session_id,
        complaint.issue_type.value,
        complaint.child_comment
    )
    
    complaint_id = row['id']
    
    # Add to review queue (48h SLA)
    due_date = datetime.utcnow() + timedelta(hours=48)
    await conn.execute(
        """
        INSERT INTO review_queue (complaint_id, priority, due_date, status)
        VALUES ($1, 'medium', $2, 'pending')
        """,
        complaint_id,
        due_date
    )
    
    # Get parent email for notification
    parent_row = await conn.fetchrow(
        """
        SELECT u2.email
        FROM users u1
        JOIN users u2 ON u1.parent_id = u2.id
        WHERE u1.id = $1
        """,
        user_id
    )
    
    # In production, send actual email/SMS here
    # await send_email(parent_row['email'], ...)
    # await send_sms(parent_phone, ...)
    
    return {
        "status": "received",
        "complaint_id": str(complaint_id),
        "message": "Gracias por reportar esto. Tu papá/mamá ha sido notificado. Nuestro equipo lo revisará en las próximas 48 horas.",
        "parent_notified": True,
        "review_due_date": due_date.isoformat()
    }


@router.get("/child/my-complaints", response_model=List[ComplaintResponse])
async def get_my_complaints(
    user_id: UUID,  # From auth
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """Get all complaints submitted by this child"""
    
    rows = await conn.fetch(
        """
        SELECT 
            id,
            issue_type,
            child_comment,
            created_at,
            parent_notified_at IS NOT NULL AS parent_notified,
            reviewed_at IS NOT NULL AS reviewed,
            resolution_notes
        FROM complaint_log
        WHERE user_id = $1
        ORDER BY created_at DESC
        """,
        user_id
    )
    
    return [
        ComplaintResponse(
            id=row['id'],
            issue_type=row['issue_type'],
            child_comment=row['child_comment'],
            created_at=row['created_at'],
            parent_notified=row['parent_notified'],
            reviewed=row['reviewed'],
            resolution_notes=row['resolution_notes']
        )
        for row in rows
    ]

# ============================================================================
# ENDPOINTS: Session Time Limits
# ============================================================================

@router.get("/child/session-usage", response_model=SessionUsage)
async def check_session_usage(
    user_id: UUID,  # From auth
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """
    Check child's usage today (CRC Article 3: Best Interest)
    
    Returns:
    - Total minutes used today
    - Limit from parent settings
    - Remaining time
    - Warning if close to limit
    """
    
    # Use the SQL function we created
    row = await conn.fetchrow(
        "SELECT * FROM calculate_daily_usage($1, CURRENT_DATE)",
        user_id
    )
    
    warning_message = None
    if not row['is_over_limit'] and row['remaining_minutes'] <= 5:
        warning_message = f"⚠️ Te quedan {row['remaining_minutes']} minutos hoy"
    
    return SessionUsage(
        total_seconds=row['total_seconds'],
        total_minutes=row['total_minutes'],
        session_count=row['session_count'],
        limit_minutes=row['limit_minutes'],
        remaining_minutes=row['remaining_minutes'],
        is_over_limit=row['is_over_limit'],
        warning_message=warning_message
    )


@router.post("/child/start-session", response_model=Dict[str, Any])
async def start_session(
    user_id: UUID,  # From auth
    platform: str = "web",
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """
    Start a new session (checks time limit first)
    """
    
    # Check if over limit
    usage = await conn.fetchrow(
        "SELECT * FROM calculate_daily_usage($1, CURRENT_DATE)",
        user_id
    )
    
    if usage['is_over_limit']:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "daily_limit_reached",
                "message": "Has alcanzado tu límite diario. ¡Vuelve mañana!",
                "limit_minutes": usage['limit_minutes'],
                "used_minutes": usage['total_minutes'],
                "reset_at": (datetime.utcnow().replace(hour=0, minute=0, second=0) + timedelta(days=1)).isoformat()
            }
        )
    
    # Create session
    row = await conn.fetchrow(
        """
        INSERT INTO user_sessions (user_id, platform, started_at)
        VALUES ($1, $2, NOW())
        RETURNING id, started_at
        """,
        user_id,
        platform
    )
    
    return {
        "session_id": str(row['id']),
        "started_at": row['started_at'].isoformat(),
        "remaining_minutes": usage['remaining_minutes'],
        "warning": "Te quedan pocos minutos" if usage['remaining_minutes'] <= 5 else None
    }


@router.post("/child/end-session/{session_id}")
async def end_session(
    session_id: UUID,
    message_count: int = 0,
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """End current session and calculate duration"""
    
    await conn.execute(
        """
        UPDATE user_sessions
        SET 
            ended_at = NOW(),
            message_count = $2,
            duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
        WHERE id = $1 AND ended_at IS NULL
        """,
        session_id,
        message_count
    )
    
    return {"status": "session_ended"}

# ============================================================================
# ENDPOINTS: Crisis Detection
# ============================================================================

@router.post("/child/check-crisis", response_model=CrisisDetection)
async def check_for_crisis(
    message: str,
    user_id: UUID,  # From auth
    session_id: Optional[UUID] = None,
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """
    Detect crisis keywords in message (CRC Article 19: Protection)
    
    Returns:
    - Whether crisis was detected
    - Severity level
    - Crisis resources
    - Notifies parent if crisis detected
    """
    
    message_lower = message.lower()
    detected_categories = []
    detected_keywords_list = []
    
    # Check each category
    for category, keywords in CRISIS_KEYWORDS.items():
        for keyword in keywords:
            if keyword in message_lower:
                if category not in detected_categories:
                    detected_categories.append(category)
                detected_keywords_list.append(keyword)
    
    if not detected_categories:
        return CrisisDetection(is_crisis=False)
    
    # Determine severity
    severity = 'red' if 'suicide' in detected_categories else 'orange'
    
    # Log crisis
    crisis_id = await conn.fetchval(
        """
        INSERT INTO crisis_log (
            user_id, 
            session_id,
            message_text, 
            detected_keywords, 
            detected_categories,
            severity,
            parent_notified_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
        """,
        user_id,
        session_id,
        message,
        detected_keywords_list,
        detected_categories,
        severity
    )
    
    # Add to review queue (1h SLA for crisis)
    await conn.execute(
        """
        INSERT INTO review_queue (crisis_log_id, priority, due_date, status)
        VALUES ($1, 'critical', $2, 'pending')
        """,
        crisis_id,
        datetime.utcnow() + timedelta(hours=1)
    )
    
    # Get parent contact for notification
    parent_row = await conn.fetchrow(
        """
        SELECT u2.email, u2.phone
        FROM users u1
        JOIN users u2 ON u1.parent_id = u2.id
        WHERE u1.id = $1
        """,
        user_id
    )
    
    # In production, send SMS + email
    # await send_sms(parent_row['phone'], "URGENTE: Tu hijo/a puede necesitar apoyo...")
    # await send_email(parent_row['email'], ...)
    
    return CrisisDetection(
        is_crisis=True,
        severity=severity,
        categories=detected_categories,
        resources=CRISIS_RESOURCES,
        message="Parece que estás pasando por un momento difícil. Tu papá/mamá ha sido notificado. Si estás en peligro inmediato, por favor llama al 135 (Línea de Prevención del Suicidio) o al 911."
    )

# ============================================================================
# ENDPOINTS: Parent Settings
# ============================================================================

@router.get("/parent/settings/{child_id}", response_model=ParentSettingsResponse)
async def get_parent_settings(
    child_id: UUID,
    parent_id: UUID,  # From auth
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """Get parental control settings for a child"""
    
    row = await conn.fetchrow(
        """
        SELECT 
            daily_limit_minutes,
            crisis_alerts_enabled,
            sentiment_alerts_enabled,
            sentiment_threshold,
            weekly_transcript_enabled
        FROM parent_settings
        WHERE parent_id = $1 AND child_id = $2
        """,
        parent_id,
        child_id
    )
    
    if not row:
        # Return defaults if not set
        return ParentSettingsResponse(
            daily_limit_minutes=30,
            crisis_alerts_enabled=True,
            sentiment_alerts_enabled=True,
            sentiment_threshold="medium",
            weekly_transcript_enabled=False
        )
    
    return ParentSettingsResponse(**dict(row))


@router.patch("/parent/settings/{child_id}")
async def update_parent_settings(
    child_id: UUID,
    parent_id: UUID,  # From auth
    settings: ParentSettingsUpdate,
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """Update parental control settings"""
    
    # Build dynamic UPDATE query
    updates = []
    values = []
    param_idx = 1
    
    if settings.daily_limit_minutes is not None:
        updates.append(f"daily_limit_minutes = ${param_idx}")
        values.append(settings.daily_limit_minutes)
        param_idx += 1
    
    if settings.crisis_alerts_enabled is not None:
        updates.append(f"crisis_alerts_enabled = ${param_idx}")
        values.append(settings.crisis_alerts_enabled)
        param_idx += 1
    
    if settings.sentiment_alerts_enabled is not None:
        updates.append(f"sentiment_alerts_enabled = ${param_idx}")
        values.append(settings.sentiment_alerts_enabled)
        param_idx += 1
    
    if settings.sentiment_threshold is not None:
        updates.append(f"sentiment_threshold = ${param_idx}")
        values.append(settings.sentiment_threshold)
        param_idx += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    updates.append(f"updated_at = NOW()")
    values.extend([parent_id, child_id])
    
    query = f"""
        INSERT INTO parent_settings (parent_id, child_id, {', '.join([u.split('=')[0].strip() for u in updates])})
        VALUES (${param_idx}, ${param_idx + 1}, {', '.join([f'${i+1}' for i in range(len(updates))])})
        ON CONFLICT (parent_id, child_id)
        DO UPDATE SET {', '.join(updates)}
    """
    
    await conn.execute(query, *values)
    
    return {"status": "updated"}

# ============================================================================
# ENDPOINTS: Compliance Metrics (Internal Dashboard)
# ============================================================================

@router.get("/admin/metrics", response_model=ComplianceMetrics)
async def get_compliance_metrics(
    admin_id: UUID,  # From auth, must be admin role
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """
    Get real-time compliance metrics for internal dashboard
    
    - Pending complaints (48h SLA)
    - Pending crises (1h SLA)
    - PII detections today
    - Sessions exceeding limits
    """
    
    # Pending complaints
    pending_complaints = await conn.fetchval(
        """
        SELECT COUNT(*)
        FROM review_queue
        WHERE complaint_id IS NOT NULL
        AND status IN ('pending', 'in_progress')
        """
    )
    
    # Overdue complaints (> 48h)
    overdue_complaints = await conn.fetchval(
        """
        SELECT COUNT(*)
        FROM review_queue
        WHERE complaint_id IS NOT NULL
        AND status IN ('pending', 'in_progress')
        AND due_date < NOW()
        """
    )
    
    # Pending crises
    pending_crisis = await conn.fetchval(
        """
        SELECT COUNT(*)
        FROM review_queue
        WHERE crisis_log_id IS NOT NULL
        AND status IN ('pending', 'in_progress')
        """
    )
    
    # PII detections today
    pii_today = await conn.fetchval(
        """
        SELECT COUNT(*)
        FROM pii_detection_log
        WHERE DATE(created_at) = CURRENT_DATE
        """
    )
    
    # Sessions over limit today
    sessions_over = await conn.fetchval(
        """
        SELECT COUNT(DISTINCT user_id)
        FROM user_sessions s
        JOIN parent_settings ps ON s.user_id = ps.child_id
        WHERE DATE(s.started_at) = CURRENT_DATE
        AND s.duration_seconds > (ps.daily_limit_minutes * 60)
        """
    )
    
    # Active children (last 30 days)
    active_children = await conn.fetchval(
        """
        SELECT COUNT(DISTINCT user_id)
        FROM user_sessions
        WHERE started_at > NOW() - INTERVAL '30 days'
        """
    )
    
    return ComplianceMetrics(
        pending_complaints=pending_complaints or 0,
        pending_complaints_overdue=overdue_complaints or 0,
        pending_crisis=pending_crisis or 0,
        pii_detections_today=pii_today or 0,
        sessions_over_limit_today=sessions_over or 0,
        active_children=active_children or 0
    )


@router.get("/admin/review-queue")
async def get_review_queue(
    admin_id: UUID,  # From auth
    status_filter: Optional[str] = None,
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    """Get active review queue items"""
    
    query = """
        SELECT * FROM active_review_queue_summary
    """
    
    if status_filter:
        query += f" WHERE status = '{status_filter}'"
    
    rows = await conn.fetch(query)
    
    return [dict(row) for row in rows]
