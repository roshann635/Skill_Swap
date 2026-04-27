package com.kkwagh.skillswap.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "activities")
public class Activity {
    @Id
    private String id;
    private String userId;
    private String description;
    private String type; // REQUEST, CONTRIBUTION, RESOLVED, CHAT
    private LocalDateTime timestamp = LocalDateTime.now();

    public Activity() {}

    public Activity(String id, String userId, String description, String type, LocalDateTime timestamp) {
        this.id = id;
        this.userId = userId;
        this.description = description;
        this.type = type;
        this.timestamp = timestamp;
    }

    public Activity(String userId, String description, String type) {
        this.userId = userId;
        this.description = description;
        this.type = type;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
