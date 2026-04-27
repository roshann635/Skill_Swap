package com.kkwagh.skillswap.services;

import com.kkwagh.skillswap.services.NotificationService;

import com.kkwagh.skillswap.models.Gig;
import com.kkwagh.skillswap.models.GigStatus;
import com.kkwagh.skillswap.repositories.GigRepository;
import com.kkwagh.skillswap.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GigService {

    @Autowired
    private GigRepository gigRepository;

    @Autowired
    private CreditService creditService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private NotificationService notificationService;

    public Gig createGig(Gig gig) {
        Gig savedGig = gigRepository.save(gig);
        activityService.logActivity(gig.getRequesterId(), "Requested help: " + gig.getTitle(), "REQUEST");
        return savedGig;
    }

    public List<Gig> getAllOpenGigs() {
        List<Gig> gigs = gigRepository.findByStatus(GigStatus.OPEN);
        // Auto-fix metadata for old records or incomplete syncs
        gigs.forEach(gig -> {
            if (gig.getRequesterName() == null || gig.getRequesterName().isEmpty()) {
                userRepository.findById(gig.getRequesterId()).ifPresent(user -> {
                    gig.setRequesterName(user.getName());
                    gig.setRequesterYear(user.getAcademicYear());
                    gig.setRequesterDepartment(user.getDepartment());
                });
            }
        });
        return gigs;
    }

    public List<Gig> getGigsByDepartment(String department) {
        return gigRepository.findByDepartmentAndStatus(department, GigStatus.OPEN);
    }

    public Gig acceptGig(String gigId, String providerId) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));

        if (gig.getStatus() != GigStatus.OPEN) {
            throw new RuntimeException("Gig is no longer available");
        }

        // Check if requester and provider are same
        if (gig.getRequesterId().equals(providerId)) {
            throw new RuntimeException("You cannot accept your own bounty");
        }

        // Escrow credits when gig is accepted
        creditService.escrowCredits(gigId, gig.getRequesterId(), gig.getCredits());

        gig.setStatus(GigStatus.IN_PROGRESS);
        gig.setProviderId(providerId);
        gig.setQrToken(java.util.UUID.randomUUID().toString());
        
        Gig savedGig = gigRepository.save(gig);
        activityService.logActivity(providerId, "Accepted help request: " + gig.getTitle(), "CONTRIBUTION");
        
        // Notify Requester
        notificationService.sendNotification(
            gig.getRequesterId(),
            "Your request '" + gig.getTitle() + "' was accepted by a student!"
        );
        
        return savedGig;
    }

    public Gig completeGig(String gigId) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));
        
        if (gig.getStatus() == GigStatus.COMPLETED) {
            return gig; // Already completed, no-op
        }

        if (gig.getStatus() != GigStatus.IN_PROGRESS) {
            throw new RuntimeException("Gig cannot be completed from its current state: " + gig.getStatus() + ". It must be IN_PROGRESS (accepted by a student).");
        }
        
        // Release credits to the provider upon completion
        creditService.releaseCredits(gigId);

        // Increment provider trust score
        userRepository.findById(gig.getProviderId()).ifPresent(provider -> {
            provider.setTrustScore((provider.getTrustScore() == null ? 0 : provider.getTrustScore()) + 0.1);
            userRepository.save(provider);
        });
        
        gig.setStatus(GigStatus.COMPLETED);
        gig.setCompletedAt(java.time.LocalDateTime.now());
        Gig savedGig = gigRepository.save(gig);
        
        activityService.logActivity(gig.getRequesterId(), "Resolved request: " + gig.getTitle(), "RESOLVED");
        activityService.logActivity(gig.getProviderId(), "Completed contribution for: " + gig.getTitle(), "CONTRIBUTION");
        
        // Notify Provider
        notificationService.sendNotification(
            gig.getProviderId(),
            "You earned " + gig.getCredits() + " credits for completing '" + gig.getTitle() + "'!"
        );
        
        return savedGig;
    }

    public Gig verifyQrHandshake(String gigId, String qrToken, String scannerId) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));

        if (gig.getStatus() != GigStatus.IN_PROGRESS) {
            throw new RuntimeException("Gig must be IN_PROGRESS to verify");
        }

        if (!gig.getQrToken().equals(qrToken)) {
            throw new RuntimeException("Invalid QR Token");
        }

        // Only the provider can scan the requester's QR, OR the requester can scan the provider's QR.
        // Assuming Requester shows QR, Provider scans it.
        if (!gig.getProviderId().equals(scannerId)) {
            throw new RuntimeException("Only the provider can scan the completion QR");
        }

        // Add trust score or logic here later...

        return completeGig(gigId);
    }

    /**
     * Submit a solution for a gig — saves file details and note without marking as completed.
     * The requester should verify and mark as resolved separately.
     */
    public Gig submitSolution(String gigId, String fileUrl, String fileName, String note) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));
        
        gig.setFileUrl(fileUrl);
        gig.setFileName(fileName);
        gig.setSolutionNote(note);
        Gig savedGig = gigRepository.save(gig);
        
        // Notify Requester
        notificationService.sendNotification(
            gig.getRequesterId(),
            "A solution has been submitted for '" + gig.getTitle() + "'. Please verify!"
        );
        
        return savedGig;
    }

    public List<Gig> getGigsByRequester(String userId) {
        return gigRepository.findByRequesterId(userId);
    }

    public List<Gig> getGigsByProvider(String userId) {
        return gigRepository.findByProviderId(userId);
    }
}
