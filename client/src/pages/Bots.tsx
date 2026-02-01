import { Navigation } from "@/components/Navigation";
import { useBots } from "@/hooks/use-bots";
import { BotCard } from "@/components/BotCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Bots() {
  const { data: bots, isLoading } = useBots();

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex">
      <Navigation />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Bot Market</h1>
            <p className="text-zinc-400 max-w-2xl text-lg">
              Choose from our selection of high-performance trading algorithms. 
              Each bot is optimized for different market conditions with strict risk management.
            </p>
          </header>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[300px] w-full bg-zinc-900 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots?.map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
