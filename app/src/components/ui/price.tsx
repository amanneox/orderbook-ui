import React from 'react';
import { cn } from "@/lib/utils";

// ============================================
// PRICE FORMATTER COMPONENT
// ============================================

interface PriceProps {
    value: number;
    className?: string;
    currency?: string;
    decimals?: number;
}

const Price: React.FC<PriceProps> = ({ 
    value, 
    className,
    currency = 'USD',
    decimals = 2
}) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: true,
    }).format(value);

    return (
        <span className={cn("font-mono tabular-nums", className)}>
            {formattedPrice}
        </span>
    );
};

export default Price;
