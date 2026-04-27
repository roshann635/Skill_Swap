package com.kkwagh.skillswap.services;

import com.kkwagh.skillswap.models.Notification;
import com.kkwagh.skillswap.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendNotification(String userId, String message) {
        sendNotification(userId, message, null);
    }

    public void sendNotification(String userId, String message, String senderId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setSenderId(senderId);
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);

        // Save to Database
        Notification savedNotification = notificationRepository.save(notification);

        // Send via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + userId,
                savedNotification
        );
    }
}
