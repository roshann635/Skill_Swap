package com.kkwagh.skillswap.repositories;

import com.kkwagh.skillswap.models.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByGigId(String gigId);
}
