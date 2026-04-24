package com.kkwagh.skillswap.services;

import com.kkwagh.skillswap.models.Gig;
import com.kkwagh.skillswap.models.GigStatus;
import com.kkwagh.skillswap.models.Review;
import com.kkwagh.skillswap.models.User;
import com.kkwagh.skillswap.repositories.GigRepository;
import com.kkwagh.skillswap.repositories.ReviewRepository;
import com.kkwagh.skillswap.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrustScoreService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private GigRepository gigRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Recalculates the Trust Score for a user based on the weighted formula.
     * S = (Average(Ri * Ci)) * (Tcomp / Ttotal)
     */
    public void calculateTrustScore(String userId) {
        List<Review> reviews = reviewRepository.findByRevieweeId(userId);
        List<Gig> allAcceptedGigs = gigRepository.findByProviderId(userId);

        if (allAcceptedGigs.isEmpty()) {
            return; // No gigs yet, keep initial score
        }

        double weightedRatingSum = 0;
        for (Review review : reviews) {
            weightedRatingSum += (review.getRating() * review.getComplexityFactor());
        }

        double averageWeightedRating = reviews.isEmpty() ? 0 : weightedRatingSum / reviews.size();

        long completedCount = allAcceptedGigs.stream()
                .filter(g -> g.getStatus() == GigStatus.COMPLETED)
                .count();

        double completionRatio = (double) completedCount / allAcceptedGigs.size();

        double finalScore = averageWeightedRating * completionRatio;

        // Update the user's score in the document
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTrustScore(finalScore);
        userRepository.save(user);
    }
}
