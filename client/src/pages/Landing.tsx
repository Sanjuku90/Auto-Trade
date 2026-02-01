import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  LineChart, 
  Cpu, 
  Globe, 
  Lock 
} from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect handled by user choice usually, but here we let them click "Dashboard"
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <span className="font-mono font-bold text-white text-xl">A</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">AutoTrade</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                  Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <a href="/api/login">
                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-white">
                  Client Login
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Operational • Daily Cap 16% Active
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Automated Wealth <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Without The Emotion
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Institutional-grade trading algorithms now available for personal portfolios. 
            Scalping, Trend Following, and Range strategies running 24/7 with strict risk management.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <a href="/api/login">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white h-14 px-8 text-lg shadow-xl shadow-emerald-900/20">
                Start Investing Now
              </Button>
            </a>
            <Button variant="outline" size="lg" className="border-zinc-700 hover:bg-zinc-900 text-white h-14 px-8 text-lg">
              View Performance
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm text-center">
            <div className="text-4xl font-mono font-bold text-white mb-2">$4.2M+</div>
            <div className="text-zinc-500 text-sm">Total Volume Traded</div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm text-center">
            <div className="text-4xl font-mono font-bold text-emerald-400 mb-2">16.8%</div>
            <div className="text-zinc-500 text-sm">Average Monthly Return</div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm text-center">
            <div className="text-4xl font-mono font-bold text-white mb-2">99.9%</div>
            <div className="text-zinc-500 text-sm">System Uptime</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                <Cpu className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Algorithmic Precision</h3>
              <p className="text-zinc-400 leading-relaxed">
                Zero emotional interference. Our bots execute trades based on mathematical probabilities and technical indicators.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Risk Management</h3>
              <p className="text-zinc-400 leading-relaxed">
                Strict stop-losses and daily profit caps (16-18%) ensure capital preservation across all market conditions.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                <LineChart className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Reporting</h3>
              <p className="text-zinc-400 leading-relaxed">
                Track your portfolio performance in real-time. Transparent transaction logs and daily profit statements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center">
              <span className="font-mono font-bold text-white text-xs">A</span>
            </div>
            <span className="font-bold text-lg tracking-tight">AutoTrade</span>
          </div>
          <div className="text-sm text-zinc-500">
            © 2024 AutoTrade Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 text-xs text-zinc-600 text-center max-w-3xl">
          Trading in financial markets involves a high degree of risk and may not be suitable for all investors. 
          Past performance is not indicative of future results. Please ensure you fully understand the risks involved.
        </div>
      </footer>
    </div>
  );
}
