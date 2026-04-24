"use client";

import { useState } from "react";
import { User, GraduationCap, Building2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
  clerkUser: any;
}

export default function CompleteProfileModal({ isOpen, onClose, onSuccess, clerkUser }: CompleteProfileModalProps) {
  const [formData, setFormData] = useState({
    academicYear: "FE",
    department: "Computer",
    division: "A",
    bio: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          name: clerkUser.fullName,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          academicYear: formData.academicYear,
          department: formData.department,
          division: formData.division,
          bio: formData.bio
        }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        onSuccess(updatedUser);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md glass-card p-8 rounded-[40px] border border-primary/20 shadow-2xl shadow-primary/10"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
              <p className="text-gray-500 text-sm mt-1">Tell us your year and branch to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Academic Year</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    >
                      <option value="" disabled className="text-gray-900 bg-white">Select Year</option>
                      <option value="FE" className="text-gray-900 bg-white">First Year (FE)</option>
                      <option value="SE" className="text-gray-900 bg-white">Second Year (SE)</option>
                      <option value="TE" className="text-gray-900 bg-white">Third Year (TE)</option>
                      <option value="BE" className="text-gray-900 bg-white">Final Year (BE)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="" disabled className="text-gray-900 bg-white">Select Department</option>
                      <option className="text-gray-900 bg-white">Computer</option>
                      <option className="text-gray-900 bg-white">IT</option>
                      <option className="text-gray-900 bg-white">AIDS</option>
                      <option className="text-gray-900 bg-white">Mechanical</option>
                      <option className="text-gray-900 bg-white">Civil</option>
                      <option className="text-gray-900 bg-white">Electrical</option>
                      <option className="text-gray-900 bg-white">Robotics</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Division</label>
                <div className="flex gap-4">
                  {["A", "B", "C", "D"].map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setFormData({ ...formData, division: div })}
                      className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                        formData.division === div 
                          ? "bg-primary border-primary text-white" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      Div {div}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">About You (Bio)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Passionate about Java and UI/UX..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-primary py-5 rounded-[24px] font-bold text-white shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? "Saving..." : <><Save className="w-5 h-5" /> Save Profile</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
