"use client";

import Navbar from "@/components/Navbar";
import CreateGigModal from "@/components/CreateGigModal";
import SubmitHelpModal from "@/components/SubmitHelpModal";
import CompleteProfileModal from "@/components/CompleteProfileModal";
import { Zap, Clock, Shield, Search, Filter, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { user: clerkUser } = useUser();
  const [openRequests, setOpenRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    activeMentors: 0,
    requestsResolved: 0,
    notesInVault: 0,
    avgResponseTime: "15m"
  });
  const [dbUser, setDbUser] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync user with Java Backend
  const syncUser = async () => {
    if (!clerkUser) return null;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          name: clerkUser.fullName,
          email: clerkUser.primaryEmailAddress?.emailAddress,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data);
        if (data.name) {
          localStorage.setItem('skillswap_user_name', data.name);
        }
        if (!data.academicYear) {
          setIsProfileModalOpen(true);
        }
        return data;
      } else {
        const errorData = await res.json();
        console.error("Backend Sync Error Details:", errorData);
      }
    } catch (err) {
      console.error("Network error during sync:", err);
    }
    return null;
  };

  const fetchRequestsAndStats = async () => {
    try {
      setIsLoading(true);
      const [gigRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/open`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/campus`)
      ]);
      
      if (gigRes.ok) {
        const data = await gigRes.json();
        setOpenRequests(data);
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${userId}`);
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  const handleHelp = async (reqId: string) => {
    let activeUser = dbUser;

    // If dbUser is missing, try to sync it immediately
    if (!activeUser && clerkUser) {
        console.log("On-demand sync triggered...");
        activeUser = await syncUser();
    }
    
    // Check again after (potential) sync
    if (!activeUser && !clerkUser) return alert("Please log in through Clerk first!");
    if (!activeUser) return alert("Still syncing with backend... Check terminal logs for Java DB errors.");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/${reqId}/accept?providerId=${activeUser.id}`, {
        method: "POST"
      });
      if (res.ok) {
        setSelectedRequestId(reqId);
        setIsHelpModalOpen(true);
      } else {
        const errorMsg = await res.text();
        alert("Failed to accept: " + errorMsg);
      }
    } catch (err) {
      console.error(err);
      alert("Network error connecting to Backend.");
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      if (!clerkUser) return;
      setIsLoading(true);
      const user = await syncUser();
      if (user) {
        fetchActivities(user.id);
      }
      await fetchRequestsAndStats();
    };
    initDashboard();
  }, [clerkUser]);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Help Frequency", value: "High 🔥", icon: Zap, color: "text-yellow-400" },
            { label: "Trust Score", value: dbUser ? `${dbUser.trustScore?.toFixed(1) ?? "0.0"}/10 ⭐` : "...", icon: Shield, color: "text-green-400" },
            { label: "Hours Swapped", value: "0h ⏳", icon: Clock, color: "text-blue-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Campus Pulse</h1>
            <p className="text-gray-500">Live activity and community helpers</p>
          </div>
          <div className="flex gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search skills or notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all w-full md:w-64"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary px-6 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Ask for Help
            </button>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Mentors", value: stats.activeMentors.toString(), sub: "Available now" },
            { label: "Requests Resolved", value: stats.requestsResolved.toString(), sub: "Campus wide" },
            { label: "Notes in Vault", value: stats.notesInVault.toString(), sub: "Across all depts" },
            { label: "Avg. Response", value: stats.avgResponseTime, sub: "Fast as lightning" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="glass-card p-4 rounded-3xl border border-white/5"
            >
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] text-primary font-bold">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area: Feed + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Feed */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : openRequests
                .filter(req => req.requesterId !== dbUser?.id)
                .filter(req => 
                  req.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (req.department || '').toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
              <div className="text-center py-20 glass-card p-10 rounded-3xl">
                <p className="text-gray-500 mb-4">No matching requests found.</p>
                <button onClick={() => setSearchQuery("")} className="text-primary font-bold hover:underline">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {openRequests
                  .filter(req => req.requesterId !== dbUser?.id)
                  .filter(req => 
                    req.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (req.department || '').toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 rounded-3xl group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary border border-primary/20">
                         {req.requesterName ? req.requesterName[0].toUpperCase() : 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-none mb-1">{req.requesterName || "Student"}</p>
                        <p className="text-[10px] font-bold text-gray-400">{req.requesterYear || 'FE'} • {req.requesterDepartment || req.department}</p>
                      </div>
                    </div>
                    {req.urgency && (
                      <div className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-lg border border-accent/20 animate-pulse">
                        URGENT
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight mb-2">
                    {req.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2">{req.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                       {req.category || "General Help"}
                    </div>
                    <button 
                      onClick={() => handleHelp(req.id)}
                      className="text-sm font-bold text-primary group-hover:underline underline-offset-4 flex items-center gap-1"
                    >
                      I can Help
                      <Zap className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              ))}
              </div>
            )}
          </div>

          {/* Sidebar: Activity Log */}
          <div className="hidden lg:block">
            <div className="glass-card p-6 rounded-3xl sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>
              
              <div className="space-y-6">
                {activities.length === 0 ? (
                  <p className="text-xs text-gray-500">No recent activity.</p>
                ) : activities.slice(0, 5).map((activity, i) => (
                  <div key={i} className="relative pl-6 border-l border-white/10">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,237,100,0.5)]"></div>
                    <p className="text-xs text-white font-medium mb-1">{activity.description}</p>
                    <p className="text-[10px] text-gray-500">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => window.location.href = '/dashboard/activity-log'}
                className="w-full mt-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                View Full Log
              </button>
            </div>
          </div>
        </div>
      </main>

      <CreateGigModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchRequestsAndStats}
        dbUser={dbUser}
      />

      <SubmitHelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onSuccess={fetchRequestsAndStats}
        requestId={selectedRequestId || ""}
      />

      <CompleteProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSuccess={(updatedUser) => setDbUser(updatedUser)}
        clerkUser={clerkUser}
      />
    </div>
  );
}
