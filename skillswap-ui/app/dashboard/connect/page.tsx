"use client";

import Navbar from "@/components/Navbar";
import { Users, Shield, MessageSquare, Zap, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

export default function SeniorsPage() {
  const { user: clerkUser } = useUser();
  const [seniors, setSeniors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUser, setDbUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  useEffect(() => {
    const fetchSeniors = async () => {
      if (!clerkUser) return;
      try {
        setIsLoading(true);
        // Sync user first to get their year
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId: clerkUser.id }),
        });
        const userData = await userRes.json();
        setDbUser(userData);

        // Fetch all students
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/seniors`);
        if (res.ok) {
          setSeniors(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeniors();
  }, [clerkUser]);

  const filteredSeniors = seniors.filter(senior => {
    const matchesSearch = searchQuery === "" ||
      (senior.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (senior.bio || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (senior.department || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = branchFilter === "All" ||
      (senior.department || '').toLowerCase() === branchFilter.toLowerCase();

    return matchesSearch && matchesBranch;
  });

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Campus Connect</h1>
          </div>
          <p className="text-gray-500">Connect with students across all years for help and advice</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search students by name, bio, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <select 
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white outline-none"
          >
            <option value="All" className="text-gray-900 bg-white">All Branches</option>
            <option value="Computer" className="text-gray-900 bg-white">Computer</option>
            <option value="IT" className="text-gray-900 bg-white">IT</option>
            <option value="AIDS" className="text-gray-900 bg-white">AIDS</option>
            <option value="Mechanical" className="text-gray-900 bg-white">Mechanical</option>
            <option value="Civil" className="text-gray-900 bg-white">Civil</option>
            <option value="Electrical" className="text-gray-900 bg-white">Electrical</option>
            <option value="Robotics" className="text-gray-900 bg-white">Robotics</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-[32px]"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeniors.length === 0 ? (
              <div className="col-span-full py-20 text-center glass-card rounded-[40px] border-dashed">
                <p className="text-gray-500 mb-4">
                  {searchQuery || branchFilter !== "All" ? "No students match your filters." : "No students found."}
                </p>
                {(searchQuery || branchFilter !== "All") && (
                  <button 
                    onClick={() => { setSearchQuery(""); setBranchFilter("All"); }} 
                    className="text-primary font-bold hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : filteredSeniors.map((senior) => (
              <motion.div 
                key={senior.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-[32px] border border-white/10 relative overflow-hidden group hover:border-primary/40 transition-all"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl border border-white/10 flex items-center justify-center text-2xl font-bold text-white">
                      {senior.name ? senior.name[0].toUpperCase() : 'S'}
                    </div>
                    <div className="flex flex-col items-end">
                      {(() => {
                        const years = ["FE", "SE", "TE", "BE"];
                        const myIdx = years.indexOf(dbUser?.academicYear || "FE");
                        const targetIdx = years.indexOf(senior.academicYear || "FE");
                        
                        let tag = "Student";
                        let color = "text-gray-400 bg-white/10 border-white/10";
                        
                        if (targetIdx > myIdx) {
                          tag = "Senior";
                          color = "text-primary bg-primary/10 border-primary/20";
                        } else if (targetIdx === myIdx) {
                          tag = "Batchmate";
                          color = "text-blue-400 bg-blue-400/10 border-blue-400/20";
                        } else {
                          tag = "Junior";
                          color = "text-green-400 bg-green-400/10 border-green-400/20";
                        }

                        return (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border mb-1 ${color}`}>
                            {tag} ({senior.academicYear || 'FE'})
                          </span>
                        );
                      })()}
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-400">
                        <Shield className="w-3 h-3 text-green-400" />
                        {senior.trustScore ?? 0}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{senior.name || 'New Student'}</h3>
                  <p className="text-sm text-primary font-medium mb-4">{senior.department || 'Undecided'} Branch</p>
                  <p className="text-sm text-gray-500 mb-8 line-clamp-2">{senior.bio || 'Ready to help and connect on SkillSwap!'}</p>

                  <button 
                    onClick={() => {
                      window.location.href = `/dashboard/chat/${senior.id}`;
                    }}
                    className="w-full bg-white/5 hover:bg-primary py-3 rounded-2xl font-bold text-white border border-white/10 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Reach Out
                  </button>
                </div>
                
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all"></div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
