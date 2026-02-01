import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Maximize2, Minimize2, Settings, Layers } from 'lucide-react';
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

interface MarketSession {
    trend: 'up' | 'down' | 'sideways';
    volatility: number;
    duration: number;
}

function generateRealisticData(points: number = 200): CandlestickData[] {
    const data: CandlestickData[] = [];

    // Start with a realistic BTC price
    let basePrice = 84320;
    let trend = 0; // Current trend momentum

    // Generate sessions (bull, bear, sideways) - will cycle through these
    const sessions: MarketSession[] = [
        { trend: 'up', volatility: 0.008, duration: 25 },
        { trend: 'sideways', volatility: 0.004, duration: 15 },
        { trend: 'down', volatility: 0.010, duration: 20 },
        { trend: 'sideways', volatility: 0.003, duration: 12 },
        { trend: 'up', volatility: 0.007, duration: 18 },
        { trend: 'down', volatility: 0.009, duration: 22 },
        { trend: 'sideways', volatility: 0.005, duration: 10 },
        { trend: 'up', volatility: 0.006, duration: 15 },
    ];

    const now = new Date();
    now.setMinutes(0, 0, 0);
    let sessionIndex = 0;
    let sessionPointCount = 0;

    for (let pointIndex = 0; pointIndex < points; pointIndex++) {
        // Cycle through sessions
        const session = sessions[sessionIndex % sessions.length];

        // Generate candle for this point (1 hour intervals)
        const time = Math.floor(now.getTime() / 1000) - ((points - pointIndex) * 3600) as UTCTimestamp;

        // Update trend based on session with smooth transitions
        switch (session.trend) {
            case 'up':
                trend += (Math.random() * 0.002);
                trend = Math.min(trend, 0.005);
                break;
            case 'down':
                trend -= (Math.random() * 0.002);
                trend = Math.max(trend, -0.005);
                break;
            case 'sideways':
                trend *= 0.7; // Decay trend smoothly
                break;
        }

        // Add controlled noise to trend
        trend += (Math.random() - 0.5) * 0.0008;

        // Calculate price movement with smaller, more realistic moves
        const movePercent = trend + (Math.random() - 0.5) * session.volatility;

        const open = basePrice;
        const close = open * (1 + movePercent);

        // Calculate wicks with realistic patterns (smaller wicks)
        const bodySize = Math.abs(close - open);
        const wickMultiplier = 0.3 + Math.random() * 0.8;

        let high: number;
        let low: number;

        if (close >= open) {
            // Green candle
            high = Math.max(open, close) + bodySize * wickMultiplier * Math.random();
            low = Math.min(open, close) - bodySize * wickMultiplier * Math.random() * 0.4;
        } else {
            // Red candle
            high = Math.max(open, close) + bodySize * wickMultiplier * Math.random() * 0.4;
            low = Math.min(open, close) - bodySize * wickMultiplier * Math.random();
        }

        // Occasional wick rejections (support/resistance) - less frequent
        if (Math.random() > 0.95) {
            if (Math.random() > 0.5) {
                high = Math.max(open, close) + (basePrice * session.volatility);
            } else {
                low = Math.min(open, close) - (basePrice * session.volatility);
            }
        }

        // Ensure high >= max(open, close) and low <= min(open, close)
        high = Math.max(high, open, close);
        low = Math.min(low, open, close);

        data.push({
            time,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
        });

        basePrice = close;
        sessionPointCount++;

        // Move to next session if current is complete
        if (sessionPointCount >= session.duration) {
            sessionIndex++;
            sessionPointCount = 0;
        }
    }

    return data;
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
        // Volume correlates with price movement
        const priceChange = Math.abs(d.close - d.open) / d.open;
        const baseVolume = 500 + Math.random() * 1500;
        const volumeMultiplier = 1 + (priceChange * 50); // More volume on big moves

        return {
            time: d.time,
            value: Math.floor(baseVolume * volumeMultiplier),
            color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        };
    });
}

export const CandleChart = (props: {
    data?: CandlestickData[];
    colors?: typeof defaultColors;
    showVolume?: boolean;
    showMA?: boolean;
}) => {
    const {
        data = [],
        colors = {},
        showVolume = true,
        showMA = true,
    } = props;

    const mergedColors = useMemo(() => ({ ...defaultColors, ...colors }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(colors)]);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const candleSeriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null);

    // Store generated data in a ref so it's only created once
    const generatedDataRef = useRef<CandlestickData[] | null>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoverData, setHoverData] = useState<{
        open: number;
        high: number;
        low: number;
        close: number;
    } | null>(null);

    // Throttled hover update using refs to avoid causing re-renders
    const throttleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastHoverData = useRef<typeof hoverData>(null);
    const setHoverDataRef = useRef(setHoverData);
    setHoverDataRef.current = setHoverData;

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight || 400
                });
            }
        };

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: mergedColors.backgroundColor },
                textColor: mergedColors.textColor,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
            },
            grid: {
                vertLines: {
                    color: mergedColors.gridColor,
                    style: 2,
                },
                horzLines: {
                    color: mergedColors.gridColor,
                    style: 2,
                },
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
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: 'rgba(232, 93, 4, 0.2)',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                vertTouchDrag: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight || 400,
        });

        chartRef.current = chart;

        // Add candlestick series
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: mergedColors.upColor,
            downColor: mergedColors.downColor,
            borderUpColor: mergedColors.borderUpColor,
            borderDownColor: mergedColors.borderDownColor,
            wickUpColor: mergedColors.wickUpColor,
            wickDownColor: mergedColors.wickDownColor,
        });
        candleSeriesRef.current = candleSeries;

        // Generate data once and store in ref, or use provided data
        if (!generatedDataRef.current && data.length === 0) {
            generatedDataRef.current = generateRealisticData();
        }
        const initialData = data.length > 0 ? data : generatedDataRef.current!;
        candleSeries.setData(initialData);

        // Add volume if enabled
        if (showVolume) {
            const volumeSeries = chart.addSeries(HistogramSeries, {
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
            });
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.85,
                    bottom: 0,
                },
            });

            const volumeData = generateVolumeData(initialData);
            volumeSeries.setData(volumeData);
        }

        // Add moving averages if enabled
        if (showMA) {
            const ma7 = generateMA(initialData, 7);
            const ma25 = generateMA(initialData, 25);
            const ma99 = generateMA(initialData, 99);

            const ma7Series = chart.addSeries(LineSeries, {
                color: '#f59e0b',
                lineWidth: 1,
                title: 'MA7',
            });
            ma7Series.setData(ma7);

            const ma25Series = chart.addSeries(LineSeries, {
                color: '#3b82f6',
                lineWidth: 1,
                title: 'MA25',
            });
            ma25Series.setData(ma25);

            const ma99Series = chart.addSeries(LineSeries, {
                color: '#a855f7',
                lineWidth: 1,
                title: 'MA99',
            });
            ma99Series.setData(ma99);
        }

        chart.timeScale().fitContent();

        // Throttled hover update function - defined inside effect to use refs
        const updateHoverData = (newData: { open: number; high: number; low: number; close: number } | null) => {
            // Only update if data actually changed
            if (newData?.open === lastHoverData.current?.open &&
                newData?.high === lastHoverData.current?.high &&
                newData?.low === lastHoverData.current?.low &&
                newData?.close === lastHoverData.current?.close) {
                return;
            }

            lastHoverData.current = newData;

            // Throttle to ~60fps
            if (!throttleTimeout.current) {
                throttleTimeout.current = setTimeout(() => {
                    setHoverDataRef.current(lastHoverData.current);
                    throttleTimeout.current = null;
                }, 16);
            }
        };

        // Subscribe to crosshair move
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
    }, [data, mergedColors, showVolume, showMA, isFullscreen]);

    // Cleanup throttle timeout on unmount
    useEffect(() => {
        return () => {
            if (throttleTimeout.current) {
                clearTimeout(throttleTimeout.current);
            }
        };
    }, []);

    const isGreen = hoverData ? hoverData.close >= hoverData.open : false;

    return (
        <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
            {/* Chart Toolbar */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                {hoverData && (
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-sm text-xs animate-fade-in">
                        <span className="text-muted-foreground text-2xs">O</span>
                        <span className="font-mono tabular-nums">{hoverData.open.toFixed(2)}</span>
                        <span className="text-muted-foreground text-2xs">H</span>
                        <span className="font-mono tabular-nums">{hoverData.high.toFixed(2)}</span>
                        <span className="text-muted-foreground text-2xs">L</span>
                        <span className="font-mono tabular-nums">{hoverData.low.toFixed(2)}</span>
                        <span className="text-muted-foreground text-2xs">C</span>
                        <span className={`font-mono tabular-nums font-semibold ${isGreen ? 'text-emerald-400' : 'text-red-400'}`}>
                            {hoverData.close.toFixed(2)}
                        </span>
                    </div>
                )}

                <button
                    className="p-1.5 bg-card/90 backdrop-blur border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                    title="Indicators"
                >
                    <Layers size={14} />
                </button>

                <button
                    className="p-1.5 bg-card/90 backdrop-blur border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                    title="Settings"
                >
                    <Settings size={14} />
                </button>

                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 bg-card/90 backdrop-blur border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
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
            <div
                ref={chartContainerRef}
                className="w-full h-full"
            />
        </div>
    );
};

export default CandleChart;
