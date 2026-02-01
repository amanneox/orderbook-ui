import React from "react";
import { Button } from "../ui/button";
interface OrderbookFilterProps {
  filter: "all" | "bid" | "ask";
  setFilter: React.Dispatch<React.SetStateAction<"all" | "bid" | "ask">>;
}
const OrderbookFilter: React.FC<OrderbookFilterProps> = ({
  filter,
  setFilter,
}) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={() => setFilter("all")}
        className={`btn ${filter === "all" ? "btn-active" : ""}`}
        data-state={filter === "all" ? "active" : "inactive"}
      >
        All
      </Button>
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={() => setFilter("bid")}
        className={`btn ${filter === "bid" ? "btn-active" : ""}`}
        data-state={filter === "bid" ? "active" : "inactive"}
      >
        Bid
      </Button>
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={() => setFilter("ask")}
        className={`btn ${filter === "ask" ? "btn-active" : ""}`}
        data-state={filter === "ask" ? "active" : "inactive"}
      >
        Ask
      </Button>
    </div>
  );
};

export default OrderbookFilter;
