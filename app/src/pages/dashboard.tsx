import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import OrderbookContainer, {
    OrderbookColumn,
} from "@/components/container/orderbook-container";
import { CandleChart } from "@/components/chart/candle-chart";
import { OrderForm } from "@/components/trade/order-form";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Activity, Terminal, Power, Shield, Box, FileCode,
    LayoutDashboard, Settings, Zap, TrendingUp, Clock,
    Bell, Wallet, ChevronRight, Radio
} from "lucide-react";

interface TradeLog {
    id: string;
    time: string;
    side: 'BUY' | 'SELL';
    price: number;
    volume: number;
    latency: number;
    hash: string;
}

interface MarketStat {
    label: string;
    value: string;
    change?: number;
    prefix?: string;
    suffix?: string;
}

const generateTradeLogs = (): TradeLog[] => {
    const logs: TradeLog[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const time = new Date(now.getTime() - i * 5000);
        logs.push({
            id: `trade-${i}`,
            time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            side: Math.random() > 0.5 ? 'BUY' : 'SELL',
            price: 84500 + Math.random() * 2000,
            volume: Math.random() * 5,
            latency: Math.floor(Math.random() * 30 + 5),
            hash: Math.random().toString(16).slice(2, 10).toUpperCase(),
        });
    }
    return logs;
};

const getData = (): OrderbookColumn[] => {
    return [
        { id: "1", price: 84540.02, size: 0.5, volume: 25, total: 84540.02 * 0.5 },
        { id: "2", price: 84700.0, size: 0.55, volume: 30, total: 84700.0 * 0.55 },
        { id: "3", price: 84850.0, size: 0.6, volume: 40, total: 84850.0 * 0.6 },
        { id: "4", price: 85000.0, size: 0.65, volume: 50, total: 85000.0 * 0.65 },
        { id: "5", price: 85150.0, size: 0.7, volume: 20, total: 85150.0 * 0.7 },
        { id: "6", price: 85300.0, size: 0.75, volume: 35, total: 85300.0 * 0.75 },
        { id: "7", price: 85450.0, size: 0.8, volume: 45, total: 85450.0 * 0.8 },
        { id: "8", price: 85600.0, size: 0.85, volume: 55, total: 85600.0 * 0.85 },
        { id: "9", price: 85750.0, size: 0.9, volume: 60, total: 85750.0 * 0.9 },
        { id: "10", price: 85900.0, size: 0.95, volume: 65, total: 85900.0 * 0.95 },
        { id: "11", price: 86050.0, size: 1.0, volume: 70, total: 86050.0 * 1.0 },
        { id: "12", price: 86200.0, size: 1.05, volume: 75, total: 86200.0 * 1.05 },
        { id: "13", price: 86350.0, size: 1.1, volume: 80, total: 86350.0 * 1.1 },
        { id: "14", price: 86500.0, size: 1.15, volume: 85, total: 86500.0 * 1.15 },
        { id: "15", price: 86650.0, size: 1.2, volume: 90, total: 86650.0 * 1.2 },
        { id: "16", price: 86800.0, size: 1.25, volume: 95, total: 86800.0 * 1.25 },
        { id: "17", price: 86950.0, size: 1.3, volume: 100, total: 86950.0 * 1.3 },
    ];
};

const calculateMarkPrice = (data: OrderbookColumn[]): number => {
    if (data.length === 0) return 0;
    const sortedData = [...data].sort((a, b) => a.price - b.price);
    const bestBid = sortedData.find((order) => order.size > 0);
    const bestAsk = [...sortedData].reverse().find((order) => order.size > 0);
    if (!bestBid || !bestAsk) return 0;
    return parseFloat(((bestBid.price + bestAsk.price) / 2).toFixed(2));
};

const TerminalWindow = ({
    title,
    icon: Icon,
    children,
    className = "",
    headerAction,
    accent = "primary"
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
    accent?: "primary" | "success" | "warning" | "info";
}) => {
    const accentColors = {
        primary: "border-primary/20 bg-primary/5",
        success: "border-emerald-500/20 bg-emerald-500/5",
        warning: "border-amber-500/20 bg-amber-500/5",
        info: "border-cyan-500/20 bg-cyan-500/5",
    };

    return (
        <div className={`terminal-window flex flex-col h-full ${className}`}>
            <div className={`window-header ${accentColors[accent]}`}>
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-primary/70" />
                    <span className="text-xs font-display font-semibold tracking-wider text-foreground/80 uppercase">
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {headerAction}
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary/20" />
                        <div className="w-2 h-2 rounded-full bg-primary/10" />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
};

const StatCard = ({ stat, delay = 0 }: { stat: MarketStat; delay?: number }) => {
    const isPositive = (stat.change || 0) >= 0;
    return (
        <div
            className="relative p-3 bg-card border border-border/50 rounded-sm overflow-hidden group card-hover"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
                {stat.prefix && <span className="text-sm text-muted-foreground">{stat.prefix}</span>}
                <span className="text-lg font-display font-bold text-foreground tabular-nums">
                    {stat.value}
                </span>
                {stat.suffix && <span className="text-xs text-muted-foreground">{stat.suffix}</span>}
            </div>
            {stat.change !== undefined && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'price-up' : 'price-down'}`}>
                    <TrendingUp size={10} className={isPositive ? '' : 'rotate-180'} />
                    <span className="tabular-nums">{isPositive ? '+' : ''}{stat.change.toFixed(2)}%</span>
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ currentPath = "/" }: { currentPath?: string }) => {
    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/", badge: null },
        { icon: Activity, label: "Markets", path: "/markets", badge: "3" },
        { icon: Terminal, label: "Terminal", path: "/terminal", badge: null },
        { icon: Wallet, label: "Wallet", path: "/wallet", badge: null },
        { icon: Settings, label: "Settings", path: "/settings", badge: null },
    ];

    return (
        <aside className="w-16 lg:w-20 border-r border-border bg-card/50 flex flex-col items-center py-4 gap-2 shrink-0 z-50 backdrop-blur-sm">
            {/* Logo */}
            <div className="mb-6 relative">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-primary-700 rounded-sm shadow-lg shadow-primary/20">
                    <Zap size={20} className="text-primary-foreground" fill="currentColor" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card status-online" />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 w-full px-2">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    return (
                        <button
                            key={item.label}
                            className={`
                                relative p-3 rounded-sm flex flex-col items-center justify-center gap-1 
                                transition-all duration-200 group
                                ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                }
                            `}
                            title={item.label}
                        >
                            <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                            <span className="text-[9px] font-medium uppercase tracking-wide hidden lg:block">
                                {item.label.slice(0, 6)}
                            </span>
                            {item.badge && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary))]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-3 w-full px-2">
                <div className="w-full h-px bg-border/50" />
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-sm hover:bg-secondary/50">
                    <Bell size={18} />
                </button>
                <button className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-sm hover:bg-destructive/10">
                    <Power size={18} />
                </button>
            </div>
        </aside>
    );
};

const TradeLogRow = ({ log, index }: { log: TradeLog; index: number }) => (
    <div
        className="flex items-center gap-3 px-3 py-1.5 text-xs hover:bg-primary/5 transition-colors animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <span className="text-muted-foreground w-16 font-mono text-2xs">{log.time}</span>
        <span className={`w-12 font-semibold ${log.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
            {log.side}
        </span>
        <span className="w-20 font-mono text-foreground tabular-nums">
            {log.price.toFixed(2)}
        </span>
        <span className="w-14 text-right font-mono text-muted-foreground tabular-nums">
            {log.volume.toFixed(3)}
        </span>
        <span className="w-16 text-right font-mono text-amber-400/80 tabular-nums">
            {log.latency}ms
        </span>
        <span className="flex-1 text-right font-mono text-2xs text-primary/30 truncate">
            0x{log.hash}
        </span>
    </div>
);

const columns: ColumnDef<OrderbookColumn>[] = [
    {
        accessorKey: "price",
        header: "PRICE",
        meta: { align: "left" },
        cell: ({ getValue }) => (
            <span className="text-primary font-semibold tabular-nums">
                {getValue<number>().toFixed(2)}
            </span>
        )
    },
    {
        accessorKey: "size",
        header: "SIZE",
        meta: { align: "right" },
        cell: ({ getValue }) => (
            <span className="text-foreground/80 tabular-nums">
                {getValue<number>().toFixed(4)}
            </span>
        )
    },
    {
        accessorKey: "total",
        header: "TOTAL",
        meta: { align: "right" },
        cell: ({ getValue }) => {
            const total = getValue<number>();
            return (
                <span className="text-muted-foreground tabular-nums">
                    {total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toFixed(2)}
                </span>
            );
        },
    },
];

export default function Dashboard() {
    const [data, setData] = useState<OrderbookColumn[]>(getData());
    const [markStatus, setMarkStatus] = useState(false);
    const [markPrice, setMarkPrice] = useState(calculateMarkPrice(data));
    const [buyRatio, setBuyRatio] = useState(0);
    const [sellRatio, setSellRatio] = useState(0);
    const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(generateTradeLogs());
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    // Simulate real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            const buy = Math.max(10, Math.random() * 90);
            const sell = 100 - buy;
            setBuyRatio(buy);
            setSellRatio(sell);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setMarkPrice(calculateMarkPrice(data));
            setMarkStatus(prev => !prev);
        }, 1000);
        return () => clearInterval(interval);
    }, [data]);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prevData =>
                prevData.map(order => {
                    const newPrice = parseFloat(
                        (order.price + (Math.random() - 0.5) * 10).toFixed(2)
                    );
                    const newSize = parseFloat(
                        Math.max(0.1, order.size + (Math.random() - 0.5) * 0.1).toFixed(5)
                    );
                    return {
                        ...order,
                        price: newPrice,
                        size: newSize,
                        volume: Math.max(1, order.volume + Math.floor((Math.random() - 0.5) * 10)),
                        total: parseFloat((newPrice * newSize).toFixed(2)),
                    };
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Refresh trade logs periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setTradeLogs(generateTradeLogs());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const properties = useMemo(
        () => ({
            markProperties: { price: markPrice, status: markStatus },
            ratios: { buy: buyRatio, sell: sellRatio },
            spread: { name: "USD", value: 0.00001 },
            ticker: "BTC/USD",
            granularity: { current: 1, range: [0.01, 0.1, 1, 10, 50, 100] },
        }),
        [markPrice, markStatus, buyRatio, sellRatio]
    );

    const marketStats: MarketStat[] = [
        { label: "24h Volume", value: "2.4", suffix: "B", change: 12.5 },
        { label: "Open Interest", value: "845.2", suffix: "M", change: 3.2 },
        { label: "Funding Rate", value: "0.01", suffix: "%", change: -0.5 },
        { label: "Index Price", value: markPrice.toFixed(2), prefix: "$" },
    ];

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            <Sidebar currentPath="/" />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/30 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-6">
                        {/* Market Selector */}
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-card border border-border/50 rounded-sm">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                                ₿
                            </div>
                            <div>
                                <span className="text-sm font-display font-semibold">BTC/USD</span>
                                <span className="text-2xs text-muted-foreground ml-2">Perpetual</span>
                            </div>
                            <ChevronRight size={14} className="text-muted-foreground -rotate-90" />
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center gap-2">
                            <Radio size={12} className="text-emerald-500 animate-pulse" />
                            <span className="text-2xs text-muted-foreground uppercase tracking-wider">
                                System Online
                            </span>
                            <span className="text-2xs text-emerald-500">12ms</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Live Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
                                Live
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-sm">
                                <Shield size={12} className="text-primary" />
                                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                                    {user?.username}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <Power size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-px bg-border border-b border-border">
                    {marketStats.map((stat, i) => (
                        <StatCard key={stat.label} stat={stat} delay={i * 100} />
                    ))}
                </div>

                {/* Main Content Grid */}
                <main className="flex-1 p-3 grid grid-cols-12 grid-rows-12 gap-3 overflow-hidden">

                    {/* Chart Section - Large */}
                    <TerminalWindow
                        title="Market Overview"
                        icon={Activity}
                        className="col-span-12 lg:col-span-8 row-span-8"
                        accent="primary"
                    >
                        <div className="absolute inset-0 flex flex-col">
                            {/* Chart Header */}
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-sm">
                                    <Clock size={12} className="text-primary" />
                                    <span className="text-xs font-medium">1H</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-sm">
                                    <TrendingUp size={12} className="text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-400">+2.45%</span>
                                </div>
                            </div>
                            <CandleChart />
                        </div>
                    </TerminalWindow>

                    {/* Order Book */}
                    <TerminalWindow
                        title="Order Book"
                        icon={Box}
                        className="col-span-12 lg:col-span-4 row-span-12"
                        accent="info"
                    >
                        <OrderbookContainer
                            properties={properties}
                            data={data}
                            columns={columns}
                        />
                    </TerminalWindow>

                    {/* Recent Trades */}
                    <TerminalWindow
                        title="Recent Trades"
                        icon={FileCode}
                        className="col-span-12 lg:col-span-4 row-span-4"
                        accent="success"
                    >
                        <div className="h-full overflow-hidden">
                            {/* Table Header */}
                            <div className="flex items-center gap-3 px-3 py-2 border-b border-border/50 bg-card/50">
                                <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Time</span>
                                <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider w-12">Side</span>
                                <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Price</span>
                                <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider w-14 text-right">Size</span>
                                <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider w-16 text-right">Latency</span>
                                <span className="flex-1 text-right text-2xs font-semibold text-muted-foreground uppercase tracking-wider">ID</span>
                            </div>
                            {/* Trade Rows */}
                            <div className="overflow-y-auto h-[calc(100%-32px)]">
                                {tradeLogs.map((log, i) => (
                                    <TradeLogRow key={log.id} log={log} index={i} />
                                ))}
                            </div>
                        </div>
                    </TerminalWindow>

                    {/* Order Entry */}
                    <TerminalWindow
                        title="Order Entry"
                        icon={Zap}
                        className="col-span-12 lg:col-span-4 row-span-4"
                        accent="warning"
                    >
                        <div className="p-3 h-full overflow-y-auto">
                            <OrderForm />
                        </div>
                    </TerminalWindow>

                </main>
            </div>

            {/* CRT Effects */}
            <div className="scanlines" />
            <div className="crt-overlay" />
        </div>
    );
}
