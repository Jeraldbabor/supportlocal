import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    // Force light mode always - ignore appearance setting
    const isDark = false;

    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    // Force light mode - ignore saved appearance
    applyTheme('light');
    
    // Set appearance to light in localStorage to prevent future dark mode
    localStorage.setItem('appearance', 'light');

    // Don't listen to system theme changes - we always want light mode
    // mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = useCallback((mode: Appearance) => {
        // Always force light mode regardless of what mode is requested
        const forcedMode: Appearance = 'light';
        setAppearance(forcedMode);

        // Store in localStorage for client-side persistence - always light
        localStorage.setItem('appearance', forcedMode);

        // Store in cookie for SSR - always light
        setCookie('appearance', forcedMode);

        applyTheme(forcedMode);
    }, []);

    useEffect(() => {
        // Force light mode - ignore saved appearance
        updateAppearance('light');

        // Don't listen to system theme changes
        // return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
