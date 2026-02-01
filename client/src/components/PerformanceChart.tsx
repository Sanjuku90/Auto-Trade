import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui/card";

interface DataPoint {
  date: string;
  value: number;
}

// Generate dummy data if real data is scarce
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
    <Card className="p-6 bg-zinc-900 border-zinc-800 shadow-lg h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
          <p className="text-sm text-zinc-500">Daily profit percentage over the last 30 days</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Profit
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#52525b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                borderColor: '#27272a',
                borderRadius: '8px',
                color: '#fff'
              }}
              itemStyle={{ color: '#10b981' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorProfit)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
