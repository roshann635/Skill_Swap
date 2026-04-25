package com.kkwagh.skillswap.controllers;

import com.kkwagh.skillswap.models.User;
import com.kkwagh.skillswap.repositories.UserRepository;
import com.kkwagh.skillswap.services.TrustScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrustScoreService trustScoreService;

    @GetMapping("/{clerkId}")
    public ResponseEntity<User> getUserByClerkId(@PathVariable String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/sync")
    public ResponseEntity<User> syncUser(@RequestBody User user) {
        if (user.getClerkId() == null || user.getClerkId().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // 1. Find existing or create new
        User existingUser = userRepository.findByClerkId(user.getClerkId()).orElse(null);
        
        if (existingUser == null) {
            existingUser = new User();
            existingUser.setClerkId(user.getClerkId());
            existingUser.setCredits(10.0); // Welcome credits
            existingUser.setTrustScore(4.0); // Initial trust
        }

        // 2. Update basic info from Clerk if provided
        if (user.getName() != null) existingUser.setName(user.getName());
        if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
        
        // 3. Update campus info if provided
        if (user.getBio() != null) existingUser.setBio(user.getBio());
        if (user.getDepartment() != null) existingUser.setDepartment(user.getDepartment());
        if (user.getDivision() != null) existingUser.setDivision(user.getDivision());
        
        if (user.getAcademicYear() != null && !user.getAcademicYear().isEmpty()) {
            existingUser.setAcademicYear(user.getAcademicYear());
            String year = user.getAcademicYear().toUpperCase();
            existingUser.setIsSenior(year.equals("TE") || year.equals("BE"));
        }

        // 4. Save safely
        try {
            return ResponseEntity.ok(userRepository.save(existingUser));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{userId}/recompute-trust")
    public ResponseEntity<Void> recomputeTrust(@PathVariable String userId) {
        trustScoreService.calculateTrustScore(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/seniors")
    public ResponseEntity<Iterable<User>> getSeniors() {
        // Return all registered users so the directory is never empty for the demo
        return ResponseEntity.ok(userRepository.findAll());
    }
}
