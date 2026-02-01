import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Bot, 
  ArrowRightLeft, 
  LogOut, 
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const NavContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/50">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-mono font-black text-white text-xl">A</span>
          </div>
          <span className="font-black text-2xl tracking-tighter text-white uppercase">AUTOTRADE</span>
        </div>
        
        <div className="space-y-2">
          <Link href="/dashboard">
            <Button 
              variant={isActive("/dashboard") ? "secondary" : "ghost"} 
              className={cn(
                "w-full justify-start gap-3 text-xs font-black h-12 rounded-xl transition-all duration-200 uppercase tracking-widest",
                isActive("/dashboard") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              TABLEAU DE BORD
            </Button>
          </Link>
          <Link href="/bots">
            <Button 
              variant={isActive("/bots") ? "secondary" : "ghost"} 
              className={cn(
                "w-full justify-start gap-3 text-sm font-bold h-12 rounded-xl transition-all duration-200",
                isActive("/bots") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              <Bot className="w-5 h-5" />
              MARCHÉ DES BOTS
            </Button>
          </Link>
          <Link href="/transactions">
            <Button 
              variant={isActive("/transactions") ? "secondary" : "ghost"} 
              className={cn(
                "w-full justify-start gap-3 text-sm font-bold h-12 rounded-xl transition-all duration-200",
                isActive("/transactions") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              <ArrowRightLeft className="w-5 h-5" />
              HISTORIQUE
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner">
            <span className="text-sm font-black text-emerald-500">{user?.firstName?.[0] || "U"}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black truncate text-zinc-200 uppercase tracking-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-zinc-500 truncate font-bold uppercase tracking-widest opacity-60">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 text-zinc-500 hover:text-zinc-100 border-zinc-800 hover:bg-zinc-900 h-11 rounded-xl text-xs font-black uppercase tracking-widest"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block fixed left-0 top-0 w-64 h-screen z-40">
        <NavContent />
      </div>

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-11 w-11">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-zinc-950 border-zinc-800">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
