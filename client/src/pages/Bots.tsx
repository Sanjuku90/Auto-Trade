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
          <header className="mb-16">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">INFRASTRUCTURE DES BOTS</h1>
            <p className="text-zinc-500 max-w-2xl text-lg font-medium italic">
              "Déployez des nœuds algorithmiques spécialisés conçus pour différents régimes de marché. Chaque bot opère dans des limites de risque strictes."
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
