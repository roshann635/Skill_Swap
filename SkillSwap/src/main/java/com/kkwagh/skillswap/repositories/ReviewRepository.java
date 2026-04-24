package com.kkwagh.skillswap.repositories;

import com.kkwagh.skillswap.models.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByRevieweeId(String revieweeId);
}
