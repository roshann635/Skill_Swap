"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, Clock, Zap, Shield, Map as MapIcon, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const { isLoaded, userId } = useAuth();

  return (
    <div className="relative isolate bg-mesh min-h-screen">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <nav className="flex items-center justify-between p-6 lg:px-8 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-black/50">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Clock className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SkillSwap</span>
          </Link>
        </div>
        <div className="flex gap-x-6 items-center">
          {!isLoaded ? (
            <div className="w-20 h-8 bg-white/5 animate-pulse rounded-full"></div>
          ) : !userId ? (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-semibold leading-6 text-white hover:text-primary transition-colors bg-white/5 px-4 py-2 rounded-xl">
                  Log in
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                  Get Started
                </button>
              </SignInButton>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-bold leading-6 text-secondary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors">
                Enter Dashboard
              </Link>
              <UserButton />
            </>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-bold bg-primary/10 text-secondary ring-1 ring-inset ring-primary/20 mb-6">
                Now Live at K.K. Wagh Campus
              </span>
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8">
                Your Expertise is the <span className="text-gradient">Only Currency</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-500 max-w-2xl mx-auto font-medium">
                SkillSwap is a decentralized campus help ecosystem. Trade your skills for knowledge, help your peers, and build a verified portfolio without any financial barriers.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/dashboard" className="group rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-4 text-sm font-bold text-white shadow-xl hover:opacity-90 flex items-center gap-2 transition-all">
                  Browse Active Requests
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#concept" className="text-sm font-bold leading-6 text-gray-500 flex items-center gap-2 hover:text-secondary transition-colors">
                  How it works <span aria-hidden="true" className="text-secondary">→</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-32">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {[
              {
                title: "Skill for Skill",
                desc: "Everyone has something to teach. Whether it's Java debugging or CAD drawing, every request is a chance to learn.",
                icon: Clock,
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                title: "Proof of Work Trust",
                desc: "Build a weighted trust score based on peer reviews and task complexity. Your reputation is your bond.",
                icon: Shield,
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                title: "Real-Time Campus Map",
                desc: "Instantly see who needs help across departments (Computer, IT, Mech, Civil) on our live dashboard.",
                icon: MapIcon,
                color: "text-rose-500",
                bg: "bg-rose-500/10"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-3xl"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 border border-white/50`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Map Preview (Static for now) */}
        <div className="bg-white/5 py-24 border-y border-white/10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Live &quot;Gig&quot; Activity</h2>
            <div className="grid grid-cols-1 gap-4 text-left max-w-3xl mx-auto">
              {[
                { task: "Need help with Prisma Schema", dept: "Computer", credits: 2, urgency: true },
                { task: "Explain Thermal Engineering basics", dept: "Mech", credits: 3, urgency: false },
                { task: "Debug React Native App", dept: "IT", credits: 1.5, urgency: true }
              ].map((gig, i) => (
                <div key={i} className="glass-card p-5 flex items-center justify-between group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {gig.dept[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white">{gig.task}</p>
                      <p className="text-xs text-gray-500 font-bold">{gig.dept} Department</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {gig.urgency && (
                      <span className="text-[10px] font-bold bg-rose-500/10 text-rose-500 px-2 py-1 rounded-md border border-rose-500/20 uppercase tracking-wider">Urgent</span>
                    )}
                    <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-tighter">
                      <Star className="w-3 h-3" />
                      Active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center bg-white/5 mt-10">
        <p className="text-gray-400 font-bold text-sm">© {new Date().getFullYear()} SkillSwap Ecosystem | K.K. Wagh Campus Platform</p>
      </footer>
    </div>
  );
}
