package com.kkwagh.skillswap.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "activities")
public class Activity {
    @Id
    private String id;
    private String userId;
    private String description;
    private String type; // REQUEST, CONTRIBUTION, RESOLVED, CHAT
    private LocalDateTime timestamp = LocalDateTime.now();

    public Activity(String userId, String description, String type) {
        this.userId = userId;
        this.description = description;
        this.type = type;
        this.timestamp = LocalDateTime.now();
    }
}
