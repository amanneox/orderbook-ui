import { FC } from "react";
import { ColumnDef, flexRender } from "@tanstack/react-table";

interface OrderbookHeaderProps<T> {
  columns: ColumnDef<T>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OrderbookHeader: FC<OrderbookHeaderProps<any>> = ({ columns }) => {
  return (
    <div className="orderbook-header border px-2 py-1 bg-zinc-900">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: columns.map(() => "1fr").join(" "), // Match column widths
        }}
      >
        {columns.map((col, index) => (
          <div
            key={index}
            className={`text-xs tracking-wide font-semibold text-zinc-300 ${col.meta?.align ? `text-${col.meta.align}` : ""
              }`}
          >
            {typeof col.header === "function"
              ? flexRender(col.header, {
                column: {},
                header: {},
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any)
              : col.header}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderbookHeader;
