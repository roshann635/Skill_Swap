package com.kkwagh.skillswap.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "gigs")
public class Gig {
    @Id
    private String id;
    
    private String requesterId;
    private String requesterName;
    private String requesterYear;
    private String requesterDepartment;
    
    private String providerId; // Null until accepted
    
    private String title;
    private String description;
    private String category;
    
    private Double credits;
    
    private GigStatus status = GigStatus.OPEN;
    private GigType type = GigType.REQUEST;
    
    private String fileUrl; // URL or Base64 of the shared notes/solution
    private String fileName; // Name of the shared file
    private String solutionNote; // Message from the Helper
    
    private Boolean urgency = false;
    private String department; // Targeted department
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;
    private String qrToken; // Token for QR Handshake
}
