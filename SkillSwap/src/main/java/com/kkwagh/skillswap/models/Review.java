package com.kkwagh.skillswap.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "reviews")
public class Review {
    @Id
    private String id;
    
    private String gigId;
    private String reviewerId;
    private String revieweeId;
    
    private Integer rating; // 1-5 stars
    private String comment;
    
    private Double complexityFactor; // Ci in the formula
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
