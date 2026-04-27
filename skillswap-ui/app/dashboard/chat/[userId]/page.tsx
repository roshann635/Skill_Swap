"use client";

import { useEffect, useState, useRef } from 'react';
import Navbar from "@/components/Navbar";
import { useWebSocket } from '@/hooks/useWebSocket';
import { useUser } from '@clerk/nextjs';
import { Send, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ChatPage() {
    const { userId } = useParams();
    const { user: clerkUser } = useUser();
    const [dbUser, setDbUser] = useState<any>(null);
    const [targetUser, setTargetUser] = useState<any>(null);
    const [messageInput, setMessageInput] = useState("");
    
    const currentUserId = dbUser?.id || dbUser?._id;
    const { messages, setMessages, sendMessage } = useWebSocket(currentUserId);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (clerkUser) {
            console.log("Syncing user with Clerk ID:", clerkUser.id);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clerkId: clerkUser.id })
            }).then(async res => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            }).then(data => {
                console.log("Synced dbUser:", data);
                setDbUser(data);
                if (data.name) localStorage.setItem('skillswap_user_name', data.name);
            }).catch(err => console.error("Chat sync failed:", err));
        }
    }, [clerkUser]);

    useEffect(() => {
        if (userId) {
            console.log("Fetching target user with ID/ClerkID:", userId);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`)
                .then(async res => {
                    if (!res.ok) throw new Error(await res.text());
                    return res.json();
                })
                .then(data => {
                    console.log("Fetched targetUser:", data);
                    setTargetUser(data);
                })
                .catch(err => console.error("Failed to fetch target user:", err));
        }
    }, [userId]);

    useEffect(() => {
        const myId = dbUser?.id || dbUser?._id;
        const theirId = targetUser?.id || targetUser?._id;

        if (myId && theirId) {
            console.log(`Fetching history between ${myId} and ${theirId}`);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${myId}/${theirId}`)
                .then(res => res.ok ? res.json() : [])
                .then(data => setMessages(data))
                .catch(err => console.error("Failed to fetch messages:", err));

            // Mark notifications as read
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read/${myId}/${theirId}`, {
                method: 'POST'
            }).catch(err => console.error("Failed to mark notifications as read:", err));
        }
    }, [dbUser, targetUser, setMessages]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim() === "") return;
        
        const theirId = targetUser?.id || targetUser?._id;
        if (!theirId) {
            console.error("Cannot send message: Target user ID missing");
            return;
        }
        
        sendMessage(theirId, messageInput);
        setMessageInput("");
    };

    return (
        <div className="min-h-screen bg-mesh flex flex-col">
            <Navbar />
            <main className="max-w-4xl mx-auto w-full flex-1 p-4 flex flex-col h-[calc(100vh-64px)]">
                {/* Header */}
                <div className="glass-card p-4 rounded-t-3xl border-b border-white/10 flex items-center gap-4">
                    <Link href="/dashboard/connect" className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                            {targetUser?.name?.[0] || '?'}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{targetUser?.name || 'Loading...'}</h2>
                            <p className="text-xs text-gray-500">{targetUser?.department} • {targetUser?.academicYear}</p>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 glass-card border-x border-white/5 bg-black/20">
                    {messages
                        .filter(msg => {
                            const myId = dbUser?.id || dbUser?._id;
                            const theirId = targetUser?.id || targetUser?._id;
                            
                            if (!myId || !theirId) return true; // Show all while loading to be safe, or hide all? Better show all for debug.
                            
                            const msgSenderId = msg.senderId;
                            const msgReceiverId = msg.receiverId;
                            
                            const isFromMeToThem = msgSenderId === myId && msgReceiverId === theirId;
                            const isFromThemToMe = msgSenderId === theirId && msgReceiverId === myId;
                            
                            return isFromMeToThem || isFromThemToMe;
                        })
                        .map((msg, idx) => {
                            const myId = dbUser?.id || dbUser?._id;
                            const isMe = msg.senderId === myId;
                            
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-3 rounded-2xl border border-black/5 ${
                                        isMe 
                                            ? '!bg-[#00ED64] !text-black rounded-tr-sm shadow-sm' 
                                            : '!bg-[#00ED64] !text-black rounded-tl-sm shadow-sm'
                                    }`}>
                                        <p className="text-sm font-semibold">{msg.content}</p>
                                        <p className="text-[10px] opacity-60 mt-1 text-right">
                                            {msg.timestamp ? new Date(msg.timestamp + (msg.timestamp.endsWith('Z') ? '' : 'Z')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    <div ref={endOfMessagesRef} />
                </div>

                {/* Input Area */}
                <div className="glass-card p-4 rounded-b-3xl border-t border-white/10">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input 
                            type="text" 
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button 
                            type="submit"
                            disabled={!messageInput.trim()}
                            className="bg-primary p-3 rounded-xl text-white hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
