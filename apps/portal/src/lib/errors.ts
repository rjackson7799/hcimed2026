interface ClassifiedError {
  userMessage: string;
  code: string;
  isRateLimit: boolean;
  isNetworkError: boolean;
  isAuthError: boolean;
  isTimeout: boolean;
}

export function classifyError(err: unknown): ClassifiedError {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return {
      userMessage: 'Request timed out — please check your connection and try again.',
      code: 'TIMEOUT',
      isRateLimit: false,
      isNetworkError: false,
      isAuthError: false,
      isTimeout: true,
    };
  }

  if (err instanceof TypeError && err.message.includes('fetch')) {
    return {
      userMessage: 'Unable to reach the server. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      isRateLimit: false,
      isNetworkError: true,
      isAuthError: false,
      isTimeout: false,
    };
  }

  if (err && typeof err === 'object') {
    const e = err as { code?: string; message?: string; status?: number };

    if (e.code === 'over_request_rate_limit' || e.status === 429) {
      return {
        userMessage: 'Too many requests — please wait a moment and try again.',
        code: 'RATE_LIMIT',
        isRateLimit: true,
        isNetworkError: false,
        isAuthError: false,
        isTimeout: false,
      };
    }

    if (
      e.code === 'invalid_grant' ||
      e.code === 'token_expired' ||
      e.message?.includes('JWT') ||
      e.code === 'PGRST301'
    ) {
      return {
        userMessage: 'Your session has expired. Please sign in again.',
        code: 'AUTH_ERROR',
        isRateLimit: false,
        isNetworkError: false,
        isAuthError: true,
        isTimeout: false,
      };
    }

    if (e.code === '42501') {
      return {
        userMessage: 'You do not have permission to perform this action.',
        code: 'PERMISSION_DENIED',
        isRateLimit: false,
        isNetworkError: false,
        isAuthError: false,
        isTimeout: false,
      };
    }
  }

  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN',
    isRateLimit: false,
    isNetworkError: false,
    isAuthError: false,
    isTimeout: false,
  };
}
