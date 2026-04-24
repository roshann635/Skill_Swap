"use client";

import { useState } from "react";
import { X, Zap, Clock, Info, Plus, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dbUser?: any;
}

const initialFormData = {
  title: "",
  description: "",
  category: "",
  credits: 1,
  department: "Computer",
  urgency: false,
  type: "REQUEST",
};

export default function CreateGigModal({ isOpen, onClose, onSuccess, dbUser }: CreateGigModalProps) {
  const [formData, setFormData] = useState({ ...initialFormData });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser) {
      alert("Wait for profile sync to complete...");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          requesterId: dbUser.id,
          requesterName: dbUser.name,
          requesterDepartment: dbUser.department,
          requesterYear: dbUser.academicYear,
        }),
      });

      if (response.ok) {
        onSuccess();
        handleClose();
        alert("Request posted successfully!");
      } else {
        const errorText = await response.text();
        alert("Failed to post request: " + (errorText || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Error posting request:", error);
      alert("Network Error: Make sure your Java backend is running! (" + error.message + ")");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ ...initialFormData });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass-card p-8 rounded-3xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center relative">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                Post a New Request
              </h2>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Request Type</label>
                <div className="flex gap-2">
                  {[
                    { value: "REQUEST", label: "Help Request", icon: "🤝" },
                    { value: "NOTES", label: "Study Notes", icon: "📚" },
                    { value: "MENTORSHIP", label: "Mentorship", icon: "🎓" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.value })}
                      className={`flex-1 py-3 px-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                        formData.type === t.value
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  placeholder="e.g. Help with Thermal Lab Report"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Branch / Dept</label>
                  <select
                    value={formData.department}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none"
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="" disabled className="text-gray-900 bg-white">Select Branch</option>
                    <option value="Computer" className="text-gray-900 bg-white">Computer</option>
                    <option value="IT" className="text-gray-900 bg-white">IT</option>
                    <option value="AIDS" className="text-gray-900 bg-white">AIDS</option>
                    <option value="Mechanical" className="text-gray-900 bg-white">Mechanical</option>
                    <option value="Civil" className="text-gray-900 bg-white">Civil</option>
                    <option value="Electrical" className="text-gray-900 bg-white">Electrical</option>
                    <option value="Robotics" className="text-gray-900 bg-white">Robotics</option>
                  </select>
                </div>
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select
                    value={formData.category}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="" className="text-gray-900 bg-white">General Help</option>
                    <option value="Programming" className="text-gray-900 bg-white">Programming</option>
                    <option value="Lab Work" className="text-gray-900 bg-white">Lab Work</option>
                    <option value="Assignments" className="text-gray-900 bg-white">Assignments</option>
                    <option value="Exam Prep" className="text-gray-900 bg-white">Exam Prep</option>
                    <option value="Project Help" className="text-gray-900 bg-white">Project Help</option>
                    <option value="Notes" className="text-gray-900 bg-white">Notes</option>
                    <option value="Other" className="text-gray-900 bg-white">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  placeholder="Describe your query or what you need help with..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Urgency Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${formData.urgency ? 'text-rose-400' : 'text-gray-500'}`} />
                  <div>
                    <p className="text-sm font-bold text-white">Mark as Urgent</p>
                    <p className="text-[11px] text-gray-500">Urgent requests are highlighted on the feed</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: !formData.urgency })}
                  className={`relative w-12 h-7 rounded-full transition-all ${
                    formData.urgency ? "bg-rose-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      formData.urgency ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-secondary py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4 disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Launch Request on Campus"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
