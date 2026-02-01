"use client";

import { motion } from "framer-motion";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import Price from "./price";
import NumberFormatter from "./number";

// ============================================
// TYPES
// ============================================

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "right";
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  side: "bid" | "ask";
  classnames?: string;
}

// ============================================
// DEPTH BAR COMPONENT
// ============================================

const DepthBar = ({ percentage, side }: { percentage: number; side: "bid" | "ask" }) => (
  <div className="absolute inset-0 p-0 overflow-hidden pointer-events-none">
    <motion.div
      className={`absolute inset-y-0 opacity-[0.12] ${
        side === "bid" ? "bg-emerald-500" : "bg-red-500"
      } right-0`}
      style={{ width: `${percentage}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  </div>
);

// ============================================
// ROW STATS OVERLAY
// ============================================

const RowStatsOverlay = ({
  avgPrice,
  totalVolume,
  totalAmount,
  side
}: {
  avgPrice: number;
  totalVolume: number;
  totalAmount: number;
  side: "bid" | "ask";
}) => (
  <div className="overlay-content absolute right-0 top-0 translate-x-full opacity-95 z-50">
    <div className={`relative p-3 text-xs rounded-sm border ${
      side === "bid" 
        ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-100" 
        : "bg-red-950/90 border-red-500/30 text-red-100"
    }`}>
      {/* Arrow */}
      <div className={`absolute left-[-5px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent ${
        side === "bid"
          ? "border-r-[5px] border-r-emerald-950/90"
          : "border-r-[5px] border-r-red-950/90"
      }`} />
      
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-2xs uppercase">Avg Price</span>
          <Price value={avgPrice} className="ml-3 font-mono font-semibold" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-2xs uppercase">Sum (USD)</span>
          <NumberFormatter className="ml-3 font-mono" value={totalVolume} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-2xs uppercase">Sum (BTC)</span>
          <NumberFormatter className="ml-3 font-mono" value={totalAmount} />
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// TABLE ROW COMPONENT
// ============================================

const TableRow = ({
  row,
  side,
  maxVolume,
  onHover,
  isSelected
}: {
  row: any;
  side: "bid" | "ask";
  maxVolume: number;
  onHover: () => void;
  isSelected: boolean;
}) => {
  const volume = (row.original as { volume: number }).volume;
  const percentage = maxVolume > 0 ? (volume / maxVolume) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={`relative group flex items-center py-[2px] ${
        isSelected 
          ? side === "bid" 
            ? "bg-emerald-500/10" 
            : "bg-red-500/10"
          : "hover:bg-secondary/30"
      } transition-colors cursor-pointer`}
      data-state={isSelected ? "selected" : undefined}
      onMouseEnter={onHover}
    >
      {row.getVisibleCells().map((cell: any) => {
        const isPriceColumn = cell.column.id === "price";
        const alignment = cell.column.columnDef.meta?.align || "left";

        return (
          <div
            className={`relative z-10 text-2xs px-2 py-[2px] flex-1 ${
              alignment === "right" ? "text-right" : "text-left"
            } ${
              isPriceColumn
                ? side === "bid"
                  ? "text-emerald-400 font-semibold"
                  : "text-red-400 font-semibold"
                : "text-foreground/80"
            }`}
            key={cell.id}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        );
      })}
      <DepthBar percentage={percentage} side={side} />
    </motion.div>
  );
};

// ============================================
// MAIN DATA TABLE
// ============================================

const DataTable = <TData, TValue>({
  columns,
  data,
  side,
  classnames,
}: DataTableProps<TData, TValue>) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const maxVolume = useMemo(
    () => Math.max(...data.map((row) => (row as { volume: number }).volume)),
    [data]
  );

  const table = useReactTable({
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    data,
    columns,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  const handleRowHover = (hoveredRowIndex: number) => {
    const newSelection = rows.reduce<RowSelectionState>((acc, row, index) => {
      if (
        (side === "ask" && index >= hoveredRowIndex) ||
        (side === "bid" && index <= hoveredRowIndex)
      ) {
        acc[row.id] = true;
      }
      return acc;
    }, {});
    setRowSelection(newSelection);
  };

  const handleMouseLeave = () => setRowSelection({});

  const selectedRowStats = useMemo(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const totalVolume = selectedRows.reduce(
      (sum, row) => sum + (row.original as { total: number }).total,
      0
    );
    const totalAmount = selectedRows.reduce(
      (sum, row) => sum + (row.original as { size: number }).size,
      0
    );
    const avgPrice =
      selectedRows.length > 0
        ? selectedRows.reduce(
            (sum, row) => sum + (row.original as { price: number }).price,
            0
          ) / selectedRows.length
        : 0;

    return { totalVolume, totalAmount, avgPrice };
  }, [table]);

  const hasSelection = Object.keys(rowSelection).length > 0;

  return (
    <div className={`relative ${classnames}`}>
      <div 
        className="orderbook-table-list relative" 
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col">
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                row={row}
                side={side}
                maxVolume={maxVolume}
                onHover={() => handleRowHover(row.index)}
                isSelected={row.getIsSelected()}
              />
            ))
          ) : (
            <div className="flex justify-center items-center h-24">
              <span className="text-xs text-muted-foreground">
                No orders available
              </span>
            </div>
          )}
        </div>
      </div>

      {hasSelection && (
        <RowStatsOverlay
          avgPrice={selectedRowStats.avgPrice}
          totalVolume={selectedRowStats.totalVolume}
          totalAmount={selectedRowStats.totalAmount}
          side={side}
        />
      )}
    </div>
  );
};

export default DataTable;
