// Wayfinder utility functions for route handling

export type RouteQueryOptions = {
    query?: Record<string, string | number | boolean | undefined>;
    mergeQuery?: Record<string, string | number | boolean | undefined>;
} & Record<string, string | number | boolean | undefined>;

export type RouteDefinition<T = string> = {
    url: string;
    method?: T;
    methods?: readonly string[];
};

export type RouteFormDefinition<T = string> = {
    action: string;
    method: T;
    form?: HTMLFormElement | FormData | Record<string, unknown>;
};

/**
 * Convert route options to query string
 */
export const queryParams = (options?: RouteQueryOptions): string => {
    if (!options || Object.keys(options).length === 0) {
        return '';
    }

    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && typeof value !== 'object') {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
};

/**
 * Apply default URL parameters
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyUrlDefaults = (args: any, defaults?: Record<string, unknown>): any => {
    // If args is a string (URL), apply defaults to URL
    if (typeof args === 'string') {
        if (!defaults) return args;

        let finalUrl = args;
        Object.entries(defaults).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            if (finalUrl.includes(placeholder)) {
                finalUrl = finalUrl.replace(placeholder, String(value));
            }
        });

        return finalUrl;
    }

    // If args is an object, return it as-is (for backward compatibility)
    return args;
};
