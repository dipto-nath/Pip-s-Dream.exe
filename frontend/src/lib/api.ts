// =============================================================
// PIP.EXE — API Client
// Thin wrapper around fetch() with error handling and timeout.
// =============================================================

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const REQUEST_TIMEOUT_MS = 8000;

async function apiRequest<T>(
  path: string,
  opts: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const signal = opts.signal ?? controller.signal;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: opts.method ?? 'GET',
      headers: opts.body != null ? { 'Content-Type': 'application/json' } : {},
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
      signal,
    });

    let parsed: unknown;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      parsed = await response.json();
    } else {
      parsed = { success: false, error: 'Unexpected response format.' };
    }

    const result = (parsed ?? {}) as ApiResponse<T>;
    if (!response.ok && !result.success) {
      result.status = response.status;
    }
    return { ...result, status: result.status ?? response.status };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: 'Request timed out.', status: 408 };
    }
    return { success: false, error: 'Network error — Pip can\'t reach the dream mailbox.', status: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

export { apiRequest, API_BASE };
