"use client";

import Navbar from "@/components/Navbar";
import { History, Zap, CheckCircle2, MessageSquare, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

export default function ActivityLogPage() {
  const { user: clerkUser } = useUser();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clerkUser) return;
      try {
        setIsLoading(true);
        // Sync user first
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId: clerkUser.id }),
        });
        const userData = await userRes.json();
        setDbUser(userData);

        // Fetch activities
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${userData.id}`);
        if (res.ok) {
          setActivities(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clerkUser]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'REQUEST': return <Zap className="w-4 h-4 text-primary" />;
      case 'CONTRIBUTION': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case 'CHAT': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      default: return <History className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Activity Log</h1>
          </div>
          <p className="text-gray-500">Track your contributions and campus interactions</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-[32px] border-dashed">
            <p className="text-gray-500 text-lg">No activities recorded yet. Start helping out to build your log!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/10 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.description}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-[10px] font-black text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5 uppercase tracking-widest">
                  {activity.type}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
