package com.kkwagh.skillswap.controllers;

import com.kkwagh.skillswap.models.Message;
import com.kkwagh.skillswap.models.Notification;
import com.kkwagh.skillswap.repositories.MessageRepository;
import com.kkwagh.skillswap.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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

    @MessageMapping("/chat")
    public void processMessage(@Payload Message chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        Message saved = messageRepository.save(chatMessage);
        messagingTemplate.convertAndSend(
                "/topic/messages/" + chatMessage.getReceiverId(),
                saved
        );
        
        // Also notify the receiver
        Notification notif = new Notification();
        notif.setUserId(chatMessage.getReceiverId());
        notif.setMessage("New message from " + chatMessage.getSenderId());
        notif.setTimestamp(LocalDateTime.now());
        notif.setRead(false);
        notificationRepository.save(notif);
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + chatMessage.getReceiverId(),
                notif
        );
    }

    @GetMapping("/api/messages/{senderId}/{receiverId}")
    public List<Message> getMessages(@PathVariable String senderId, @PathVariable String receiverId) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                senderId, receiverId, receiverId, senderId);
    }

    @GetMapping("/api/notifications/{userId}")
    public List<Notification> getNotifications(@PathVariable String userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
