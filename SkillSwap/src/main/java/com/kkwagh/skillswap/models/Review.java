package com.kkwagh.skillswap.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

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

    public Review() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGigId() { return gigId; }
    public void setGigId(String gigId) { this.gigId = gigId; }

    public String getReviewerId() { return reviewerId; }
    public void setReviewerId(String reviewerId) { this.reviewerId = reviewerId; }

    public String getRevieweeId() { return revieweeId; }
    public void setRevieweeId(String revieweeId) { this.revieweeId = revieweeId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Double getComplexityFactor() { return complexityFactor; }
    public void setComplexityFactor(Double complexityFactor) { this.complexityFactor = complexityFactor; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
