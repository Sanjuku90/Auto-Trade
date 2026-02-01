import { usePortfolio } from "@/hooks/use-portfolio";
import { Navigation } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { TransactionTable } from "@/components/TransactionTable";
import { Button } from "@/components/ui/button";
import { Activity, Zap, ShieldAlert, ArrowRightLeft, Wallet, TrendingUp, PiggyBank, Plus, Minus, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useDeposit, useWithdraw } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { DEPOSIT_ADDRESS } from "@shared/routes";
import { TradeChart } from "@/components/TradeChart";
import { PositionList } from "@/components/PositionList";

function ActionDialog({ type }: { type: "deposit" | "withdraw" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<"USDT_TRC20" | "TRON_TRX">("USDT_TRC20");
  const [walletAddress, setWalletAddress] = useState("");
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const { toast } = useToast();
  
  const isDeposit = type === "deposit";

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast({ title: "Invalid Amount", variant: "destructive" });
      return;
    }

    if (isDeposit) {
      deposit.mutate(
        { amount },
        {
          onSuccess: () => {
            toast({ title: "Success", description: "Deposit request submitted." });
            setIsOpen(false);
            setAmount("");
          },
          onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" })
        }
      );
    } else {
      if (!walletAddress || walletAddress.length < 10) {
        toast({ title: "Invalid Address", description: "Please enter a valid wallet address", variant: "destructive" });
        return;
      }
      withdraw.mutate(
        { amount, network, walletAddress },
        {
          onSuccess: () => {
            toast({ title: "Success", description: "Withdrawal request submitted." });
            setIsOpen(false);
            setAmount("");
            setWalletAddress("");
          },
          onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" })
        }
      );
    }
  };
  
  const isPending = isDeposit ? deposit.isPending : withdraw.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isDeposit ? "default" : "outline"} 
          className={isDeposit 
            ? "bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-6 rounded-xl font-black uppercase tracking-widest text-xs border-0 shadow-lg shadow-emerald-900/20" 
            : "border-zinc-800 text-zinc-400 hover:bg-zinc-900 h-11 px-6 rounded-xl font-black uppercase tracking-widest text-xs"
          }
        >
          {isDeposit ? <Plus className="w-4 h-4 mr-2" /> : <Minus className="w-4 h-4 mr-2" />}
          {isDeposit ? "Dépôt" : "Retrait"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">{isDeposit ? "Initialiser un Dépôt" : "Demander un Retrait"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {isDeposit && (
              <div className="space-y-3 p-4 bg-zinc-950 border border-white/5 rounded-2xl">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Réseau Cible : USDT (TRC20)</Label>
                <div className="flex items-center gap-2 p-3 bg-zinc-900 rounded-xl border border-white/5">
                  <code className="font-mono text-emerald-400 text-xs break-all flex-1">{DEPOSIT_ADDRESS}</code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400"
                    onClick={() => {
                      navigator.clipboard.writeText(DEPOSIT_ADDRESS);
                      toast({ title: "Copié", description: "Adresse copiée dans le presse-papiers" });
                    }}
                    data-testid="button-copy-deposit-address"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed">Vérification Système : Les actifs seront crédités après confirmation du réseau.</p>
              </div>
          )}
          {!isDeposit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="network" className="text-xs font-black uppercase tracking-widest text-zinc-500">Destination Network</Label>
                <Select value={network} onValueChange={(v) => setNetwork(v as "USDT_TRC20" | "TRON_TRX")}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12 rounded-xl font-bold" data-testid="select-network">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                    <SelectItem value="USDT_TRC20" className="rounded-lg">USDT (TRC20)</SelectItem>
                    <SelectItem value="TRON_TRX" className="rounded-lg">TRON (TRX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="walletAddress" className="text-xs font-black uppercase tracking-widest text-zinc-500">Wallet Address</Label>
                <Input 
                  id="walletAddress" 
                  type="text" 
                  value={walletAddress} 
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 font-mono h-12 rounded-xl focus-visible:ring-emerald-500"
                  placeholder="Enter address"
                  data-testid="input-wallet-address"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-zinc-500">Amount (USD)</Label>
            <Input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-950 border-zinc-800 font-mono text-xl h-14 rounded-xl focus-visible:ring-emerald-500"
              placeholder="0.00"
              data-testid="input-amount"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-xs h-11 text-zinc-500">Abort</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-xs h-11 px-8 shadow-xl shadow-emerald-900/20"
          >
            {isPending ? "Executing..." : "Confirm Transaction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = usePortfolio();

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex">
      <Navigation />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">APERÇU DU TERMINAL</h1>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">STATUT RÉSEAU : PERFORMANCE OPTIMALE</p>
            </div>
          </div>
          <div className="flex gap-4">
            <ActionDialog type="withdraw" />
            <ActionDialog type="deposit" />
          </div>
        </header>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            label="Évaluation Totale" 
            value={`$${parseFloat(data?.totalBalance || "0").toLocaleString(undefined, {minimumFractionDigits: 2})}`}
            trend="up"
            trendValue="+12.4%"
            icon={<Wallet className="w-5 h-5" />}
          />
          <StatCard 
            label="Performance du Jour" 
            value="+2.4%"
            trend="up"
            trendValue="+0.8%"
            icon={<Zap className="w-5 h-5" />}
          />
          <StatCard 
            label="Nœuds Actifs" 
            value={data?.allocations.length.toString() || '0'}
            subValue="Opérationnel 24/7"
            icon={<ShieldAlert className="w-5 h-5" />}
          />
          <StatCard 
            label="Profit Total" 
            value={`$${parseFloat(data?.totalProfit || "0").toLocaleString(undefined, {minimumFractionDigits: 2})}`}
            trend="up"
            trendValue="+12.5%" 
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* Trade Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <TradeChart />
          </div>
          <div className="lg:col-span-1">
             <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 h-full shadow-2xl group hover:border-emerald-500/20 transition-all duration-500">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Network Insight</div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">STATUT DES NŒUDS</h3>
                <div className="space-y-6">
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed italic">"Infrastructure de trading mondiale signalant une disponibilité de 99,9 %. Latence stabilisée sur tous les clusters d'exécution."</p>
                  <Button variant="outline" className="w-full h-12 rounded-xl border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white font-black uppercase tracking-widest text-xs transition-all" asChild>
                    <a href="/bots">Voir le Marché des Bots</a>
                  </Button>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Positions des Nœuds en Direct</h3>
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Temps réel</span>
              </div>
            </div>
            <PositionList />
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Grand Livre du Réseau</h3>
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white" asChild>
                <a href="/transactions">Tout voir</a>
              </Button>
            </div>
            <TransactionTable transactions={data?.recentTransactions || []} limit={6} />
          </div>
        </div>
      </main>
    </div>
  );
}
