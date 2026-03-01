#!/bin/bash
# ===================================================================
# Apply Compliance Schema to Database
# ===================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Fair Support Fair Play${NC}"
echo -e "${GREEN}Compliance Schema Migration${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}DATABASE_URL not set. Checking .env file...${NC}"
    
    if [ -f "../../.env" ]; then
        export $(cat ../../.env | grep DATABASE_URL | xargs)
    elif [ -f ".env" ]; then
        export $(cat .env | grep DATABASE_URL | xargs)
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}ERROR: DATABASE_URL not found${NC}"
        echo "Please set DATABASE_URL environment variable or create .env file"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Database URL found${NC}"
echo ""

# Extract connection params from DATABASE_URL
# Format: postgresql://user:password@host:port/dbname
PGUSER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
PGHOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
PGPORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
PGDATABASE=$(echo $DATABASE_URL | sed -n 's/.*\/\(.*\)/\1/p')

export PGUSER PGPASSWORD PGHOST PGPORT PGDATABASE

echo "Database: $PGDATABASE"
echo "Host: $PGHOST:$PGPORT"
echo "User: $PGUSER"
echo ""

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
if psql -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    echo "Please check your DATABASE_URL and database status"
    exit 1
fi
echo ""

# Backup existing schema
echo -e "${YELLOW}Creating backup of current schema...${NC}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump --schema-only > "$BACKUP_FILE" 2>/dev/null || true
if [ -f "$BACKUP_FILE" ]; then
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ Backup skipped (optional)${NC}"
fi
echo ""

# Apply schema_admin.sql first (if not already applied)
echo -e "${YELLOW}Checking admin schema...${NC}"
if psql -c "\dt users" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Admin schema already exists${NC}"
else
    echo -e "${YELLOW}Applying admin schema...${NC}"
    psql -f schema_admin.sql
    echo -e "${GREEN}✓ Admin schema applied${NC}"
fi
echo ""

# Apply compliance schema
echo -e "${YELLOW}Applying compliance schema...${NC}"
echo "This will create the following tables:"
echo "  - complaint_log (child complaints)"
echo "  - review_queue (48h/1h SLA tracking)"
echo "  - crisis_log (crisis detections)"
echo "  - user_sessions (time limits)"
echo "  - parent_settings (parental controls)"
echo "  - pii_detection_log (GDPR Art. 9)"
echo "  - parental_consents (COPPA compliance)"
echo "  - consent_audit_log (accountability)"
echo "  - data_deletion_requests (GDPR Art. 17)"
echo "  - compliance_metrics (daily aggregates)"
echo ""

# Apply the schema
if psql -f schema_compliance.sql; then
    echo -e "${GREEN}✓ Compliance schema applied successfully${NC}"
else
    echo -e "${RED}✗ Schema application failed${NC}"
    exit 1
fi
echo ""

# Verify tables were created
echo -e "${YELLOW}Verifying table creation...${NC}"
EXPECTED_TABLES=(
    "complaint_log"
    "review_queue"
    "crisis_log"
    "user_sessions"
    "parent_settings"
    "pii_detection_log"
    "parental_consents"
    "consent_audit_log"
    "data_deletion_requests"
    "compliance_metrics"
)

ALL_CREATED=true
for table in "${EXPECTED_TABLES[@]}"; do
    if psql -c "\dt $table" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ $table${NC}"
    else
        echo -e "${RED}  ✗ $table (not found)${NC}"
        ALL_CREATED=false
    fi
done
echo ""

if [ "$ALL_CREATED" = true ]; then
    echo -e "${GREEN}===================================${NC}"
    echo -e "${GREEN}✓ All compliance tables created${NC}"
    echo -e "${GREEN}===================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run seed_compliance_demo_data.sql for test data"
    echo "2. Update backend API to use these tables"
    echo "3. Test compliance endpoints"
else
    echo -e "${RED}===================================${NC}"
    echo -e "${RED}✗ Some tables failed to create${NC}"
    echo -e "${RED}===================================${NC}"
    exit 1
fi
