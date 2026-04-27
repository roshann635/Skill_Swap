package com.kkwagh.skillswap.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

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

    public Gig() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRequesterId() { return requesterId; }
    public void setRequesterId(String requesterId) { this.requesterId = requesterId; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public String getRequesterYear() { return requesterYear; }
    public void setRequesterYear(String requesterYear) { this.requesterYear = requesterYear; }

    public String getRequesterDepartment() { return requesterDepartment; }
    public void setRequesterDepartment(String requesterDepartment) { this.requesterDepartment = requesterDepartment; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getCredits() { return credits; }
    public void setCredits(Double credits) { this.credits = credits; }

    public GigStatus getStatus() { return status; }
    public void setStatus(GigStatus status) { this.status = status; }

    public GigType getType() { return type; }
    public void setType(GigType type) { this.type = type; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getSolutionNote() { return solutionNote; }
    public void setSolutionNote(String solutionNote) { this.solutionNote = solutionNote; }

    public Boolean getUrgency() { return urgency; }
    public void setUrgency(Boolean urgency) { this.urgency = urgency; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
}
