"use client";

import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = (userId: string | undefined) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        if (!userId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/ws`),
            onConnect: () => {
                console.log("Connected to WebSocket");
                client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
                    if (message.body) {
                        setNotifications((prev) => [JSON.parse(message.body), ...prev]);
                    }
                });
                client.subscribe(`/user/${userId}/queue/messages`, (message) => {
                    if (message.body) {
                        setMessages((prev) => [...prev, JSON.parse(message.body)]);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [userId]);

    const sendMessage = (receiverId: string, content: string) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/chat',
                body: JSON.stringify({ senderId: userId, receiverId, content })
            });
            // Optimistically add message
            setMessages((prev) => [...prev, { senderId: userId, receiverId, content, timestamp: new Date() }]);
        }
    };

    return { notifications, messages, sendMessage, setMessages, setNotifications };
};
