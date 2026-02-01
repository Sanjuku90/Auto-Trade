import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Cpu, ShieldCheck, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Landing() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 font-sans antialiased">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-mono font-black text-white text-xl">A</span>
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">AUTOTRADE</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Logic</a>
              <a href="#technology" className="hover:text-emerald-400 transition-colors">Tech</a>
              <a href="#performance" className="hover:text-emerald-400 transition-colors">Stats</a>
            </nav>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 rounded-xl uppercase tracking-widest text-[10px] h-11 border-0">
                  Terminal <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <a href="/api/login">
                <Button variant="outline" className="border-zinc-800 hover:bg-zinc-900 text-white font-black px-6 rounded-xl uppercase tracking-widest text-[10px] h-11 transition-all">
                  Access Portal
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            Live Network Status: Operational
          </div>
          
          <h1 className="text-6xl md:text-[110px] font-black tracking-[calc(-0.06em)] leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 uppercase text-white">
            AUTONOMIE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500">
              QUANTITATIVE
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 font-medium italic">
            "Des stratégies de trading algorithmique de niveau institutionnel, accessibles via une interface terminale simplifiée. Une transparence absolue dans chaque exécution."
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <a href="/api/login">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white h-16 px-12 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-emerald-900/40 active:scale-95 transition-all border-0">
                Initialiser le Compte
              </Button>
            </a>
            <Button variant="outline" size="lg" className="border-zinc-800 hover:bg-zinc-900 text-white h-16 px-12 text-xs font-black uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all">
              Vérifier les Performances
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
          {[
            { label: "Volume du Réseau", value: "$4.2M+", detail: "Derniers 30 Jours" },
            { label: "Objectif de Rendement", value: "16.8%", detail: "Performance Mensuelle Moyenne", highlight: true },
            { label: "Disponibilité du Cœur", value: "99.9%", detail: "Clusters Haute Disponibilité" }
          ].map((stat, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-md group hover:border-emerald-500/20 transition-all duration-700 shadow-2xl">
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 group-hover:text-emerald-500/50 transition-colors">{stat.label}</div>
              <div className={cn("text-6xl font-black tracking-tighter mb-3", stat.highlight ? "text-emerald-400" : "text-white")}>{stat.value}</div>
              <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none">{stat.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950 -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {[
              { 
                icon: Cpu, 
                title: "PRÉCISION ALGORITHMIQUE", 
                desc: "Zéro interférence émotionnelle. Des modèles de probabilité mathématique exécutés sur les bourses mondiales avec une précision à la sous-milliseconde." 
              },
              { 
                icon: ShieldCheck, 
                title: "APPLICATION DU RISQUE", 
                desc: "Les protocoles de stop-loss obligatoires et les plafonds de profit automatisés (16-18%) priorisent la préservation du capital dans tous les régimes de marché." 
              },
              { 
                icon: LineChart, 
                title: "REGISTRE IMMUABLE", 
                desc: "Audit en temps réel de chaque exécution. Mesures de performance transparentes et historique complet des transactions." 
              }
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-lg">
                  <f.icon className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black mb-4 tracking-tighter uppercase text-white group-hover:text-emerald-400 transition-colors">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium italic text-sm">
                  "{f.desc}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-24 bg-zinc-950 overflow-hidden relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner">
              <span className="font-mono font-black text-emerald-500 text-xl">A</span>
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">AUTOTRADE</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-emerald-400 transition-colors">Protocoles de Confidentialité</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Conditions d'Utilisation</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Gouvernance des Risques</a>
          </div>

          <p className="max-w-3xl text-[10px] text-zinc-700 font-bold uppercase tracking-widest leading-loose opacity-60 italic">
            "Le trading sur les marchés financiers comporte des variables à haut risque. La performance du système est mesurée par des modèles de probabilité. La préservation du capital est l'objectif principal mais ne peut être garantie en cas de turbulence extrême du marché."
          </p>

          <div className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mt-8">
            © 2026 AUTOTRADE CORE. TOUS LES SYSTÈMES SONT OPÉRATIONNELS.
          </div>
        </div>
      </footer>
    </div>
  );
}
