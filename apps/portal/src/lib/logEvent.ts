type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'AUTH_TOKEN_REFRESH_FAILED'
  | 'SESSION_FORCED_LOGOUT'
  | 'SESSION_TIMEOUT'
  | 'PROFILE_FETCH_FAILED'
  | 'REQUEST_TIMEOUT';

export function logEvent(options: {
  action: AuditAction;
  email?: string;
  accessToken?: string;
  context?: Record<string, unknown>;
}): void {
  const { action, email, accessToken, context } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  fetch('/api/audit-log', {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify({ action, email, context }),
  })
    .catch(() => {
      // Audit log failure must never block the calling flow
    })
    .finally(() => clearTimeout(timeoutId));
}
