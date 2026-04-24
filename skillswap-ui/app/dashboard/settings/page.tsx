"use client";

import Navbar from "@/components/Navbar";
import { User, Settings, Save, ArrowLeft, GraduationCap, Building2, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    academicYear: "",
    department: "",
    division: "",
    bio: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkUser) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: clerkUser.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data);
        setFormData({
          name: data.name || "",
          academicYear: data.academicYear || "FE",
          department: data.department || "Computer",
          division: data.division || "A",
          bio: data.bio || "",
        });
      }
    };
    fetchUser();
  }, [clerkUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: clerkUser?.id,
          ...formData
        }),
      });
      if (res.ok) {
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-500">Manage your campus identity and academic details</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[40px] border border-white/5"
        >
          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Info
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50"
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Academic Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Academic Year</label>
                  <select
                    value={formData.academicYear}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50"
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  >
                    <option value="FE" className="text-gray-900 bg-white">FE (1st Year)</option>
                    <option value="SE" className="text-gray-900 bg-white">SE (2nd Year)</option>
                    <option value="TE" className="text-gray-900 bg-white">TE (3rd Year)</option>
                    <option value="BE" className="text-gray-900 bg-white">BE (4th Year)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Department</label>
                  <select
                    value={formData.department}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50"
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Computer" className="text-gray-900 bg-white">Computer</option>
                    <option value="IT" className="text-gray-900 bg-white">IT</option>
                    <option value="AIDS" className="text-gray-900 bg-white">AIDS</option>
                    <option value="Mechanical" className="text-gray-900 bg-white">Mechanical</option>
                    <option value="Civil" className="text-gray-900 bg-white">Civil</option>
                    <option value="Electrical" className="text-gray-900 bg-white">Electrical</option>
                    <option value="Robotics" className="text-gray-900 bg-white">Robotics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Division</label>
                  <div className="flex gap-2">
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
                        {div}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary py-5 rounded-[24px] font-bold text-white shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
