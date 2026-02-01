import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Bot, 
  ArrowRightLeft, 
  LogOut, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const NavContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <span className="font-mono font-bold text-white text-lg">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">AutoTrade</span>
        </div>
        
        <div className="space-y-1">
          <Link href="/dashboard">
            <Button 
              variant={isActive("/dashboard") ? "secondary" : "ghost"} 
              className="w-full justify-start gap-3 text-base h-12"
            >
              <LayoutDashboard className="w-5 h-5" />
              Overview
            </Button>
          </Link>
          <Link href="/bots">
            <Button 
              variant={isActive("/bots") ? "secondary" : "ghost"} 
              className="w-full justify-start gap-3 text-base h-12"
            >
              <Bot className="w-5 h-5" />
              Bot Market
            </Button>
          </Link>
          <Link href="/transactions">
            <Button 
              variant={isActive("/transactions") ? "secondary" : "ghost"} 
              className="w-full justify-start gap-3 text-base h-12"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Transactions
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
            {user?.firstName?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate text-zinc-200">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 text-zinc-400 hover:text-zinc-100 border-zinc-800 hover:bg-zinc-900"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 w-64 h-screen z-40">
        <NavContent />
      </div>

      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-zinc-950 border-zinc-800 text-white">
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
