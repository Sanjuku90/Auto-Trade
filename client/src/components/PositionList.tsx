import { usePositions } from "@/hooks/use-positions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function PositionList() {
  const { data: positions, isLoading } = usePositions();

  if (isLoading) return <div className="text-zinc-500 text-sm p-4">Loading positions...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-400">
            <th className="py-3 px-4">Asset</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Entry</th>
            <th className="py-3 px-4">Exit</th>
            <th className="py-3 px-4">Profit</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {positions?.map((pos) => (
            <tr key={pos.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 text-white">
              <td className="py-3 px-4 font-medium">{pos.asset}</td>
              <td className="py-3 px-4">
                <Badge variant="outline" className={pos.type === 'BUY' ? 'border-emerald-600 text-emerald-400' : 'border-rose-600 text-rose-400'}>
                  {pos.type}
                </Badge>
              </td>
              <td className="py-3 px-4 font-mono">${parseFloat(pos.entryPrice).toFixed(2)}</td>
              <td className="py-3 px-4 font-mono">{pos.exitPrice ? `$${parseFloat(pos.exitPrice).toFixed(2)}` : '—'}</td>
              <td className="py-3 px-4">
                <span className={parseFloat(pos.profitPercentage || '0') >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {pos.profitPercentage ? `${parseFloat(pos.profitPercentage) > 0 ? '+' : ''}${pos.profitPercentage}%` : '—'}
                </span>
              </td>
              <td className="py-3 px-4">
                <Badge variant="secondary" className={pos.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}>
                  {pos.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
