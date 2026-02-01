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
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 flex flex-col h-full overflow-hidden group">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <Badge variant="outline" className={`${getRiskColor(bot.riskLevel)} border-0 font-mono tracking-wider text-xs`}>
            {bot.riskLevel} RISK
          </Badge>
          <div className="flex items-center text-emerald-400 text-sm font-mono font-medium">
            <Zap className="w-3 h-3 mr-1" />
            Cap: {bot.dailyCapPercentage}%
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{bot.name}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">
          {bot.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-white/5">
            <div className="text-xs text-zinc-500 mb-1">Type</div>
            <div className="text-sm font-medium text-zinc-200">{bot.type}</div>
          </div>
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-white/5">
            <div className="text-xs text-zinc-500 mb-1">Status</div>
            <div className="text-sm font-medium text-emerald-500 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              {bot.status}
            </div>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 group-hover:shadow-emerald-900/40 transition-all">
              Start Trading <ArrowRight className="w-4 h-4 ml-2" />
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
