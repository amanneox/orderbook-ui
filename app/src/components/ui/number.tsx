import React from 'react';
import { cn } from "@/lib/utils";

// ============================================
// NUMBER FORMATTER COMPONENT
// ============================================

interface NumberFormatterProps {
    value: number;
    locale?: string;
    options?: Intl.NumberFormatOptions;
    className?: string;
    compact?: boolean;
    decimals?: number;
}

const NumberFormatter: React.FC<NumberFormatterProps> = ({ 
    value, 
    locale = 'en-US', 
    options = {}, 
    className,
    compact = false,
    decimals = 4
}) => {
    const defaultOptions: Intl.NumberFormatOptions = compact 
        ? { 
            notation: 'compact',
            maximumFractionDigits: 1 
        }
        : {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals,
        };

    const mergedOptions = { ...defaultOptions, ...options };
    const formattedNumber = new Intl.NumberFormat(locale, mergedOptions).format(value);

    return (
        <span className={cn("font-mono tabular-nums", className)}>
            {formattedNumber}
        </span>
    );
};

export default NumberFormatter;
