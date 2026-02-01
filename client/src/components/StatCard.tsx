import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, subValue, trend, trendValue, icon, className }: StatCardProps) {
  return (
    <Card className={cn("p-6 bg-zinc-900/40 backdrop-blur-md border-zinc-800/50 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300", className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-3 relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
          <h3 className="text-3xl font-bold font-mono text-white tracking-tighter">{value}</h3>
          {(subValue || trendValue) && (
            <div className="flex items-center gap-2 text-xs">
              {trend && (
                <span className={cn(
                  "flex items-center font-bold px-1.5 py-0.5 rounded-full",
                  trend === "up" ? "bg-emerald-500/10 text-emerald-400" : trend === "down" ? "bg-rose-500/10 text-rose-400" : "bg-zinc-800 text-zinc-400"
                )}>
                  {trend === "up" ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {trendValue}
                </span>
              )}
              {subValue && <span className="text-zinc-500 font-medium">{subValue}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-zinc-800/30 rounded-2xl border border-white/5 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
    </Card>
  );
}
