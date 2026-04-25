package com.kkwagh.skillswap.repositories;

import com.kkwagh.skillswap.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findByClerkId(String clerkId);
}
