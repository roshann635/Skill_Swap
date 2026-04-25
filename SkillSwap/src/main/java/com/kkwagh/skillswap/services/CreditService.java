package com.kkwagh.skillswap.services;

import com.kkwagh.skillswap.models.*;
import com.kkwagh.skillswap.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreditService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GigRepository gigRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Step 1: Escrow credits when a gig is accepted.
     * Decrements seeker balance and records an ESCROW transaction.
     */
    // @Transactional
    public void escrowCredits(String gigId, String seekerId, Double amount) {
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));

        if (seeker.getCredits() < amount) {
            throw new RuntimeException("Insufficient credits");
        }

        // Deduct from seeker
        seeker.setCredits(seeker.getCredits() - amount);
        userRepository.save(seeker);

        // Record Escrow Transaction
        Transaction transaction = new Transaction();
        transaction.setGigId(gigId);
        transaction.setFromUserId(seekerId);
        transaction.setAmount(amount);
        transaction.setType(TransactionType.ESCROW);
        transactionRepository.save(transaction);
    }

    /**
     * Step 2: Release credits to the provider when the gig is completed.
     * This method assumes the gig is already validated to be in a state where credits can be released.
     */
    // @Transactional
    public void releaseCredits(String gigId) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));

        if (gig.getStatus() != GigStatus.IN_PROGRESS) {
            throw new RuntimeException("Gig is not in a releasable state (must be IN_PROGRESS)");
        }

        if (gig.getProviderId() == null) {
            throw new RuntimeException("No provider assigned to this gig");
        }

        User provider = userRepository.findById(gig.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Increase provider balance
        provider.setCredits(provider.getCredits() + gig.getCredits());
        userRepository.save(provider);

        // Record Release Transaction
        Transaction transaction = new Transaction();
        transaction.setGigId(gigId);
        transaction.setFromUserId(gig.getRequesterId());
        transaction.setToUserId(gig.getProviderId());
        transaction.setAmount(gig.getCredits());
        transaction.setType(TransactionType.RELEASE);
        transactionRepository.save(transaction);
        
        System.out.println("Credits released for gig: " + gigId + ". Amount: " + gig.getCredits());
    }

    /**
     * Step 3: Revert credits back to seeker if the gig is cancelled.
     */
    // @Transactional
    public void revertCredits(String gigId) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));

        User seeker = userRepository.findById(gig.getRequesterId())
                .orElseThrow(() -> new RuntimeException("Seeker not found"));

        seeker.setCredits(seeker.getCredits() + gig.getCredits());
        userRepository.save(seeker);

        gig.setStatus(GigStatus.CANCELLED);
        gigRepository.save(gig);

        // Record Revert Transaction
        Transaction transaction = new Transaction();
        transaction.setGigId(gigId);
        transaction.setToUserId(gig.getRequesterId());
        transaction.setAmount(gig.getCredits());
        transaction.setType(TransactionType.REVERT);
        transactionRepository.save(transaction);
    }
}
