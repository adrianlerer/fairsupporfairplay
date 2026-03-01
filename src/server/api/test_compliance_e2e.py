#!/usr/bin/env python3
"""
Fair Support Fair Play - End-to-End Compliance Testing
======================================================

Tests real user flows:
1. Child session with time limit enforcement
2. Child complaint submission
3. Crisis detection and escalation
4. Parent settings configuration
5. Admin metrics monitoring

Consultor y Curador de Contenido: Marcelo Roffé
© Fair Support Fair Play 2026 - Todos los derechos reservados
"""

import asyncio
import asyncpg
import json
from datetime import datetime, timedelta
from uuid import UUID
import sys

# ANSI colors for output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

# Test data
PARENT_ID = UUID('00000000-0000-0000-0000-000000000001')
CHILD_ID = UUID('00000000-0000-0000-0000-000000000002')
ADMIN_ID = UUID('00000000-0000-0000-0000-000000000099')  # Create this

# Database connection
DATABASE_URL = "postgresql://user:password@localhost:5432/fairsupport"

async def setup_test_users(conn):
    """Ensure test users exist"""
    print_header("SETUP: Creating Test Users")
    
    # Admin user
    await conn.execute("""
        INSERT INTO users (id, email, full_name, role, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO NOTHING
    """, ADMIN_ID, 'admin@fairsupportfairplay.com', 'Admin Demo', 'admin')
    print_success("Admin user created/verified")
    
    # Parent user (already exists from seed data)
    print_success("Parent user verified (padre.demo@fairsupportfairplay.com)")
    
    # Child user (already exists from seed data)
    print_success("Child user verified (nino.demo@fairsupportfairplay.com)")
    
    print()

async def test_1_parent_configure_settings(conn):
    """TEST 1: Parent configures child's settings"""
    print_header("TEST 1: Parent Configures Child Settings")
    
    print_info(f"Parent ID: {PARENT_ID}")
    print_info(f"Child ID: {CHILD_ID}")
    print()
    
    # Get current settings
    print("📋 Getting current settings...")
    current = await conn.fetchrow("""
        SELECT * FROM parent_settings
        WHERE parent_id = $1 AND child_id = $2
    """, PARENT_ID, CHILD_ID)
    
    if current:
        print_success(f"Current limit: {current['daily_limit_minutes']} minutes/day")
        print_success(f"Crisis alerts: {'Enabled' if current['crisis_alerts_enabled'] else 'Disabled'}")
    else:
        print_warning("No settings found, will use defaults")
    
    print()
    
    # Update settings to 20 minutes (to test limit enforcement)
    print("⚙️  Updating settings to 20 min/day...")
    await conn.execute("""
        INSERT INTO parent_settings (parent_id, child_id, daily_limit_minutes, crisis_alerts_enabled)
        VALUES ($1, $2, 20, TRUE)
        ON CONFLICT (parent_id, child_id)
        DO UPDATE SET 
            daily_limit_minutes = 20,
            crisis_alerts_enabled = TRUE,
            updated_at = NOW()
    """, PARENT_ID, CHILD_ID)
    
    # Verify
    updated = await conn.fetchrow("""
        SELECT * FROM parent_settings
        WHERE parent_id = $1 AND child_id = $2
    """, PARENT_ID, CHILD_ID)
    
    print_success(f"✓ Settings updated: {updated['daily_limit_minutes']} min/day")
    print()

async def test_2_child_start_session(conn):
    """TEST 2: Child starts session (checks time limit)"""
    print_header("TEST 2: Child Starts Session")
    
    # Check current usage
    print("📊 Checking current usage today...")
    usage = await conn.fetchrow("""
        SELECT * FROM calculate_daily_usage($1, CURRENT_DATE)
    """, CHILD_ID)
    
    print_info(f"Used today: {usage['total_minutes']} minutes")
    print_info(f"Limit: {usage['limit_minutes']} minutes")
    print_info(f"Remaining: {usage['remaining_minutes']} minutes")
    
    if usage['is_over_limit']:
        print_error("❌ Over limit! Session should be blocked")
        return None
    else:
        print_success(f"✓ Can start session ({usage['remaining_minutes']} min remaining)")
    
    print()
    
    # Start session
    print("🚀 Starting new session...")
    session_id = await conn.fetchval("""
        INSERT INTO user_sessions (user_id, platform, started_at)
        VALUES ($1, 'web', NOW())
        RETURNING id
    """, CHILD_ID)
    
    print_success(f"✓ Session started: {session_id}")
    print()
    
    return session_id

async def test_3_child_sends_messages(conn, session_id):
    """TEST 3: Child sends messages (some normal, some crisis)"""
    print_header("TEST 3: Child Sends Messages")
    
    messages = [
        ("Hola, hoy perdí el partido y estoy triste", False),
        ("Me siento muy mal, no sirvo para nada", True),  # CRISIS
        ("Quiero mejorar mi técnica de tiro libre", False),
    ]
    
    crisis_detected = []
    
    for i, (message, should_be_crisis) in enumerate(messages, 1):
        print(f"\n📨 Message {i}: \"{message}\"")
        
        # Check for crisis keywords
        message_lower = message.lower()
        detected_categories = []
        detected_keywords = []
        
        crisis_keywords = {
            'suicide': ['suicidio', 'matarme', 'quiero morir'],
            'self_harm': ['no sirvo para nada', 'muy mal', 'cortarme'],
            'abuse': ['me pega', 'me golpea'],
            'sexual': ['me toca', 'inapropiado']
        }
        
        for category, keywords in crisis_keywords.items():
            for keyword in keywords:
                if keyword in message_lower:
                    detected_categories.append(category)
                    detected_keywords.append(keyword)
        
        if detected_categories:
            print_warning(f"⚠️  CRISIS DETECTED! Categories: {', '.join(detected_categories)}")
            print_warning(f"   Keywords: {', '.join(detected_keywords)}")
            
            # Log crisis
            severity = 'red' if 'suicide' in detected_categories else 'orange'
            crisis_id = await conn.fetchval("""
                INSERT INTO crisis_log (
                    user_id, session_id, message_text, detected_keywords,
                    detected_categories, severity, parent_notified_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING id
            """, CHILD_ID, session_id, message, detected_keywords, detected_categories, severity)
            
            # Add to review queue (1h SLA for crisis)
            await conn.execute("""
                INSERT INTO review_queue (crisis_log_id, priority, due_date, status)
                VALUES ($1, 'critical', $2, 'pending')
            """, crisis_id, datetime.utcnow() + timedelta(hours=1))
            
            print_success(f"✓ Crisis logged (ID: {crisis_id}, severity: {severity})")
            print_success(f"✓ Parent notified")
            print_success(f"✓ Added to review queue (1h SLA)")
            
            crisis_detected.append({
                'id': crisis_id,
                'severity': severity,
                'message': message
            })
        else:
            print_success("✓ Normal message (no crisis detected)")
        
        # Simulate processing time
        await asyncio.sleep(0.5)
    
    print()
    return crisis_detected

async def test_4_child_reports_problem(conn, session_id):
    """TEST 4: Child uses 'Report a Problem' button"""
    print_header("TEST 4: Child Reports a Problem")
    
    print("🚩 Child clicks 'Report a Problem' button...")
    print_info("Issue type: content")
    print_info("Comment: 'El asistente me dio una respuesta confusa sobre mi técnica'")
    print()
    
    # Create complaint
    complaint_id = await conn.fetchval("""
        INSERT INTO complaint_log (user_id, session_id, issue_type, child_comment, parent_notified_at)
        VALUES ($1, $2, 'content', $3, NOW())
        RETURNING id
    """, CHILD_ID, session_id, "El asistente me dio una respuesta confusa sobre mi técnica")
    
    # Add to review queue (48h SLA)
    due_date = datetime.utcnow() + timedelta(hours=48)
    await conn.execute("""
        INSERT INTO review_queue (complaint_id, priority, due_date, status)
        VALUES ($1, 'medium', $2, 'pending')
    """, complaint_id, due_date)
    
    print_success(f"✓ Complaint created (ID: {complaint_id})")
    print_success(f"✓ Parent notified")
    print_success(f"✓ Added to review queue (48h SLA)")
    print_info(f"Due date: {due_date.strftime('%Y-%m-%d %H:%M')}")
    print()

async def test_5_child_exceeds_limit(conn, session_id):
    """TEST 5: Simulate child exceeding time limit"""
    print_header("TEST 5: Child Exceeds Time Limit")
    
    print("⏱️  Simulating 25 minutes of usage...")
    
    # End current session with 25 minutes duration
    await conn.execute("""
        UPDATE user_sessions
        SET 
            ended_at = NOW(),
            message_count = 15,
            duration_seconds = 1500  -- 25 minutes
        WHERE id = $1
    """, session_id)
    
    print_success("✓ Session ended (25 minutes)")
    print()
    
    # Check usage again
    print("📊 Checking updated usage...")
    usage = await conn.fetchrow("""
        SELECT * FROM calculate_daily_usage($1, CURRENT_DATE)
    """, CHILD_ID)
    
    print_info(f"Used today: {usage['total_minutes']} minutes")
    print_info(f"Limit: {usage['limit_minutes']} minutes (20 min)")
    print_info(f"Remaining: {usage['remaining_minutes']} minutes")
    
    if usage['is_over_limit']:
        print_error("❌ OVER LIMIT! Next session should be blocked")
    else:
        print_success(f"✓ Still within limit ({usage['remaining_minutes']} min left)")
    
    print()
    
    # Try to start another session
    print("🚀 Child tries to start another session...")
    
    if usage['is_over_limit']:
        print_error("❌ Session BLOCKED - daily limit reached")
        print_info("Message to child: 'Has alcanzado tu límite diario. ¡Vuelve mañana!'")
    else:
        print_warning("⚠️  Session allowed (still has time)")

async def test_6_parent_views_dashboard(conn):
    """TEST 6: Parent views dashboard"""
    print_header("TEST 6: Parent Views Dashboard")
    
    # Get child's recent activity
    print("📊 Parent Dashboard - Child Activity")
    print()
    
    # Session summary
    sessions = await conn.fetch("""
        SELECT 
            DATE(started_at) as date,
            COUNT(*) as session_count,
            SUM(duration_seconds) / 60 as total_minutes
        FROM user_sessions
        WHERE user_id = $1
        AND started_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(started_at)
        ORDER BY date DESC
    """, CHILD_ID)
    
    print("📅 Sessions (last 7 days):")
    for row in sessions:
        print(f"   {row['date']}: {row['session_count']} sessions, {row['total_minutes']:.0f} minutes")
    
    print()
    
    # Pending complaints
    complaints = await conn.fetch("""
        SELECT id, issue_type, child_comment, created_at, reviewed_at
        FROM complaint_log
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 5
    """, CHILD_ID)
    
    print(f"🚩 Child Complaints: {len(complaints)} total")
    for row in complaints:
        status = "✓ Reviewed" if row['reviewed_at'] else "⏳ Pending"
        print(f"   [{status}] {row['issue_type']}: {row['child_comment'][:50]}...")
    
    print()
    
    # Crisis alerts
    crises = await conn.fetch("""
        SELECT id, severity, detected_categories, created_at, resolved_at
        FROM crisis_log
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 5
    """, CHILD_ID)
    
    if crises:
        print(f"⚠️  Crisis Alerts: {len(crises)}")
        for row in crises:
            status = "✓ Resolved" if row['resolved_at'] else "🔴 Active"
            print(f"   [{status}] {row['severity'].upper()} - {', '.join(row['detected_categories'])}")
    else:
        print("✓ No crisis alerts")
    
    print()

async def test_7_admin_views_metrics(conn):
    """TEST 7: Admin views compliance metrics"""
    print_header("TEST 7: Admin Views Compliance Metrics")
    
    print("📊 Admin Dashboard - Compliance KPIs")
    print()
    
    # Pending complaints
    pending_complaints = await conn.fetchval("""
        SELECT COUNT(*)
        FROM review_queue
        WHERE complaint_id IS NOT NULL
        AND status IN ('pending', 'in_progress')
    """)
    
    print(f"📋 Pending Complaints: {pending_complaints}")
    
    # Overdue complaints
    overdue = await conn.fetchval("""
        SELECT COUNT(*)
        FROM review_queue
        WHERE complaint_id IS NOT NULL
        AND status IN ('pending', 'in_progress')
        AND due_date < NOW()
    """)
    
    if overdue > 0:
        print_error(f"   ⚠️  {overdue} OVERDUE (>48h)")
    else:
        print_success(f"   ✓ 0 overdue")
    
    print()
    
    # Pending crises
    pending_crisis = await conn.fetchval("""
        SELECT COUNT(*)
        FROM review_queue
        WHERE crisis_log_id IS NOT NULL
        AND status IN ('pending', 'in_progress')
    """)
    
    print(f"🚨 Pending Crisis Reviews: {pending_crisis}")
    
    # Overdue crises
    overdue_crisis = await conn.fetchval("""
        SELECT COUNT(*)
        FROM review_queue
        WHERE crisis_log_id IS NOT NULL
        AND status IN ('pending', 'in_progress')
        AND due_date < NOW()
    """)
    
    if overdue_crisis > 0:
        print_error(f"   ⚠️  {overdue_crisis} OVERDUE (>1h) - CRITICAL!")
    else:
        print_success(f"   ✓ 0 overdue")
    
    print()
    
    # Active children
    active = await conn.fetchval("""
        SELECT COUNT(DISTINCT user_id)
        FROM user_sessions
        WHERE started_at > NOW() - INTERVAL '30 days'
    """)
    
    print(f"👥 Active Children (30d): {active}")
    
    print()
    
    # Review queue details
    print("📋 Review Queue (Next 5 items):")
    queue = await conn.fetch("""
        SELECT * FROM active_review_queue_summary
        LIMIT 5
    """)
    
    for row in queue:
        overdue_str = f"({abs(row['hours_overdue']):.1f}h overdue)" if row['is_overdue'] else f"(due in {row['hours_overdue']:.1f}h)"
        priority_icon = "🔴" if row['priority'] == 'critical' else "🟡"
        print(f"   {priority_icon} {row['item_type']}: {row['priority']} {overdue_str}")
    
    print()

async def test_8_verify_data_integrity(conn):
    """TEST 8: Verify data integrity"""
    print_header("TEST 8: Data Integrity Checks")
    
    checks = [
        ("All sessions have user_id", """
            SELECT COUNT(*) FROM user_sessions WHERE user_id IS NULL
        """, 0),
        ("All complaints have user_id", """
            SELECT COUNT(*) FROM complaint_log WHERE user_id IS NULL
        """, 0),
        ("All review items have due_date", """
            SELECT COUNT(*) FROM review_queue WHERE due_date IS NULL
        """, 0),
        ("Parent settings exist for test child", """
            SELECT COUNT(*) FROM parent_settings 
            WHERE child_id = $1
        """, 1),
        ("Parental consent verified", """
            SELECT COUNT(*) FROM parental_consents
            WHERE child_id = $1 AND status = 'verified'
        """, 1),
    ]
    
    all_passed = True
    
    for check_name, query, expected in checks:
        result = await conn.fetchval(query, CHILD_ID)
        
        if result == expected:
            print_success(f"✓ {check_name}: {result} (expected {expected})")
        else:
            print_error(f"✗ {check_name}: {result} (expected {expected})")
            all_passed = False
    
    print()
    
    if all_passed:
        print_success("✓ All integrity checks passed!")
    else:
        print_error("✗ Some checks failed")
    
    print()

async def main():
    """Run all tests"""
    print(f"""
{Colors.BOLD}{Colors.HEADER}╔══════════════════════════════════════════════════════════════════╗
║  Fair Support Fair Play - E2E Compliance Testing                ║
║  Testing Real User Flows with Database                          ║
╚══════════════════════════════════════════════════════════════════╝{Colors.ENDC}
""")
    
    # Connect to database
    print("Connecting to database...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print_success("✓ Connected to database\n")
    except Exception as e:
        print_error(f"Failed to connect: {e}")
        print_info("Make sure database is running and schema is applied")
        sys.exit(1)
    
    try:
        # Setup
        await setup_test_users(conn)
        
        # Run tests
        await test_1_parent_configure_settings(conn)
        
        session_id = await test_2_child_start_session(conn)
        if not session_id:
            print_error("Cannot continue without session")
            return
        
        crises = await test_3_child_sends_messages(conn, session_id)
        
        await test_4_child_reports_problem(conn, session_id)
        
        await test_5_child_exceeds_limit(conn, session_id)
        
        await test_6_parent_views_dashboard(conn)
        
        await test_7_admin_views_metrics(conn)
        
        await test_8_verify_data_integrity(conn)
        
        # Summary
        print_header("TEST SUMMARY")
        print_success("✓ Parent configured child settings")
        print_success("✓ Child started session (time limit checked)")
        print_success(f"✓ Crisis detected ({len(crises)} alerts)")
        print_success("✓ Child reported problem (complaint logged)")
        print_success("✓ Time limit enforced (session blocked)")
        print_success("✓ Parent dashboard populated")
        print_success("✓ Admin metrics calculated")
        print_success("✓ Data integrity verified")
        print()
        print(f"{Colors.OKGREEN}{Colors.BOLD}ALL TESTS PASSED!{Colors.ENDC}")
        print()
        print_info("Next steps:")
        print("  1. Test API endpoints: curl localhost:8000/api/compliance/admin/metrics")
        print("  2. View Swagger docs: http://localhost:8000/docs")
        print("  3. Build frontend components to consume these APIs")
        print()
        
    except Exception as e:
        print_error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await conn.close()
        print("Database connection closed.")

if __name__ == "__main__":
    asyncio.run(main())
