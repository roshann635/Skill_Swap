"use client";

import Navbar from "@/components/Navbar";
import { BookOpen, Zap, Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CreateGigModal from "@/components/CreateGigModal";
import SubmitHelpModal from "@/components/SubmitHelpModal";
import { useUser } from "@clerk/nextjs";

export default function NotesPage() {
  const { user: clerkUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notesRequests, setNotesRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUser, setDbUser] = useState<any>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/open`);
      if (res.ok) {
        const data = await res.json();
        setNotesRequests(data.filter((req: any) => req.type === "NOTES"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncUser = async () => {
    if (!clerkUser) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: clerkUser.id }),
      });
      if (res.ok) setDbUser(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleHelp = async (reqId: string) => {
    if (!dbUser) return alert("Please wait for sync...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/${reqId}/accept?providerId=${dbUser.id}`, { method: "POST" });
      if (res.ok) {
        setSelectedRequestId(reqId);
        setIsHelpModalOpen(true);
      } else {
        const errorMsg = await res.text();
        alert("Failed to accept: " + errorMsg);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    syncUser();
    fetchNotes();
  }, [clerkUser]);

  const filteredNotes = notesRequests.filter(req =>
    req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-white">Study Vault</h1>
            </div>
            <p className="text-gray-500">Exchange notes, lab manuals, and PYQs for campus support</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary px-6 py-3 rounded-2xl font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Request Notes
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search for subjects, units, or branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl"></div>)}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-[32px] border-dashed">
            <p className="text-gray-500 mb-4 text-lg">
              {searchQuery ? "No notes matching your search." : "The vault is quiet. No active notes requests."}
            </p>
            <button 
              onClick={() => { setSearchQuery(""); if (!searchQuery) setIsModalOpen(true); }} 
              className="text-primary font-bold hover:underline"
            >
              {searchQuery ? "Clear search" : "Be the first to request study material"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((req) => (
              <motion.div 
                key={req.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 rounded-3xl border border-white/10 hover:border-primary/40 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg border border-blue-400/20 uppercase tracking-widest">
                    Notes
                  </span>
                  <div className="flex items-center gap-1 text-primary font-bold text-xs">
                    ACTIVE
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{req.title}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{req.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{req.department}</span>
                  <button 
                    onClick={() => handleHelp(req.id)}
                    className="bg-white/5 hover:bg-primary/20 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center gap-1"
                  >
                    Share Material
                    <Zap className="w-3 h-3 text-primary" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <CreateGigModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchNotes} 
        dbUser={dbUser}
      />

      <SubmitHelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onSuccess={fetchNotes}
        requestId={selectedRequestId || ""}
      />
    </div>
  );
}
