import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Bot } from "@shared/schema";
import { Activity, ShieldAlert, Zap, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAllocate } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
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
      toast({ title: "Invalid Amount", description: "Please enter a positive number.", variant: "destructive" });
      return;
    }

    mutate(
      { botId: bot.id, amount },
      {
        onSuccess: () => {
          toast({ title: "Success", description: `Allocated $${amount} to ${bot.name}` });
          setIsOpen(false);
          setAmount("");
        },
        onError: (err) => {
          toast({ title: "Failed", description: err.message, variant: "destructive" });
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

  return (
    <Card className="bg-zinc-900/40 backdrop-blur-md border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-500 flex flex-col h-full overflow-hidden group shadow-2xl">
      <div className="p-8 flex-1 flex flex-col relative">
        <div className="flex justify-between items-start mb-6">
          <Badge variant="outline" className={cn(getRiskColor(bot.riskLevel), "border-0 font-mono tracking-widest text-[10px] font-black px-2 py-1 uppercase")}>
            {bot.riskLevel} RISK
          </Badge>
          <div className="flex items-center text-emerald-400 text-xs font-mono font-black tracking-tighter">
            <Zap className="w-3.5 h-3.5 mr-1.5 fill-emerald-400/20" />
            CAP: {bot.dailyCapPercentage}%
          </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-3 tracking-tighter group-hover:text-emerald-400 transition-colors">{bot.name}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-1 font-medium">
          {bot.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-zinc-950/30 rounded-2xl border border-white/5 group-hover:bg-zinc-950/50 transition-colors">
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Type</div>
            <div className="text-sm font-bold text-zinc-300">{bot.type}</div>
          </div>
          <div className="p-4 bg-zinc-950/30 rounded-2xl border border-white/5 group-hover:bg-zinc-950/50 transition-colors">
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status</div>
            <div className="text-sm font-bold text-emerald-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              {bot.status}
            </div>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-900/20 group-hover:shadow-emerald-500/20 transition-all duration-300 border-0 active:scale-[0.98]">
              Deploy Bot <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Allocate Capital to {bot.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                Expected daily return up to {bot.dailyCapPercentage}%. Capital is locked for 24h cycles.
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000.00"
                    className="pl-7 bg-zinc-950 border-zinc-700 focus-visible:ring-emerald-500 font-mono text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
              <Button 
                onClick={handleAllocate} 
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[100px]"
              >
                {isPending ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
