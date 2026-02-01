import { Navigation } from "@/components/Navigation";
import { usePortfolio } from "@/hooks/use-portfolio";
import { TransactionTable } from "@/components/TransactionTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transactions() {
  const { data, isLoading } = usePortfolio();

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex">
      <Navigation />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
            <p className="text-zinc-400">View your full deposit, withdrawal, and allocation history.</p>
          </header>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full bg-zinc-900" />
              <Skeleton className="h-12 w-full bg-zinc-900" />
              <Skeleton className="h-12 w-full bg-zinc-900" />
            </div>
          ) : (
            <TransactionTable transactions={data?.recentTransactions || []} />
          )}
        </div>
      </main>
    </div>
  );
}
