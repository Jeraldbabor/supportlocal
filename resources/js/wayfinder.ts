// Wayfinder utility functions for route handling

export type RouteQueryOptions = Record<string, any>;

export type RouteDefinition<T = string> = {
    url: string;
    method: T;
    methods?: readonly string[];
};

export type RouteFormDefinition<T = string> = {
    action: string;
    method: T;
    form?: any;
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