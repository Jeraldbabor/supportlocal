import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = () => {
    // Only run in browser environment
    if (typeof document === 'undefined') {
        return;
    }

    // Force light mode always - ignore any appearance setting
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

export function initializeTheme() {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    // Force light mode - ignore saved appearance
    applyTheme();

    // Set appearance to light in localStorage to prevent future dark mode
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('appearance', 'light');
    }
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = useCallback((_mode: Appearance) => {
        // Always force light mode regardless of what mode is requested
        const forcedMode: Appearance = 'light';
        setAppearance(forcedMode);

        // Store in localStorage for client-side persistence - always light
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('appearance', forcedMode);
        }

        // Store in cookie for SSR - always light
        setCookie('appearance', forcedMode);

        applyTheme();
    }, []);

    useEffect(() => {
        // Force light mode - ignore saved appearance
        updateAppearance('light');
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
