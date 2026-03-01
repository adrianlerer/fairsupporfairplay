/**
 * Compliance API Client
 * Connects to FastAPI backend endpoints for child rights compliance
 * BASE_URL should point to your FastAPI server (e.g., http://localhost:8000)
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================================================
// CHILD ENDPOINTS
// ============================================================================

/**
 * Child reports a problem
 * @param {number} childId - Child's user ID
 * @param {string} category - 'technical' | 'content' | 'privacy' | 'other'
 * @param {string} description - Problem description
 * @returns {Promise<{complaint_id: number, status: string, message: string, sla_hours: number}>}
 */
export async function reportProblem(childId, category, description) {
  return fetchAPI('/api/compliance/child/report-problem', {
    method: 'POST',
    body: JSON.stringify({ child_id: childId, category, description }),
  });
}

/**
 * Get all complaints for a child
 * @param {number} childId - Child's user ID
 * @returns {Promise<Array<{id: number, category: string, description: string, status: string, created_at: string, resolved_at: string}>>}
 */
export async function getMyComplaints(childId) {
  return fetchAPI(`/api/compliance/child/my-complaints?child_id=${childId}`);
}

/**
 * Check child's session usage and remaining time
 * @param {number} childId - Child's user ID
 * @returns {Promise<{child_id: number, total_minutes_today: number, daily_limit_minutes: number, remaining_minutes: number, exceeded_limit: boolean, can_continue: boolean}>}
 */
export async function getSessionUsage(childId) {
  return fetchAPI(`/api/compliance/child/session-usage?child_id=${childId}`);
}

/**
 * Start a new session for the child
 * @param {number} childId - Child's user ID
 * @returns {Promise<{session_id: number, remaining_minutes: number} | {error: string}>}
 */
export async function startSession(childId) {
  return fetchAPI('/api/compliance/child/start-session', {
    method: 'POST',
    body: JSON.stringify({ child_id: childId }),
  });
}

/**
 * End an active session
 * @param {number} sessionId - Session ID
 * @returns {Promise<{session_id: number, duration_minutes: number, daily_total_minutes: number, daily_limit_minutes: number, exceeded_limit: boolean}>}
 */
export async function endSession(sessionId) {
  return fetchAPI(`/api/compliance/child/end-session/${sessionId}`, {
    method: 'POST',
  });
}

/**
 * Check if text contains crisis keywords
 * @param {string} text - Text to analyze
 * @returns {Promise<{crisis_detected: boolean, keywords?: string[], severity?: string, resources?: object} | {crisis_detected: false}>}
 */
export async function checkCrisis(text) {
  return fetchAPI('/api/compliance/child/check-crisis', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// ============================================================================
// PARENT ENDPOINTS
// ============================================================================

/**
 * Get child's activity summary (parent view)
 * @param {number} parentId - Parent's user ID
 * @param {number} childId - Child's user ID
 * @returns {Promise<{child_id: number, usage_today_minutes: number, daily_limit_minutes: number, remaining_minutes: number, pending_complaints: number, crisis_alerts_7days: number, settings: object}>}
 */
export async function getChildSummary(parentId, childId) {
  return fetchAPI(`/api/compliance/parent/settings/${childId}?parent_id=${parentId}`);
}

/**
 * Update parent settings for a child
 * @param {number} parentId - Parent's user ID
 * @param {number} childId - Child's user ID
 * @param {object} updates - Settings to update (daily_time_limit_minutes, crisis_notifications, etc.)
 * @returns {Promise<{success: boolean, updated_fields: string[]}>}
 */
export async function updateParentSettings(parentId, childId, updates) {
  return fetchAPI(`/api/compliance/parent/settings/${childId}`, {
    method: 'PATCH',
    body: JSON.stringify({ parent_id: parentId, ...updates }),
  });
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * Get system-wide compliance metrics
 * @returns {Promise<{pending_complaints: number, crisis_alerts_24h: number, exceeded_sessions_today: number, pii_detections_7days: number, timestamp: string}>}
 */
export async function getAdminMetrics() {
  return fetchAPI('/api/compliance/admin/metrics');
}

/**
 * Get review queue items
 * @returns {Promise<Array<{id: number, complaint_id: number, priority: string, sla_deadline: string, status: string, created_at: string}>>}
 */
export async function getReviewQueue() {
  return fetchAPI('/api/compliance/admin/review-queue');
}

// ============================================================================
// CRISIS RESOURCES (static data)
// ============================================================================

export const CRISIS_RESOURCES = {
  suicide_prevention: {
    name: 'Centro de Asistencia al Suicida (CAS)',
    phone: '135',
    available: '24/7',
    description: 'Línea gratuita de prevención del suicidio en Argentina',
  },
  child_abuse: {
    name: 'Línea 102 - Derechos de Niños, Niñas y Adolescentes',
    phone: '102',
    available: '24/7',
    description: 'Atención especializada para situaciones de maltrato, abuso o vulneración de derechos',
  },
};
