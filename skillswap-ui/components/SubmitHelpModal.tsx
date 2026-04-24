"use client";

import { useState } from "react";
import { X, Upload, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SubmitHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId: string;
}

export default function SubmitHelpModal({ isOpen, onClose, onSuccess, requestId }: SubmitHelpModalProps) {
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFileUrl("");
    setFileName("");
    setNote("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // For the demo, we simulate file upload by just sending the name and a mock URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs/${requestId}/submit?fileUrl=${encodeURIComponent(fileUrl || "https://skillswap.file/demo")}&fileName=${encodeURIComponent(fileName || "notes.pdf")}&note=${encodeURIComponent(note)}`, {
        method: "POST",
      });

      if (response.ok) {
        onSuccess();
        handleClose();
        alert("Help submitted successfully!");
      } else {
        const errorText = await response.text();
        alert("Failed to submit: " + errorText);
      }
    } catch (error: any) {
      console.error("Error submitting solution:", error);
      alert("Network Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md glass-card rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary border border-primary/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-none mb-1">Submit Solution</h3>
                  <p className="text-xs text-primary font-bold tracking-wider uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Active
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated chat area */}
            <div className="flex-1 bg-black/40 p-6 flex flex-col justify-end min-h-[200px]">
               <div className="bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full self-center mb-6">
                 Discussion Started
               </div>
               
               <div className="self-start bg-white/10 border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] shadow-sm mb-4">
                  <p className="font-bold text-primary text-xs mb-1">Requester</p>
                  Thanks for accepting! Let me know if you need any clarification about the request.
               </div>
            </div>

            {/* Input Form */}
            <div className="bg-black/60 border-t border-white/10 p-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                
                {/* Simulated File Attachment */}
                <div className="flex items-center gap-2 px-3 py-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-primary transition-colors">
                   <Upload className="w-4 h-4 text-gray-400" />
                   <input
                    required
                    type="text"
                    placeholder="Document Name (e.g. Notes.pdf)"
                    className="bg-transparent text-sm text-white outline-none w-full placeholder-gray-500"
                    onChange={(e) => setFileName(e.target.value)}
                   />
                </div>
                
                <div className="flex items-center gap-2 px-3 py-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-primary transition-colors">
                   <span className="text-gray-400 text-xs font-bold font-mono">🔗</span>
                   <input
                    type="url"
                    placeholder="Drive Link or File URL"
                    className="bg-transparent text-sm text-white outline-none w-full placeholder-gray-500"
                    onChange={(e) => setFileUrl(e.target.value)}
                   />
                </div>

                <div className="flex gap-2 items-center mt-2">
                  <textarea
                    required
                    rows={1}
                    placeholder="Type a message..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white outline-none text-sm resize-none focus:border-primary transition-colors placeholder-gray-500"
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-12 h-12 shrink-0 bg-primary rounded-full font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {isSubmitting ? "..." : <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 translate-x-0.5"><path d="M5 12h14M19 12l-6-6M19 12l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
