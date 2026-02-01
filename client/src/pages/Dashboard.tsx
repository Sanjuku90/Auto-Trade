import { usePortfolio } from "@/hooks/use-portfolio";
import { Navigation } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { TransactionTable } from "@/components/TransactionTable";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, PiggyBank, Plus, Minus, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useDeposit, useWithdraw } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { DEPOSIT_ADDRESS } from "@shared/routes";

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
            ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
            : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }
        >
          {isDeposit ? <Plus className="w-4 h-4 mr-2" /> : <Minus className="w-4 h-4 mr-2" />}
          {isDeposit ? "Deposit" : "Withdraw"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>{isDeposit ? "Add Funds" : "Withdraw Funds"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isDeposit && (
            <div className="space-y-2 p-3 bg-zinc-950 border border-zinc-700 rounded-lg">
              <Label className="text-xs text-zinc-400">Send USDT (TRC20) to this address:</Label>
              <div className="flex items-center gap-2">
                <code className="font-mono text-emerald-400 text-xs break-all flex-1">{DEPOSIT_ADDRESS}</code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
                    toast({ title: "Copied", description: "Address copied to clipboard" });
                  }}
                  data-testid="button-copy-deposit-address"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-amber-500">After sending, enter the amount below to submit your request for approval.</p>
            </div>
          )}
          {!isDeposit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select value={network} onValueChange={(v) => setNetwork(v as "USDT_TRC20" | "TRON_TRX")}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-700" data-testid="select-network">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="USDT_TRC20">USDT (TRC20)</SelectItem>
                    <SelectItem value="TRON_TRX">TRON (TRX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address</Label>
                <Input 
                  id="walletAddress" 
                  type="text" 
                  value={walletAddress} 
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-zinc-950 border-zinc-700 font-mono"
                  placeholder="Enter your TRON wallet address"
                  data-testid="input-wallet-address"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-950 border-zinc-700 font-mono text-lg"
              placeholder="0.00"
              data-testid="input-amount"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {isPending ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = usePortfolio();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold text-rose-500">Error Loading Dashboard</h2>
        <p className="text-zinc-400">{error.message}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex">
      <Navigation />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-zinc-400">Welcome back. Here's your portfolio overview.</p>
          </div>
          <div className="flex gap-3">
            <ActionDialog type="withdraw" />
            <ActionDialog type="deposit" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="Total Balance" 
            value={`$${parseFloat(data?.totalBalance || "0").toFixed(2)}`}
            subValue="Available to trade"
            icon={<Wallet className="w-6 h-6" />}
            trend="neutral"
          />
          <StatCard 
            label="Total Profit" 
            value={`$${parseFloat(data?.totalProfit || "0").toFixed(2)}`}
            trend="up"
            trendValue="+12.5%" // Mock trend for now
            icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
            className="border-emerald-900/20 bg-emerald-900/5"
          />
          <StatCard 
            label="Active Allocations" 
            value={data?.allocations.length.toString() || "0"}
            subValue="Running Bots"
            icon={<PiggyBank className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Active Allocations</h3>
              <div className="space-y-4">
                {data?.allocations.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No active bots. Visit the Bot Market to start trading.</p>
                ) : (
                  data?.allocations.map((alloc) => (
                    <div key={alloc.id} className="flex justify-between items-center p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div>
                        <p className="font-medium text-white">{alloc.bot.name}</p>
                        <p className="text-xs text-zinc-500">{alloc.bot.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-emerald-400 font-medium">${alloc.amount}</p>
                        <p className="text-xs text-zinc-500">Allocated</p>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full mt-4 border-dashed border-zinc-700 hover:bg-zinc-800" asChild>
                  <a href="/bots">Add New Allocation</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
          <TransactionTable transactions={data?.recentTransactions || []} limit={5} />
        </div>
      </main>
    </div>
  );
}
