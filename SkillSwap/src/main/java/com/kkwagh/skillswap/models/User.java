package com.kkwagh.skillswap.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.List;

@Data
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
}
