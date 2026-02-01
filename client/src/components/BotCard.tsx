import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Bot } from "@shared/schema";
import { Activity, Zap, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAllocate } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BotCardProps {
  bot: Bot & { recentPerformance?: any[] };
}

export function BotCard({ bot }: BotCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { mutate, isPending } = useAllocate();
  const { toast } = useToast();

  const handleAllocate = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast({ title: "Montant invalide", description: "Veuillez entrer un nombre positif.", variant: "destructive" });
      return;
    }

    mutate(
      { botId: bot.id, amount },
      {
        onSuccess: () => {
          toast({ title: "Succès", description: `Allocation de $${amount} au bot ${bot.name} réussie.` });
          setIsOpen(false);
          setAmount("");
        },
        onError: (err) => {
          toast({ title: "Échec", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "MEDIUM": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      case "HIGH": return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20";
      default: return "bg-zinc-500/10 text-zinc-500";
    }
  };

  const isActive = bot.status === "ACTIVE";

  return (
    <Card className="bg-zinc-900/40 backdrop-blur-md border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-500 flex flex-col h-full overflow-hidden group shadow-2xl">
      <div className="p-8 flex-1 flex flex-col relative">
        <div className="flex justify-between items-start mb-6">
          <Badge variant="outline" className={cn(getRiskColor(bot.riskLevel), "border-0 font-mono tracking-widest text-[10px] font-black px-2 py-1 uppercase")}>
            RISQUE {bot.riskLevel === 'LOW' ? 'FAIBLE' : bot.riskLevel === 'MEDIUM' ? 'MOYEN' : 'ÉLEVÉ'}
          </Badge>
          <div className="flex items-center text-emerald-400 text-xs font-mono font-black tracking-tighter">
            <Zap className="w-3.5 h-3.5 mr-1.5 fill-emerald-400/20" />
            CAP: {bot.dailyCapPercentage}%
          </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-3 tracking-tighter group-hover:text-emerald-400 transition-colors uppercase">{bot.name}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-1 font-medium italic">
          "{bot.description}"
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-zinc-950/30 rounded-2xl border border-white/5 group-hover:bg-zinc-950/50 transition-colors">
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Type</div>
            <div className="text-sm font-bold text-zinc-300 uppercase">{bot.type}</div>
          </div>
          <div className="p-4 bg-zinc-950/30 rounded-2xl border border-white/5 group-hover:bg-zinc-950/50 transition-colors">
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status</div>
            <div className={cn("text-sm font-bold flex items-center uppercase", isActive ? "text-emerald-500" : "text-rose-500")}>
              <span className={cn("w-2 h-2 rounded-full mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]", isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
              {isActive ? "OPÉRATIONNEL" : "INACTIF"}
            </div>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-900/20 group-hover:shadow-emerald-500/20 transition-all duration-300 border-0 active:scale-[0.98]">
              Déployer Bot <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter">Allouer du Capital à {bot.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                "Rendement quotidien attendu jusqu'à {bot.dailyCapPercentage}%. Le capital est verrouillé pour des cycles de 24h au sein du cluster d'exécution algorithmique."
              </div>
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Montant (USD)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000.00"
                    className="pl-8 bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 font-mono text-xl h-14 rounded-xl"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-xs h-11 text-zinc-500">Abandonner</Button>
              <Button 
                onClick={handleAllocate} 
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-xs h-11 px-8 shadow-xl shadow-emerald-900/20"
              >
                {isPending ? "Exécution..." : "Confirmer le Déploiement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
