package com.kkwagh.skillswap.repositories;

import com.kkwagh.skillswap.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByTimestampDesc(String userId);
    List<Notification> findByUserIdAndSenderIdAndRead(String userId, String senderId, boolean read);
}
