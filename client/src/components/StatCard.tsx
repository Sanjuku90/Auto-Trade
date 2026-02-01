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
    <Card className={cn("p-6 bg-zinc-900 border-zinc-800 shadow-lg relative overflow-hidden", className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2 relative z-10">
          <p className="text-sm font-medium text-zinc-400">{label}</p>
          <h3 className="text-3xl font-bold font-mono text-white tracking-tight">{value}</h3>
          {(subValue || trendValue) && (
            <div className="flex items-center gap-2 text-sm">
              {trend && (
                <span className={cn(
                  "flex items-center font-medium",
                  trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-zinc-400"
                )}>
                  {trend === "up" ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {trendValue}
                </span>
              )}
              {subValue && <span className="text-zinc-500">{subValue}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-zinc-800/50 rounded-xl border border-white/5 text-zinc-400">
            {icon}
          </div>
        )}
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </Card>
  );
}
