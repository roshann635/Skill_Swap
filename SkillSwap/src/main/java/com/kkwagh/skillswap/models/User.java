package com.kkwagh.skillswap.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String clerkId;

    private String name;
    private String email;
    private String department;
    
    private Double credits = 0.0;
    
    // Trust score is calculated based on feedback
    private Double trustScore = 0.0;
    
    private List<String> skills;
    private String bio;
    
    private String academicYear; // FE, SE, TE, BE
    private String division; // A, B, C, etc.
    private Boolean isSenior = false;

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClerkId() { return clerkId; }
    public void setClerkId(String clerkId) { this.clerkId = clerkId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Double getCredits() { return credits; }
    public void setCredits(Double credits) { this.credits = credits; }

    public Double getTrustScore() { return trustScore; }
    public void setTrustScore(Double trustScore) { this.trustScore = trustScore; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public Boolean getIsSenior() { return isSenior; }
    public void setIsSenior(Boolean isSenior) { this.isSenior = isSenior; }
}
