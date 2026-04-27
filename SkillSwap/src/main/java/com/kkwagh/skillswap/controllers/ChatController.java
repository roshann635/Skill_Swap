package com.kkwagh.skillswap.controllers;

import com.kkwagh.skillswap.services.NotificationService;

import com.kkwagh.skillswap.models.Message;
import com.kkwagh.skillswap.models.Notification;
import com.kkwagh.skillswap.repositories.MessageRepository;
import com.kkwagh.skillswap.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @MessageMapping("/chat")
    public void processMessage(@Payload Message chatMessage) {
        System.out.println("Received message via WebSocket: " + chatMessage);
        
        if (chatMessage.getSenderId() == null || chatMessage.getReceiverId() == null) {
            System.err.println("Error: senderId or receiverId is null!");
            return;
        }

        chatMessage.setTimestamp(LocalDateTime.now());
        Message saved = messageRepository.save(chatMessage);
        System.out.println("Message saved to database with ID: " + saved.getId());

        messagingTemplate.convertAndSend(
                "/topic/messages/" + chatMessage.getReceiverId(),
                saved
        );
        
        // Use central notification service
        String name = chatMessage.getSenderName() != null ? chatMessage.getSenderName() : "a student";
        notificationService.sendNotification(
                chatMessage.getReceiverId(),
                "New message from " + name,
                chatMessage.getSenderId()
        );
    }

    @GetMapping("/api/messages/{senderId}/{receiverId}")
    public List<Message> getMessages(@PathVariable String senderId, @PathVariable String receiverId) {
        return messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
                senderId, receiverId, receiverId, senderId);
    }

    @GetMapping("/api/notifications/{userId}")
    public List<Notification> getNotifications(@PathVariable String userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @PostMapping("/api/notifications/read/{userId}/{senderId}")
    public ResponseEntity<Void> markAsRead(@PathVariable String userId, @PathVariable String senderId) {
        List<Notification> notifs = notificationRepository.findByUserIdAndSenderIdAndRead(userId, senderId, false);
        notifs.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifs);
        return ResponseEntity.ok().build();
    }
}
