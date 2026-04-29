/**
 * Catch 401s from same-origin /api/admin/* (or admin web) calls and redirect
 * the user to the appropriate login, remembering where they were so we can
 * send them back after they sign in.
 *
 *  - Public site is unaffected (the guard only fires when the user is currently
 *    inside /admin or /helpdesk).
 *  - Intent is stashed in sessionStorage; the login page reads it and submits
 *    it alongside credentials. The server validates the URL is same-origin and
 *    points to the right area before honoring it.
 */

const INTENT_KEY = 'auth:intended_url';

/**
 * Wrap window.fetch once. Idempotent — calling again is a no-op.
 */
export function installAuthGuard() {
  if (typeof window === 'undefined' || window.__authGuardInstalled) return;
  window.__authGuardInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    if (response.status !== 401) return response;

    const requestUrl = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    if (!isSameOriginAdminFetch(requestUrl)) return response;

    const path = window.location.pathname;
    const search = window.location.search;

    // If we're already on a login page, let the page handle the 401 itself.
    if (path === '/admin/login' || path === '/helpdesk/login') return response;

    if (path.startsWith('/admin')) {
      stashIntent(path + search);
      window.location.href = '/admin/login';
    } else if (path.startsWith('/helpdesk')) {
      stashIntent(path + search);
      window.location.href = '/helpdesk/login';
    }

    return response;
  };
}

/**
 * Pull (and clear) the stashed intent. Returns null if nothing valid is stored.
 * Safe URLs only — same-origin paths starting with /admin or /helpdesk.
 */
export function consumeIntent() {
  try {
    const url = sessionStorage.getItem(INTENT_KEY);
    sessionStorage.removeItem(INTENT_KEY);
    return isSafeIntent(url) ? url : null;
  } catch {
    return null;
  }
}

function stashIntent(url) {
  try {
    if (isSafeIntent(url)) {
      sessionStorage.setItem(INTENT_KEY, url);
    }
  } catch {
    // sessionStorage might be disabled — fall through; the server-side
    // redirect path still works for full-reload navigations.
  }
}

function isSafeIntent(url) {
  return (
    typeof url === 'string' &&
    url.length > 0 &&
    url.length < 1000 &&
    url.startsWith('/') &&
    !url.startsWith('//') &&
    (url.startsWith('/admin') || url.startsWith('/helpdesk'))
  );
}

function isSameOriginAdminFetch(url) {
  if (!url) return false;

  // Relative path like /api/admin/... or /admin/...
  if (url.startsWith('/')) {
    return url.startsWith('/api/') || url.startsWith('/admin/') || url.startsWith('/helpdesk/');
  }

  // Absolute — only if same origin and admin/helpdesk path
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) return false;
    return (
      parsed.pathname.startsWith('/api/') ||
      parsed.pathname.startsWith('/admin/') ||
      parsed.pathname.startsWith('/helpdesk/')
    );
  } catch {
    return false;
  }
}
