import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, DollarSign, Hash, Wallet, TrendingUp, TrendingDown } from "lucide-react";

type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";

const TabButton = ({
    active,
    onClick,
    side
}: {
    active: boolean;
    onClick: () => void;
    side: OrderSide;
}) => {
    const isBuy = side === "buy";
    return (
        <button
            onClick={onClick}
            className={`
                flex-1 py-3 px-4 font-display font-semibold text-xs uppercase tracking-wider
                transition-all duration-200 relative overflow-hidden
                ${active
                    ? isBuy
                        ? "bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500"
                        : "bg-red-500/10 text-red-400 border-b-2 border-red-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }
            `}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {isBuy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isBuy ? "Buy Long" : "Sell Short"}
            </span>
            {active && (
                <div className={`absolute inset-0 opacity-20 ${isBuy ? 'bg-emerald-500' : 'bg-red-500'}`} />
            )}
        </button>
    );
};

const OrderTypeButton = ({
    type,
    active,
    onClick
}: {
    type: OrderType;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`
            px-3 py-1.5 text-2xs font-medium uppercase tracking-wider rounded-sm
            transition-all duration-200
            ${active
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
            }
        `}
    >
        {type}
    </button>
);

const InputField = ({
    label,
    value,
    onChange,
    icon: Icon,
    placeholder,
    suffix,
    type = "number"
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: React.ElementType;
    placeholder: string;
    suffix?: string;
    type?: string;
}) => (
    <div className="space-y-1.5">
        <label className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-200">
                <Icon size={14} />
            </div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="
                    w-full bg-secondary/50 border border-border rounded-sm
                    pl-9 pr-12 py-2.5 
                    text-sm font-mono text-foreground 
                    placeholder:text-muted-foreground/30
                    focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
                    transition-all duration-200
                "
            />
            {suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-muted-foreground uppercase">
                    {suffix}
                </span>
            )}
        </div>
    </div>
);

const QuickSelectButton = ({
    label,
    onClick,
    active
}: {
    label: string;
    onClick: () => void;
    active?: boolean;
}) => (
    <button
        onClick={onClick}
        className={`
            px-2 py-1 text-2xs font-medium rounded-sm
            transition-all duration-200
            ${active
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }
        `}
    >
        {label}
    </button>
);

const InfoRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
    <div className="flex items-center justify-between py-1">
        <span className="text-2xs text-muted-foreground">{label}</span>
        <span className={`text-xs font-mono tabular-nums ${highlight ? 'text-primary font-semibold' : 'text-foreground'}`}>
            {value}
        </span>
    </div>
);

export function OrderForm() {
    const { token } = useAuth();
    const [amount, setAmount] = useState("");
    const [price, setPrice] = useState("");
    const [leverage, setLeverage] = useState("1");
    const [side, setSide] = useState<OrderSide>("buy");
    const [orderType, setOrderType] = useState<OrderType>("limit");
    const [loading, setLoading] = useState(false);

    const handleOrder = async () => {
        if (!token) {
            toast({
                title: "Authentication Required",
                description: "Please login to place orders",
                variant: "destructive"
            });
            return;
        }

        if (!amount || (orderType !== "market" && !price)) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        symbol: "BTC/USD",
                        side,
                        type: orderType,
                        price: orderType === "market" ? null : Number(price),
                        amount: Number(amount),
                        leverage: Number(leverage)
                    })
                }
            );

            if (res.ok) {
                toast({
                    title: "Order Placed",
                    description: `${side.toUpperCase()} order executed successfully`,
                });
                setAmount("");
            } else {
                toast({
                    title: "Order Failed",
                    description: "Failed to place order",
                    variant: "destructive"
                });
            }
        } catch (e) {
            toast({
                title: "Network Error",
                description: "Unable to connect to server",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const estimatedTotal = Number(price || 0) * Number(amount || 0);
    const isBuy = side === "buy";

    // Available balance (mock)
    const availableBalance = 125000.50;

    return (
        <div className="flex flex-col h-full">
            {/* Side Selector */}
            <div className="flex border-b border-border mb-4">
                <TabButton
                    side="buy"
                    active={side === "buy"}
                    onClick={() => setSide("buy")}
                />
                <TabButton
                    side="sell"
                    active={side === "sell"}
                    onClick={() => setSide("sell")}
                />
            </div>

            {/* Order Type Selector */}
            <div className="flex gap-2 mb-4">
                {(['limit', 'market', 'stop'] as OrderType[]).map((type) => (
                    <OrderTypeButton
                        key={type}
                        type={type}
                        active={orderType === type}
                        onClick={() => setOrderType(type)}
                    />
                ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4 flex-1">
                {/* Price Input */}
                {orderType !== "market" && (
                    <InputField
                        label="Price"
                        value={price}
                        onChange={setPrice}
                        icon={DollarSign}
                        placeholder="85000.00"
                        suffix="USD"
                    />
                )}

                {/* Amount Input */}
                <InputField
                    label="Amount"
                    value={amount}
                    onChange={setAmount}
                    icon={Hash}
                    placeholder="0.50"
                    suffix="BTC"
                />

                {/* Quick Amount Selectors */}
                <div className="flex gap-2">
                    {['25%', '50%', '75%', '100%'].map((pct) => (
                        <QuickSelectButton
                            key={pct}
                            label={pct}
                            onClick={() => {
                                // Calculate based on available balance
                                const percentage = parseInt(pct) / 100;
                                const maxAmount = availableBalance / (Number(price) || 85000);
                                setAmount((maxAmount * percentage).toFixed(4));
                            }}
                        />
                    ))}
                </div>

                {/* Leverage Input */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">
                            Leverage
                        </label>
                        <span className="text-xs font-mono text-primary font-semibold">
                            {leverage}x
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={leverage}
                        onChange={(e) => setLeverage(e.target.value)}
                        className="w-full h-2 accent-primary cursor-pointer"
                    />
                </div>

                {/* Order Summary */}
                <div className="space-y-1 pt-3 border-t border-border/50">
                    <InfoRow
                        label="Available Balance"
                        value={`$${availableBalance.toLocaleString()}`}
                    />
                    <InfoRow
                        label="Estimated Value"
                        value={`$${estimatedTotal.toLocaleString()}`}
                    />
                    <InfoRow
                        label="Trading Fee (0.1%)"
                        value={`$${(estimatedTotal * 0.001).toFixed(2)}`}
                    />
                    <InfoRow
                        label="Total"
                        value={`$${(estimatedTotal * 1.001).toLocaleString()}`}
                        highlight
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleOrder}
                disabled={loading}
                className={`
                    w-full mt-4 py-3 px-4 rounded-sm
                    font-display font-semibold text-sm uppercase tracking-wider
                    transition-all duration-200
                    flex items-center justify-center gap-2 group
                    ${isBuy
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                    active:scale-[0.98]
                `}
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <span>{isBuy ? 'Place Buy Order' : 'Place Sell Order'}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                )}
            </button>

            {/* Margin Info */}
            <div className="mt-3 flex items-center justify-center gap-2 text-2xs text-muted-foreground/60">
                <Wallet size={10} />
                <span>Cross Margin Mode</span>
            </div>
        </div>
    );
}
