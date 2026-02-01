import { usePositions } from "@/hooks/use-positions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PositionList() {
  const { data: positions, isLoading } = usePositions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full bg-zinc-900 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-white/5">
          <Clock className="w-8 h-8 text-zinc-700" />
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Aucune position active détectée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.slice(0, 10).sort((a, b) => {
        if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
        if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;
        return new Date(b.openedAt || 0).getTime() - new Date(a.openedAt || 0).getTime();
      }).map((pos) => {
        const isProfit = parseFloat(pos.profitPercentage || "0") > 0;
        const isClosed = pos.status === "CLOSED";

        return (
          <div 
            key={pos.id} 
            className="group p-5 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-emerald-500/20 transition-all duration-300 flex items-center justify-between shadow-lg"
            data-testid={`row-position-${pos.id}`}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner",
                pos.type === 'BUY' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              )}>
                {pos.type === 'BUY' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-black text-white tracking-tighter uppercase">{pos.asset}</span>
                  <Badge variant="outline" className="text-[8px] font-black uppercase bg-zinc-900 border-zinc-800 text-zinc-500 px-1.5 py-0">
                    {pos.type}
                  </Badge>
                </div>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  Entrée: <span className="text-zinc-400 font-mono">${parseFloat(pos.entryPrice).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {isClosed ? (
                <>
                  <div className={cn(
                    "text-sm font-black tracking-tighter mb-1",
                    isProfit ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {isProfit ? "+" : ""}{pos.profitPercentage}%
                  </div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    Clôturé
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm font-black text-amber-400 tracking-tighter mb-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    LIVE
                  </div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    Exécution...
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
