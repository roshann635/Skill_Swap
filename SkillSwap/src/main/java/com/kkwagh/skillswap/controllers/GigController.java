package com.kkwagh.skillswap.controllers;

import com.kkwagh.skillswap.models.Gig;
import com.kkwagh.skillswap.services.GigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gigs")
public class GigController {

    @Autowired
    private GigService gigService;

    @PostMapping
    public ResponseEntity<Gig> createGig(@RequestBody Gig gig) {
        return ResponseEntity.ok(gigService.createGig(gig));
    }

    @GetMapping("/open")
    public ResponseEntity<List<Gig>> getOpenGigs() {
        return ResponseEntity.ok(gigService.getAllOpenGigs());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Gig>> getGigsByDepartment(@RequestParam String dept) {
        return ResponseEntity.ok(gigService.getGigsByDepartment(dept));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptGig(@PathVariable String id, @RequestParam String providerId) {
        try {
            return ResponseEntity.ok(gigService.acceptGig(id, providerId));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Gig> submitSolution(
            @PathVariable String id, 
            @RequestParam String fileUrl,
            @RequestParam String fileName,
            @RequestParam String note) {
        try {
            Gig gig = gigService.submitSolution(id, fileUrl, fileName, note);
            return ResponseEntity.ok(gig);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyGig(
            @PathVariable String id, 
            @RequestParam String qrToken,
            @RequestParam String scannerId) {
        try {
            return ResponseEntity.ok(gigService.verifyQrHandshake(id, qrToken, scannerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeGig(@PathVariable String id) {
        try {
            return ResponseEntity.ok(gigService.completeGig(id));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/requested")
    public ResponseEntity<List<Gig>> getRequestedGigs(@PathVariable String userId) {
        return ResponseEntity.ok(gigService.getGigsByRequester(userId));
    }

    @GetMapping("/user/{userId}/provided")
    public ResponseEntity<List<Gig>> getProvidedGigs(@PathVariable String userId) {
        return ResponseEntity.ok(gigService.getGigsByProvider(userId));
    }
}
