import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export function usePageLoading() {
    const { component, url } = usePage();
    const [isLoading, setIsLoading] = useState(false);
    const previousUrlRef = useRef<string>(url);
    const previousComponentRef = useRef<string | null>(component);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Skip on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            previousUrlRef.current = url;
            previousComponentRef.current = component;
            return;
        }

        // Check if URL or component changed (navigation occurred)
        const urlChanged = previousUrlRef.current !== url;
        const componentChanged = previousComponentRef.current !== component;

        if (urlChanged || componentChanged) {
            // Show loading after a short delay to avoid flickering on fast loads
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setIsLoading(true);

            timeoutRef.current = setTimeout(() => {
                // Only hide if component has actually loaded
                if (component) {
                    setIsLoading(false);
                }
            }, 100);

            previousUrlRef.current = url;
            previousComponentRef.current = component;
        } else if (component) {
            // Component is loaded, ensure loading is false
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setIsLoading(false);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [url, component]);

    // Also monitor for Inertia progress bar
    useEffect(() => {
        const checkProgressBar = () => {
            const progressBar = document.querySelector('.inertia-progress-bar') as HTMLElement;
            if (progressBar) {
                const isVisible =
                    progressBar.offsetHeight > 0 && progressBar.style.display !== 'none' && window.getComputedStyle(progressBar).opacity !== '0';

                if (isVisible && !isLoading) {
                    setIsLoading(true);
                } else if (!isVisible && isLoading && component) {
                    // Only hide if component is loaded
                    setTimeout(() => setIsLoading(false), 50);
                }
            }
        };

        const interval = setInterval(checkProgressBar, 100);
        return () => clearInterval(interval);
    }, [isLoading, component]);

    return isLoading;
}
