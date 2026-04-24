package com.kkwagh.skillswap.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;
    
    private String gigId;
    private String fromUserId;
    private String toUserId;
    
    private Double amount;
    private TransactionType type;
    
    private LocalDateTime timestamp = LocalDateTime.now();
}
