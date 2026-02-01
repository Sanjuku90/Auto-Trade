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
          <header className="mb-16">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">NETWORK LEDGER</h1>
            <p className="text-zinc-500 max-w-2xl text-lg font-medium italic">
              "Immutable history of all capital movements and trade execution protocols within the network."
            </p>
          </header>

          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-zinc-800/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <TransactionTable transactions={data?.recentTransactions || []} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
