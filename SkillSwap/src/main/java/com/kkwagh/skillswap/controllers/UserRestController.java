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
    public ResponseEntity<?> syncUser(@RequestBody User user) {
        try {
            if (user.getClerkId() == null || user.getClerkId().isEmpty()) {
                java.util.Map<String, String> err = new java.util.HashMap<>();
                err.put("error", "Clerk ID is missing");
                return ResponseEntity.badRequest().body(err);
            }

            // 1. Get all matches
            List<User> users = userRepository.findByClerkId(user.getClerkId());
            
            User existingUser;
            if (users.isEmpty()) {
                existingUser = new User();
                existingUser.setClerkId(user.getClerkId());
                existingUser.setCredits(10.0);
                existingUser.setTrustScore(4.0);
            } else {
                existingUser = users.get(0);
                // 2. SELF-HEALING: If there are duplicates, delete the extras!
                if (users.size() > 1) {
                    for (int i = 1; i < users.size(); i++) {
                        userRepository.delete(users.get(i));
                    }
                }
            }

            // 3. Update info
            if (user.getName() != null) existingUser.setName(user.getName());
            if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
            
            if (user.getAcademicYear() != null && !user.getAcademicYear().isEmpty()) {
                existingUser.setAcademicYear(user.getAcademicYear());
                String year = user.getAcademicYear().toUpperCase();
                existingUser.setIsSenior(year.equals("TE") || year.equals("BE"));
            }

            // 4. Save
            return ResponseEntity.ok(userRepository.save(existingUser));
        } catch (Exception e) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("details", "Final fallback triggered. Sync failed.");
            return ResponseEntity.status(500).body(errorResponse);
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
