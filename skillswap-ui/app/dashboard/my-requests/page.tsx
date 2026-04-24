"use client";

import Navbar from "@/components/Navbar";
import { LayoutDashboard, CheckCircle2, Clock, Inbox, Zap, FileText, ChevronDown, ChevronUp, QrCode, ScanLine } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function MyRequestsPage() {
  const { user: clerkUser } = useUser();
  const [requestedTasks, setRequestedTasks] = useState<any[]>([]);
  const [providedTasks, setProvidedTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!clerkUser) return;
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId: clerkUser.id }),
        });
        if (userRes.ok) {
          const user = await userRes.json();
          const [reqRes, provRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/user/${user.id}/requested`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/user/${user.id}/provided`)
          ]);
          setRequestedTasks(await reqRes.json());
          setProvidedTasks(await provRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clerkUser]);

  const handleReleaseCredits = async (requestId: string) => {
    if (!confirm("Are you sure you want to mark this as resolved?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/${requestId}/complete`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Request marked as resolved! 🎉");
        window.location.reload();
      } else {
        const errorText = await res.text();
        alert("Failed: " + errorText);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to complete request.");
    }
  };

  const handleVerifyQR = async (requestId: string, qrToken: string) => {
      try {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clerkId: clerkUser!.id }),
          });
          const user = await userRes.json();

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/${requestId}/verify?qrToken=${qrToken}&scannerId=${user.id}`, {
              method: 'POST'
          });
          
          if (res.ok) {
              alert("Handshake Successful! Task Verified! 🤝");
              window.location.reload();
          } else {
              alert("Handshake Failed: " + await res.text());
          }
      } catch (err) {
          console.error(err);
      }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Requests</h1>
            <p className="text-gray-500">Manage your active help requests and contributions</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Section: Bounties I Posted */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Inbox className="w-5 h-5" />
                <h2 className="text-xl font-bold">Help I Requested</h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{requestedTasks.length}</span>
              </div>
              
              <div className="space-y-4">
                {requestedTasks.length === 0 ? (
                  <div className="glass-card p-10 text-center text-gray-500 rounded-3xl border-dashed">
                    You haven't requested any help yet.
                  </div>
                ) : (
                  requestedTasks.map((req) => (
                    <RequestCard 
                      key={req.id} 
                      req={req} 
                      isOwner={true}
                      onRelease={handleReleaseCredits}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Section: My Contributions */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-accent">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="text-xl font-bold">Help I Provided</h2>
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">{providedTasks.length}</span>
              </div>

              <div className="space-y-4">
                {providedTasks.length === 0 ? (
                  <div className="glass-card p-10 text-center text-gray-500 rounded-3xl border-dashed">
                    No active help provided yet. Check the feed to assist someone!
                  </div>
                ) : (
                  providedTasks.map((req) => (
                    <RequestCard 
                      key={req.id} 
                      req={req} 
                      isOwner={false}
                      onVerifyQR={handleVerifyQR}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function RequestCard({ req, isOwner, onRelease, onVerifyQR }: { req: any; isOwner: boolean; onRelease?: (id: string) => void; onVerifyQR?: (id: string, token: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
      if (showScanner) {
          const scanner = new Html5QrcodeScanner(`reader-${req.id}`, { fps: 10, qrbox: { width: 250, height: 250 } }, false);
          scanner.render((decodedText) => {
              scanner.clear();
              setShowScanner(false);
              if (onVerifyQR) onVerifyQR(req.id, decodedText);
          }, (err) => { /* ignore */ });

          return () => { scanner.clear().catch(e => console.log(e)); };
      }
  }, [showScanner]);

  const statusColors: Record<string, string> = {
    OPEN: "text-green-400 bg-green-400/10",
    IN_PROGRESS: "text-yellow-400 bg-yellow-400/10",
    COMPLETED: "text-blue-400 bg-blue-400/10",
    CANCELLED: "text-red-400 bg-red-400/10",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-6 rounded-2xl group hover:border-white/20 transition-all border border-white/5"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
            <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest bg-white/5 px-2 py-1 rounded-md">
                {req.department || 'General'}
            </span>
            <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md ${
                req.type === 'NOTES' ? 'text-blue-400 bg-blue-400/10' : 
                req.type === 'MENTORSHIP' ? 'text-purple-400 bg-purple-400/10' : 
                'text-gray-500 bg-white/5'
            }`}>
                {req.type || 'TASK'}
            </span>
        </div>
        <div className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md ${statusColors[req.status] || 'text-gray-500 bg-white/5'}`}>
           {req.status}
        </div>
      </div>
      <h3 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">{req.title}</h3>
      <p className="text-xs text-gray-500 mb-4 line-clamp-1">{req.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <Clock className="w-3 h-3" />
          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-1"
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-white/5 space-y-3"
        >
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Full Description</p>
            <p className="text-sm text-gray-400">{req.description || 'No description provided.'}</p>
          </div>
          {req.category && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Category</p>
              <p className="text-sm text-gray-400">{req.category}</p>
            </div>
          )}
          {req.solutionNote && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Solution Note</p>
              <p className="text-sm text-gray-400">{req.solutionNote}</p>
            </div>
          )}
          {req.fileUrl && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Attached File</p>
              <a href={req.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                {req.fileName || 'View File'} ↗
              </a>
            </div>
          )}
        </motion.div>
      )}

      {/* Mark as Resolved button OR QR Display for Requester */}
      {req.status === 'IN_PROGRESS' && isOwner && onRelease && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden relative">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{req.fileName || "Solution Shared"}</p>
                <p className="text-[10px] text-gray-500">Ready for verification</p>
              </div>
            </div>
            
            <div className="flex gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="bg-white/10 px-3 py-2 rounded-lg text-[10px] font-bold text-white hover:opacity-90 transition-all flex items-center gap-1"
                >
                  <QrCode className="w-3 h-3" />
                  Show QR
                </button>
                <button 
                  onClick={() => onRelease(req.id)}
                  className="bg-primary px-3 py-2 rounded-lg text-[10px] font-bold text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Mark as Resolved
                </button>
            </div>
          </div>

          {/* Expanded QR Display */}
          {isExpanded && req.qrToken && (
              <div className="mt-4 pt-4 border-t border-primary/20 flex flex-col items-center">
                  <p className="text-xs text-white font-bold mb-3">Ask the helper to scan this QR code</p>
                  <div className="p-4 bg-white rounded-2xl">
                      <QRCodeSVG value={req.qrToken} size={150} />
                  </div>
              </div>
          )}
          
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-xl opacity-50 pointer-events-none"></div>
        </div>
      )}

      {/* QR Scanner for Provider */}
      {req.status === 'IN_PROGRESS' && !isOwner && onVerifyQR && (
          <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-xl overflow-hidden relative">
             <div className="flex items-center justify-between relative z-10">
                 <div>
                    <p className="text-xs font-bold text-white">Handshake Verification</p>
                    <p className="text-[10px] text-gray-500">Scan the requester's QR to finalize</p>
                 </div>
                 <button 
                  onClick={() => setShowScanner(!showScanner)}
                  className="bg-accent px-3 py-2 rounded-lg text-[10px] font-bold text-black hover:opacity-90 transition-all flex items-center gap-1"
                >
                  <ScanLine className="w-3 h-3" />
                  Scan QR
                </button>
             </div>
             
             {showScanner && (
                 <div className="mt-4 pt-4 border-t border-accent/20">
                     <div id={`reader-${req.id}`} className="bg-white rounded-xl overflow-hidden"></div>
                 </div>
             )}
             <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 blur-xl opacity-50 pointer-events-none"></div>
          </div>
      )}
    </motion.div>
  );
}
