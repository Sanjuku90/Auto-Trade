import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { api, buildUrl, DEPOSIT_ADDRESS } from "@shared/routes";
import { CheckCircle, XCircle, ArrowLeft, Users, Clock, Copy } from "lucide-react";
import { format } from "date-fns";

interface PendingTransaction {
  id: number;
  userId: string;
  type: string;
  amount: string;
  status: string;
  description: string | null;
  createdAt: string | null;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}

interface UserWithWallet {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  wallet: {
    userId: string;
    balance: string;
    totalProfit: string;
  } | null;
}

function usePendingTransactions() {
  return useQuery<PendingTransaction[]>({
    queryKey: [api.admin.pendingTransactions.list.path],
  });
}

function useAllUsers() {
  return useQuery<UserWithWallet[]>({
    queryKey: [api.admin.allUsers.list.path],
  });
}

function useApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest(api.admin.pendingTransactions.approve.method, buildUrl(api.admin.pendingTransactions.approve.path, { id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.pendingTransactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.allUsers.list.path] });
    },
  });
}

function useReject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest(api.admin.pendingTransactions.reject.method, buildUrl(api.admin.pendingTransactions.reject.path, { id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.pendingTransactions.list.path] });
    },
  });
}

export default function Admin() {
  const { data: pendingTx, isLoading: loadingTx } = usePendingTransactions();
  const { data: users, isLoading: loadingUsers } = useAllUsers();
  const approve = useApprove();
  const reject = useReject();
  const { toast } = useToast();

  const handleApprove = (id: number) => {
    approve.mutate(id, {
      onSuccess: () => toast({ title: "Approved", description: "Transaction approved successfully." }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleReject = (id: number) => {
    reject.mutate(id, {
      onSuccess: () => toast({ title: "Rejected", description: "Transaction rejected." }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    toast({ title: "Copied", description: "Deposit address copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/dashboard" data-testid="link-back-dashboard">
              <ArrowLeft className="w-5 h-5" />
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-zinc-400">Manage transactions and users</p>
          </div>
        </header>

        <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-wrap items-center gap-4">
          <span className="text-zinc-400 text-sm">Deposit Address (TRON TRC20):</span>
          <code className="font-mono text-emerald-400 text-sm bg-zinc-950 px-3 py-1 rounded">
            {DEPOSIT_ADDRESS}
          </code>
          <Button variant="ghost" size="icon" onClick={copyAddress} data-testid="button-copy-address">
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-white">Pending Requests</CardTitle>
              <Clock className="w-5 h-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-mono font-bold text-amber-400">
                {pendingTx?.length || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-white">Total Users</CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-mono font-bold text-blue-400">
                {users?.length || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-white">Total Deposits</CardTitle>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-mono font-bold text-emerald-400">
                ${users?.reduce((sum, u) => sum + parseFloat(u.wallet?.balance || "0"), 0).toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTx ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : pendingTx?.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No pending transactions</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTx?.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-white">
                              {tx.user.firstName || tx.user.lastName 
                                ? `${tx.user.firstName || ""} ${tx.user.lastName || ""}`.trim()
                                : "Unknown"}
                            </p>
                            <p className="text-xs text-zinc-500">{tx.user.email || tx.user.id.slice(0, 8)}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant="outline" 
                            className={tx.type === "DEPOSIT" 
                              ? "border-emerald-600 text-emerald-400" 
                              : "border-rose-600 text-rose-400"
                            }
                          >
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-white">
                          ${parseFloat(tx.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          {tx.createdAt ? format(new Date(tx.createdAt), "MMM d, HH:mm") : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500"
                              disabled={approve.isPending}
                              onClick={() => handleApprove(tx.id)}
                              data-testid={`button-approve-${tx.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-600 text-rose-400 hover:bg-rose-900/20"
                              disabled={reject.isPending}
                              onClick={() => handleReject(tx.id)}
                              data-testid={`button-reject-${tx.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : users?.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No users yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-right py-3 px-4">Balance</th>
                      <th className="text-right py-3 px-4">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="py-3 px-4">
                          <p className="font-medium text-white">
                            {user.firstName || user.lastName 
                              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                              : "Unknown"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          {user.email || "-"}
                        </td>
                        <td className="py-3 px-4 font-mono text-white text-right">
                          ${parseFloat(user.wallet?.balance || "0").toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400 text-right">
                          ${parseFloat(user.wallet?.totalProfit || "0").toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
