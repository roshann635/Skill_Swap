"use client";

import Navbar from "@/components/Navbar";
import { Zap, ArrowUpRight, ArrowDownLeft, History, Wallet as WalletIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function WalletPage() {
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!clerkUser) return;
      try {
        // Sync/Fetch user profile
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId: clerkUser.id }),
        });
        if (userRes.ok) {
          const user = await userRes.json();
          setDbUser(user);
          
          // Fetch transactions
          const txRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/user/${user.id}`);
          if (txRes.ok) {
            setTransactions(await txRes.json());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clerkUser]);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Contribution Log</h1>
          <p className="text-gray-500">Track your history of help given and received</p>
        </div>

        {/* Activity Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[32px] mb-12 relative overflow-hidden group border border-primary/20"
        >
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
               <History className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your Campus Contribution</h2>
              <p className="text-gray-500">Every task you resolve strengthens our campus community.</p>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
        </motion.div>

        {/* Transactions */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl"></div>)
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 glass-card rounded-2xl text-gray-500 border-dashed border-white/10">
                No history yet. Be a helper on the Feed to start your log!
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      tx.type === 'ESCROW' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {tx.type === 'ESCROW' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-white capitalize">{tx.type.toLowerCase()}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.fromUserId === dbUser?.id ? 'text-gray-400' : 'text-primary'}`}>
                    {tx.fromUserId === dbUser?.id ? 'SENT' : 'RESOLVED'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
