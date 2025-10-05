/**
 * Format currency in Philippine Pesos
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, options: { 
    showSymbol?: boolean;
    decimals?: number;
} = {}): string {
    const { showSymbol = true, decimals = 2 } = options;
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
        return showSymbol ? '₱0.00' : '0.00';
    }
    
    const formatted = numericAmount.toFixed(decimals);
    return showSymbol ? `₱${formatted}` : formatted;
}

/**
 * Convert USD to PHP (approximate rate)
 * @param usdAmount - Amount in USD
 * @param rate - Exchange rate (default: 56)
 * @returns Amount in PHP
 */
export function convertUsdToPhp(usdAmount: number, rate: number = 56): number {
    return usdAmount * rate;
}

/**
 * Format Philippine Peso with proper thousands separators
 * @param amount - The amount to format
 * @returns Formatted currency string with commas
 */
export function formatPesoWithCommas(amount: number | string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
        return '₱0.00';
    }
    
    return `₱${numericAmount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

/**
 * Alias for formatCurrency for backward compatibility
 * @param amount - The amount to format
 * @returns Formatted peso currency string
 */
export function formatPeso(amount: number | string): string {
    return formatCurrency(amount);
}