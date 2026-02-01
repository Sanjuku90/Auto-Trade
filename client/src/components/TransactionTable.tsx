import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { type Transaction } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionTable({ transactions, limit }: TransactionTableProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (displayTransactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500 font-medium italic">"No network ledger entries found."</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol ID</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Vector</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Quantum</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Network Status</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {displayTransactions.map((tx) => (
            <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-4">
                <span className="font-mono text-xs font-bold text-zinc-500 uppercase">TX-{tx.id.toString().padStart(6, '0')}</span>
              </td>
              <td className="py-4 px-4">
                <Badge variant="outline" className={cn(
                  "border-0 font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md",
                  tx.type === "DEPOSIT" ? "bg-emerald-500/10 text-emerald-500" : 
                  tx.type === "WITHDRAW" ? "bg-rose-500/10 text-rose-500" : 
                  "bg-blue-500/10 text-blue-500"
                )}>
                  {tx.type}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <span className="font-mono text-sm font-black text-white">${parseFloat(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    tx.status === "COMPLETED" ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : 
                    tx.status === "PENDING" ? "bg-amber-500 animate-pulse" : 
                    "bg-zinc-700"
                  )} />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    tx.status === "COMPLETED" ? "text-emerald-500/80" : 
                    tx.status === "PENDING" ? "text-amber-500/80" : 
                    "text-zinc-600"
                  )}>{tx.status}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-right">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{format(new Date(tx.createdAt || Date.now()), "MMM dd, HH:mm")}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
