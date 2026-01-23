/**
 * CSRF Token Utility
 * Handles CSRF token retrieval, refresh, and 419 error recovery
 */

// Get the current CSRF token from the meta tag
export function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

// Refresh the CSRF token by fetching a new one from the server
export async function refreshCsrfToken(): Promise<string> {
    try {
        const response = await fetch('/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'same-origin',
        });

        if (response.ok) {
            // After this request, Laravel will set a new CSRF token in cookies
            // We need to fetch any page to get the new token in the meta tag
            const pageResponse = await fetch(window.location.href, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'text/html',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (pageResponse.ok) {
                const html = await pageResponse.text();
                const match = html.match(/<meta name="csrf-token" content="([^"]+)"/);
                if (match && match[1]) {
                    // Update the meta tag in the current document
                    const metaTag = document.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', match[1]);
                    }
                    return match[1];
                }
            }
        }
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
    }

    return getCsrfToken();
}

// Options for fetch with CSRF
interface FetchWithCsrfOptions extends RequestInit {
    maxRetries?: number;
}

/**
 * Fetch wrapper that handles CSRF tokens and 419 errors with automatic retry
 */
export async function fetchWithCsrf(
    url: string,
    options: FetchWithCsrfOptions = {}
): Promise<Response> {
    const { maxRetries = 1, ...fetchOptions } = options;

    const makeRequest = async (retryCount: number): Promise<Response> => {
        const headers = new Headers(fetchOptions.headers || {});
        headers.set('X-CSRF-TOKEN', getCsrfToken());

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            credentials: 'same-origin',
        });

        // Handle 419 CSRF token mismatch error
        if (response.status === 419 && retryCount < maxRetries) {
            console.warn(`CSRF token expired, refreshing and retrying... (attempt ${retryCount + 1})`);
            await refreshCsrfToken();
            return makeRequest(retryCount + 1);
        }

        return response;
    };

    return makeRequest(0);
}

/**
 * Simple POST request with CSRF token and automatic retry
 */
export async function postWithCsrf(
    url: string,
    body?: FormData | object | null,
    options: FetchWithCsrfOptions = {}
): Promise<Response> {
    const headers: Record<string, string> = {};
    let requestBody: FormData | string | undefined;

    if (body instanceof FormData) {
        requestBody = body;
    } else if (body) {
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
    }

    return fetchWithCsrf(url, {
        method: 'POST',
        headers: {
            ...headers,
            ...(options.headers as Record<string, string>),
        },
        body: requestBody,
        ...options,
    });
}
