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
        User existingUser = userRepository.findByClerkId(user.getClerkId())
                .orElseGet(() -> {
                    user.setCredits(10.0); // Give 10.0 Welcome Credits
                    user.setTrustScore(4.0); // Initial trust score
                    return user;
                });
        
        // Only update Name/Email if they are currently missing/empty
        if (user.getName() != null && (existingUser.getName() == null || existingUser.getName().isEmpty())) {
            existingUser.setName(user.getName());
        }
        if (user.getEmail() != null && (existingUser.getEmail() == null || existingUser.getEmail().isEmpty())) {
            existingUser.setEmail(user.getEmail());
        }
        
        // Bio, Dept, Div are usually manual edits from SkilSwap, only update if provided in body
        if (user.getBio() != null) existingUser.setBio(user.getBio());
        if (user.getDepartment() != null) existingUser.setDepartment(user.getDepartment());
        if (user.getDivision() != null) existingUser.setDivision(user.getDivision());
        
        // Handle Academic Year and Seniority
        if (user.getAcademicYear() != null) {
            existingUser.setAcademicYear(user.getAcademicYear());
            String year = user.getAcademicYear().toUpperCase();
            existingUser.setIsSenior(year.equals("TE") || year.equals("BE"));
        }
        
        return ResponseEntity.ok(userRepository.save(existingUser));
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
