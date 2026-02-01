import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { Card } from '@/components/ui/card';
import { usePositions } from '@/hooks/use-positions';

export function TradeChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const markersRef = useRef<any>(null);

  const { data: ohlcData } = useQuery({
    queryKey: [api.user.market.ohlc.path],
    queryFn: async () => {
      const res = await fetch(api.user.market.ohlc.path);
      if (!res.ok) throw new Error("Failed to fetch OHLC");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: positions } = usePositions();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: 'rgba(39, 39, 42, 0.3)' },
        horzLines: { color: 'rgba(39, 39, 42, 0.3)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: 'rgba(39, 39, 42, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const markersPlugin = createSeriesMarkers(candlestickSeries);
    markersRef.current = markersPlugin;

    seriesRef.current = candlestickSeries;
    chartRef.current = chart;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && ohlcData) {
      seriesRef.current.setData(ohlcData);

      if (positions) {
        const markers = positions
          .filter(p => p.status === 'OPEN' || p.status === 'CLOSED')
          .map(p => ({
            time: Math.floor(new Date(p.openedAt || Date.now()).getTime() / 1000),
            position: p.type === 'BUY' ? 'belowBar' : 'aboveBar',
            color: p.type === 'BUY' ? '#10b981' : '#ef4444',
            shape: p.type === 'BUY' ? 'arrowUp' : 'arrowDown',
            text: `BOT ${p.type}`,
          }));
        
        if (markersRef.current) {
          markersRef.current.setMarkers(markers);
        }
      }
    }
  }, [ohlcData, positions]);

  return (
    <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-6 shadow-2xl group overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Market Execution Cluster</div>
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase">BTC/USDT REAL-TIME</h3>
        </div>
        <div className="flex gap-2">
          {['1m', '5m', '15m', '1h'].map(tf => (
            <button key={tf} className="px-3 py-1 rounded-lg bg-zinc-950 border border-white/5 text-[10px] font-black text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all uppercase">
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </Card>
  );
}
