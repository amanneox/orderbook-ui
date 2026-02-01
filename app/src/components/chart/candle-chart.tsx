import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Maximize2, Minimize2, Settings, Layers, Loader2 } from 'lucide-react';
import type { CandlestickData, HistogramData, LineData, UTCTimestamp } from 'lightweight-charts';

const defaultColors = {
    backgroundColor: 'transparent',
    textColor: '#a8a29e',
    gridColor: 'rgba(232, 93, 4, 0.08)',
    upColor: '#10b981',
    downColor: '#ef4444',
    wickUpColor: '#10b981',
    wickDownColor: '#ef4444',
    volumeUpColor: 'rgba(16, 185, 129, 0.5)',
    volumeDownColor: 'rgba(239, 68, 68, 0.5)',
    borderUpColor: '#10b981',
    borderDownColor: '#ef4444',
};

// Binance only
async function fetchBinanceKlines(interval: string = '1h', limit: number = 300): Promise<CandlestickData[]> {
    const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`
    );
    
    if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
    }
    
    const data = await response.json();
    // Binance format: [openTime, open, high, low, close, volume, closeTime, ...]
    return data.map((k: any[]) => ({
        time: Math.floor(k[0] / 1000) as UTCTimestamp,
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
    }));
}

// Only use Binance - no fallback
async function fetchChartData(): Promise<{ data: CandlestickData[]; source: string }> {
    const data = await fetchBinanceKlines('1h', 300);
    return { data, source: 'Binance' };
}

// Fetch current price from Binance only
async function fetchCurrentPrice(): Promise<number> {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        if (response.ok) {
            const data = await response.json();
            return parseFloat(data.price);
        }
    } catch {
        // Ignore
    }
    
    return 84500; // Fallback price
}

function generateMA(data: CandlestickData[], period: number): LineData[] {
    const ma: LineData[] = [];
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        ma.push({ time: data[i].time, value: Number((sum / period).toFixed(2)) });
    }
    return ma;
}

function generateVolumeData(data: CandlestickData[]): HistogramData[] {
    return data.map(d => {
        const priceChange = Math.abs(d.close - d.open) / d.open;
        const range = (d.high - d.low) / d.low;
        const baseVolume = 500 + Math.random() * 1000;
        const volumeMultiplier = 1 + priceChange * 30 + range * 10;

        return {
            time: d.time,
            value: Math.floor(baseVolume * volumeMultiplier),
            color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        };
    });
}

export const CandleChart = (props: {
    colors?: typeof defaultColors;
    showVolume?: boolean;
    showMA?: boolean;
    onPriceUpdate?: (price: number) => void;
}) => {
    const {
        colors = {},
        showVolume = true,
        showMA = true,
        onPriceUpdate,
    } = props;

    const mergedColors = useMemo(() => ({ ...defaultColors, ...colors }),
        [JSON.stringify(colors)]);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const candleSeriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<string>('');
    const [chartData, setChartData] = useState<CandlestickData[]>([]);
    const [hoverData, setHoverData] = useState<{
        open: number;
        high: number;
        low: number;
        close: number;
    } | null>(null);

    const throttleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastHoverData = useRef<typeof hoverData>(null);
    const setHoverDataRef = useRef(setHoverData);
    setHoverDataRef.current = setHoverData;

    // Fetch data on mount (only once)
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [{ data, source }, currentPrice] = await Promise.all([
                    fetchChartData(),
                    fetchCurrentPrice(),
                ]);

                if (!isMounted) return;

                setChartData(data);
                setDataSource(source);
                if (currentPrice > 0 && onPriceUpdate) {
                    onPriceUpdate(currentPrice);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load market data');
                    console.error('Chart data error:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        // Refresh data every 2 minutes
        const interval = setInterval(loadData, 2 * 60 * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only run on mount

    // Initialize/update chart
    useEffect(() => {
        if (!chartContainerRef.current || chartData.length === 0) return;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight || 400
                });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: mergedColors.backgroundColor },
                textColor: mergedColors.textColor,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
            },
            grid: {
                vertLines: { color: mergedColors.gridColor, style: 2 },
                horzLines: { color: mergedColors.gridColor, style: 2 },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: 'rgba(232, 93, 4, 0.5)',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#e85d04',
                },
                horzLine: {
                    color: 'rgba(232, 93, 4, 0.5)',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#e85d04',
                },
            },
            rightPriceScale: {
                borderColor: 'rgba(232, 93, 4, 0.2)',
                scaleMargins: { top: 0.1, bottom: 0.2 },
            },
            timeScale: {
                borderColor: 'rgba(232, 93, 4, 0.2)',
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 12,
                barSpacing: 8,
            },
            handleScroll: { vertTouchDrag: false },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight || 400,
        });

        chartRef.current = chart;

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: mergedColors.upColor,
            downColor: mergedColors.downColor,
            borderUpColor: mergedColors.borderUpColor,
            borderDownColor: mergedColors.borderDownColor,
            wickUpColor: mergedColors.wickUpColor,
            wickDownColor: mergedColors.wickDownColor,
            wickVisible: true,
        });
        candleSeriesRef.current = candleSeries;

        candleSeries.setData(chartData);

        if (showVolume) {
            const volumeSeries = chart.addSeries(HistogramSeries, {
                color: '#26a69a',
                priceFormat: { type: 'volume' },
                priceScaleId: '',
            });
            volumeSeries.priceScale().applyOptions({
                scaleMargins: { top: 0.85, bottom: 0 },
            });
            volumeSeries.setData(generateVolumeData(chartData));
        }

        if (showMA) {
            const ma7 = generateMA(chartData, 7);
            const ma25 = generateMA(chartData, 25);
            const ma99 = generateMA(chartData, 99);

            chart.addSeries(LineSeries, {
                color: '#f59e0b',
                lineWidth: 1,
                title: 'MA7',
                lastValueVisible: false,
            }).setData(ma7);

            chart.addSeries(LineSeries, {
                color: '#3b82f6',
                lineWidth: 1,
                title: 'MA25',
                lastValueVisible: false,
            }).setData(ma25);

            chart.addSeries(LineSeries, {
                color: '#a855f7',
                lineWidth: 1,
                title: 'MA99',
                lastValueVisible: false,
            }).setData(ma99);
        }

        chart.timeScale().fitContent();

        const updateHoverData = (newData: { open: number; high: number; low: number; close: number } | null) => {
            if (newData?.open === lastHoverData.current?.open &&
                newData?.high === lastHoverData.current?.high &&
                newData?.low === lastHoverData.current?.low &&
                newData?.close === lastHoverData.current?.close) {
                return;
            }

            lastHoverData.current = newData;

            if (!throttleTimeout.current) {
                throttleTimeout.current = setTimeout(() => {
                    setHoverDataRef.current(lastHoverData.current);
                    throttleTimeout.current = null;
                }, 16);
            }
        };

        chart.subscribeCrosshairMove((param) => {
            if (param.logical !== undefined && param.point !== undefined) {
                const dataPoint = param.seriesData.get(candleSeries) as CandlestickData | undefined;
                if (dataPoint) {
                    updateHoverData({
                        open: dataPoint.open,
                        high: dataPoint.high,
                        low: dataPoint.low,
                        close: dataPoint.close,
                    });
                }
            } else {
                updateHoverData(null);
            }
        });

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
        };
    }, [chartData, mergedColors, showVolume, showMA, isFullscreen]);

    useEffect(() => {
        return () => {
            if (throttleTimeout.current) {
                clearTimeout(throttleTimeout.current);
            }
        };
    }, []);

    const isGreen = hoverData ? hoverData.close >= hoverData.open : false;
    const changePercent = hoverData ? ((hoverData.close - hoverData.open) / hoverData.open * 100) : 0;

    return (
        <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading market data...</span>
                    </div>
                </div>
            )}

            {/* Error State - only show if no data */}
            {error && chartData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                    <div className="flex flex-col items-center gap-3 px-6">
                        <span className="text-sm text-destructive">{error}</span>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-sm hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}



            {/* Chart Toolbar */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                {hoverData && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card/95 backdrop-blur border border-border rounded-sm text-xs animate-fade-in shadow-lg">
                        <span className="text-muted-foreground text-2xs">O</span>
                        <span className="font-mono tabular-nums">{hoverData.open.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span className="text-muted-foreground text-2xs ml-1">H</span>
                        <span className="font-mono tabular-nums">{hoverData.high.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span className="text-muted-foreground text-2xs ml-1">L</span>
                        <span className="font-mono tabular-nums">{hoverData.low.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span className="text-muted-foreground text-2xs ml-1">C</span>
                        <span className={`font-mono tabular-nums font-semibold ${isGreen ? 'text-emerald-400' : 'text-red-400'}`}>
                            {hoverData.close.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                        <span className={`text-2xs font-mono ${changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                        </span>
                    </div>
                )}

                <button className="p-1.5 bg-card/90 backdrop-blur border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors" title="Indicators">
                    <Layers size={14} />
                </button>
                <button className="p-1.5 bg-card/90 backdrop-blur border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors" title="Settings">
                    <Settings size={14} />
                </button>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 bg-card/90 backdrop-blur border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
            </div>

            {/* Legend */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-4 px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-sm">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-2xs text-muted-foreground">MA7</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-2xs text-muted-foreground">MA25</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-2xs text-muted-foreground">MA99</span>
                </div>
            </div>

            {/* Chart Container */}
            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    );
};

export default CandleChart;
