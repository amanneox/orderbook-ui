import { FC, memo } from "react";
import DataTable from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import OrderbookRatio from "../ui/orderbook-ratio";
import { ArrowUp, ArrowDown, Settings2 } from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface OrderbookColumn {
  id: string;
  price: number;
  size: number;
  total: number;
  volume: number;
}

interface OrderbookProperties {
  markProperties: {
    price: number;
    status: boolean;
  };
  ratios: {
    buy: number;
    sell: number;
  };
  spread: {
    name: string;
    value: number;
  };
  ticker: string;
  granularity: {
    current: number;
    range: number[];
  };
}

interface OrderbookContainerProps {
  data: OrderbookColumn[];
  columns: ColumnDef<OrderbookColumn>[];
  properties: OrderbookProperties;
}

// ============================================
// HEADER COMPONENT
// ============================================

const OrderbookHeader = ({ granularity }: { granularity: { current: number; range: number[] } }) => (
  <div className="shrink-0 space-y-2 p-3 border-b border-border/50 bg-gradient-to-b from-card to-card/50">
    {/* Title Row */}
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">
          Order Book
        </span>
        <span className="text-2xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm">
          L2
        </span>
      </div>
      <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
        <Settings2 size={14} />
      </button>
    </div>

    {/* Controls Row */}
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-2xs text-muted-foreground uppercase">Tick</span>
        <Select value={granularity.current.toString()} onValueChange={() => { }}>
          <SelectTrigger className="h-6 w-[70px] text-2xs bg-secondary/50 border-border text-foreground hover:border-primary/50 transition-colors">
            <SelectValue placeholder={granularity.current} />
          </SelectTrigger>
          <SelectContent>
            {granularity.range.map((value) => (
              <SelectItem key={value} value={value.toString()} className="text-2xs">
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

// ============================================
// TABLE HEADER
// ============================================

const TableHeader = () => (
  <div className="grid grid-cols-3 px-3 py-2 bg-secondary/30 text-2xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
    <div className="text-left">Price</div>
    <div className="text-right">Size</div>
    <div className="text-right">Total</div>
  </div>
);

// ============================================
// MARK PRICE DISPLAY
// ============================================

const MarkPriceDisplay = ({ price, isUp }: { price: number; isUp: boolean }) => (
  <div className="shrink-0 py-2 border-y border-border bg-gradient-to-r from-card via-secondary/20 to-card">
    <div className="flex items-center justify-center gap-3">
      <div className={`flex items-center gap-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        <span className="text-lg font-display font-bold tabular-nums">
          {price.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-2xs text-muted-foreground">Mark Price</span>
        <span className={`text-2xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? '+' : ''}0.12%
        </span>
      </div>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const OrderbookContainer: FC<OrderbookContainerProps> = memo(
  ({ data, columns, properties }) => {
    // Split data into asks and bids
    const midIndex = Math.floor(data.length / 2);
    const asks = data.slice(0, midIndex).reverse(); // Reverse for display order
    const bids = data.slice(midIndex);

    return (
      <div className="flex flex-col h-full w-full bg-card font-mono text-xs overflow-hidden">
        <OrderbookHeader granularity={properties.granularity} />

        {/* Asks (Sells) - Red */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col-reverse min-h-0 fancy-scrollbar">
          <TableHeader />
          <DataTable
            classnames="text-2xs w-full"
            side="ask"
            columns={columns}
            data={asks}
          />
        </div>

        {/* Mark Price */}
        <MarkPriceDisplay 
          price={properties.markProperties.price} 
          isUp={properties.markProperties.status} 
        />

        {/* Bids (Buys) - Green */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 fancy-scrollbar">
          <DataTable
            classnames="text-2xs w-full"
            side="bid"
            columns={columns}
            data={bids}
          />
        </div>

        {/* Buy/Sell Ratio Bar */}
        <div className="shrink-0 p-3 border-t border-border/50 bg-gradient-to-b from-card/50 to-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs text-emerald-400 font-medium">
              {(properties.ratios.buy).toFixed(1)}% Buy
            </span>
            <span className="text-2xs text-red-400 font-medium">
              {(properties.ratios.sell).toFixed(1)}% Sell
            </span>
          </div>
          <OrderbookRatio
            buyRatio={properties.ratios.buy}
            sellRatio={properties.ratios.sell}
          />
        </div>
      </div>
    );
  }
);

OrderbookContainer.displayName = "OrderbookContainer";

export default OrderbookContainer;
