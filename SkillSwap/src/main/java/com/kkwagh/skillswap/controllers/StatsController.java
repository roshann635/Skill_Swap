package com.kkwagh.skillswap.controllers;

import com.kkwagh.skillswap.repositories.GigRepository;
import com.kkwagh.skillswap.repositories.UserRepository;
import com.kkwagh.skillswap.models.GigStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GigRepository gigRepository;

    @GetMapping("/campus")
    public ResponseEntity<Map<String, Object>> getCampusStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Active Mentors (All registered users acting as mentors)
        stats.put("activeMentors", userRepository.count());
        
        // Requests Resolved (Count of all completed gigs)
        stats.put("requestsResolved", gigRepository.countByStatus(GigStatus.COMPLETED));
        
        // Notes in Vault (Count of gigs that had fileUrls attached)
        stats.put("notesInVault", gigRepository.countByFileUrlIsNotNull());
        
        // Static for now, as calculating real response time needs complex timestamp diffs
        stats.put("avgResponseTime", "15m");
        
        return ResponseEntity.ok(stats);
    }
}
