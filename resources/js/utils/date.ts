/**
 * Converts an ISO datetime string to yyyy-MM-dd format for HTML date inputs
 * @param dateString - ISO datetime string (e.g., "2002-12-11T00:00:00.000000Z")
 * @returns Date string in yyyy-MM-dd format or empty string if invalid
 */
export function formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch {
        // If it's already in yyyy-MM-dd format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        return '';
    }
}
