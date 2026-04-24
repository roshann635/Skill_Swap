package com.kkwagh.skillswap.controllers;

import com.kkwagh.skillswap.models.Transaction;
import com.kkwagh.skillswap.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable String userId) {
        // Find transactions where user is sender or receiver
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> userId.equals(t.getFromUserId()) || userId.equals(t.getToUserId()))
                .sorted((t1, t2) -> t2.getTimestamp().compareTo(t1.getTimestamp()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(transactions);
    }
}
