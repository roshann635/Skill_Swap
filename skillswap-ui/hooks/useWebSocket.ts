"use client";

import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = (userId: string | undefined) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        if (!userId) return;

        // More robust URL construction
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const wsBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
        const socketUrl = `${wsBaseUrl}/ws`;

        console.log("Connecting to WebSocket at:", socketUrl);

        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            debug: (str) => {
                console.log("STOMP Debug:", str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log("Connected to WebSocket for user:", userId);
                
                // Subscribe to personal notifications
                client.subscribe(`/topic/notifications/${userId}`, (message) => {
                    if (message.body) {
                        const notif = JSON.parse(message.body);
                        console.log("Received notification:", notif);
                        setNotifications((prev) => [notif, ...prev]);
                    }
                });

                // Subscribe to personal messages
                client.subscribe(`/topic/messages/${userId}`, (message) => {
                    if (message.body) {
                        const newMsg = JSON.parse(message.body);
                        console.log("Received message via WS:", newMsg);
                        
                        setMessages((prev) => {
                            // Avoid duplicates (e.g. if optimistic update already added it)
                            // We check by content and timestamp or ID if available
                            const isDuplicate = prev.some(m => 
                                (m.id && m.id === newMsg.id) || 
                                (m.content === newMsg.content && m.senderId === newMsg.senderId && Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 2000)
                            );
                            
                            if (isDuplicate) {
                                // If it's a duplicate but the incoming one has an ID (from DB), update the existing one
                                if (newMsg.id) {
                                    return prev.map(m => 
                                        (!m.id && m.content === newMsg.content && m.senderId === newMsg.senderId) ? newMsg : m
                                    );
                                }
                                return prev;
                            }
                            return [...prev, newMsg];
                        });
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketClose: () => {
                console.log("WebSocket connection closed");
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            console.log("Deactivating WebSocket client");
            client.deactivate();
        };
    }, [userId]);

    const sendMessage = useCallback((receiverId: string, content: string) => {
        if (stompClient && stompClient.connected && userId) {
            const messagePayload = { 
                senderId: userId, 
                senderName: localStorage.getItem('skillswap_user_name') || "Student",
                receiverId, 
                content,
                timestamp: new Date().toISOString()
            };

            stompClient.publish({
                destination: '/app/chat',
                body: JSON.stringify(messagePayload)
            });

            // Optimistically add message to UI
            setMessages((prev) => [...prev, messagePayload]);
        } else {
            console.warn("Cannot send message: WebSocket not connected or userId missing", {
                connected: stompClient?.connected,
                userId
            });
        }
    }, [stompClient, userId]);

    return { notifications, messages, sendMessage, setMessages, setNotifications };
};
