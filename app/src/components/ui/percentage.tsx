import React from "react";
import { cn } from "@/lib/utils";

// ============================================
// PERCENTAGE FORMATTER COMPONENT
// ============================================

interface PercentageProps {
  value: number;
  className?: string;
  decimals?: number;
  showSign?: boolean;
}

const Percentage: React.FC<PercentageProps> = ({ 
  value, 
  className,
  decimals = 2,
  showSign = false
}) => {
  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: showSign ? "exceptZero" : "auto",
  }).format(value / 100);

  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formattedValue}
    </span>
  );
};

export default Percentage;
