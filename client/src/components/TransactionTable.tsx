import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { type Transaction } from "@shared/schema";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionTable({ transactions, limit }: TransactionTableProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT": return <ArrowDownRight className="w-4 h-4 text-emerald-500" />;
      case "WITHDRAWAL": return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case "PROFIT": return <RefreshCw className="w-4 h-4 text-emerald-400" />;
      case "ALLOCATION": return <Layers className="w-4 h-4 text-amber-500" />;
      default: return <RefreshCw className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-emerald-500";
      case "PENDING": return "text-amber-500";
      case "FAILED": return "text-rose-500";
      default: return "text-zinc-500";
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-950/50">
          <TableRow className="border-zinc-800 hover:bg-zinc-950/50">
            <TableHead className="text-zinc-400">Type</TableHead>
            <TableHead className="text-zinc-400">Amount</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400 text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTransactions.length === 0 ? (
            <TableRow className="border-zinc-800">
              <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            displayTransactions.map((tx) => (
              <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-zinc-800 rounded-md border border-white/5">
                      {getIcon(tx.type)}
                    </div>
                    <span className="capitalize">{tx.type.toLowerCase()}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-white">
                  ${tx.amount}
                </TableCell>
                <TableCell className={`text-xs font-semibold ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </TableCell>
                <TableCell className="text-right text-zinc-500 text-sm tabular-nums">
                  {format(new Date(tx.createdAt || new Date()), "MMM dd, HH:mm")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
