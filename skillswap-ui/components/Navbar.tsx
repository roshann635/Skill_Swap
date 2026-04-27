"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Clock, LayoutDashboard, Map, Wallet, BookOpen, Users, Bell, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
      if (user) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clerkId: user.id })
          })
          .then(async res => {
              if (!res.ok) {
                  const text = await res.text();
                  throw new Error(`Backend sync failed: ${res.status} ${text}`);
              }
              return res.json();
          })
          .then(data => setDbUser(data))
          .catch(err => console.error("Sync error:", err));
      }
  }, [user]);

  const { notifications, setNotifications } = useWebSocket(dbUser?.id);

  // Fetch past notifications
  useEffect(() => {
      if (dbUser) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${dbUser.id}`)
              .then(res => res.ok ? res.json() : [])
              .then(data => setNotifications(data))
              .catch(err => console.error("Failed to fetch notifications:", err));
      }
  }, [dbUser]);

  const links = [
    { name: "Feed", href: "/dashboard", icon: Map },
    { name: "My Requests", href: "/dashboard/my-requests", icon: LayoutDashboard },
    { name: "Study Vault", href: "/dashboard/notes", icon: BookOpen },
    { name: "Connect", href: "/dashboard/connect", icon: Users },
    { name: "Log", href: "/dashboard/activity-log", icon: Clock },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Clock className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:block">SkillSwap</span>
            </Link>

            <div className="hidden md:flex gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <button 
              className="p-2 text-gray-400 hover:text-white transition-colors relative"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter((n: any) => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-black"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-12 right-10 w-80 max-h-96 overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-4">
                  <h3 className="text-white font-bold mb-3">Notifications</h3>
                  {notifications.length === 0 ? (
                      <p className="text-gray-500 text-sm">No new notifications</p>
                  ) : (
                      <div className="space-y-2">
                          {notifications.map((n: any) => (
                              <Link 
                                  key={n.id} 
                                  href={n.senderId ? `/dashboard/chat/${n.senderId}` : '#'}
                                  onClick={() => setShowNotifications(false)}
                                  className={`block p-3 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${n.read ? 'bg-white/5 text-gray-400' : 'bg-primary/10 text-white border border-primary/20'}`}
                              >
                                  <p className="font-medium">{n.message}</p>
                                  <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                                      <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      {!n.read && <span className="text-primary font-bold uppercase tracking-tighter">New</span>}
                                  </div>
                              </Link>
                          ))}
                      </div>
                  )}
              </div>
            )}

            <UserButton />
            
            {/* Mobile Hamburger */}
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
