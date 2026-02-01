import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui/card";

interface DataPoint {
  date: string;
  value: number;
}

const generateData = () => {
  const data: DataPoint[] = [];
  for (let i = 30; i >= 0; i--) {
    data.push({
      date: format(subDays(new Date(), i), 'MMM dd'),
      value: Math.floor(Math.random() * 20) + 10 + (Math.random() * 5),
    });
  }
  return data;
};

export function PerformanceChart({ data }: { data?: DataPoint[] }) {
  const chartData = data && data.length > 0 ? data : generateData();

  return (
    <Card className="p-8 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl shadow-2xl h-[450px] group">
      <div className="flex justify-between items-center mb-10">
        <div>
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Performance Analytics</div>
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase">PORTFOLIO YIELD</h3>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            Profitability
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.1} />
            <XAxis 
              dataKey="date" 
              stroke="#52525b" 
              fontSize={10} 
              fontWeight="bold"
              tickLine={false} 
              axisLine={false}
              minTickGap={30}
              dy={10}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={10} 
              fontWeight="bold"
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                borderColor: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '16px',
                borderWidth: '1px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '900',
                padding: '12px'
              }}
              itemStyle={{ color: '#10b981', textTransform: 'uppercase' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorProfit)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
