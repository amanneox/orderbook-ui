import { memo } from "react";
import { motion } from "framer-motion";

// ============================================
// ORDERBOOK RATIO COMPONENT
// ============================================

interface OrderbookRatioProps {
  buyRatio: number;
  sellRatio: number;
}

const OrderbookRatio: React.FC<OrderbookRatioProps> = memo(
  ({ buyRatio, sellRatio }) => {
    // Clamp values between 0 and 100
    const clampedBuy = Math.max(0, Math.min(100, buyRatio));
    const clampedSell = Math.max(0, Math.min(100, sellRatio));

    return (
      <div className="w-full">
        {/* Progress Bar */}
        <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
          {/* Buy Segment (Left) */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${clampedBuy}%` }}
            transition={{ 
              duration: 0.5, 
              ease: [0.4, 0, 0.2, 1]
            }}
          />
          
          {/* Sell Segment (Right) */}
          <motion.div
            className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-600 to-red-400"
            initial={{ width: 0 }}
            animate={{ width: `${clampedSell}%` }}
            transition={{ 
              duration: 0.5, 
              ease: [0.4, 0, 0.2, 1]
            }}
          />
          
          {/* Center Indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-background" />
        </div>
        
        {/* Labels */}
        <div className="flex justify-between items-center mt-1.5">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-2xs font-medium text-emerald-400 tabular-nums">
              {clampedBuy.toFixed(1)}%
            </span>
            <span className="text-2xs text-muted-foreground">Buy</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-2xs text-muted-foreground">Sell</span>
            <span className="text-2xs font-medium text-red-400 tabular-nums">
              {clampedSell.toFixed(1)}%
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    );
  }
);

OrderbookRatio.displayName = "OrderbookRatio";

export default OrderbookRatio;
