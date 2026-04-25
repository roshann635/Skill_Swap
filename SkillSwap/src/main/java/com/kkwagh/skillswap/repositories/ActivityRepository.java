package com.kkwagh.skillswap.repositories;

import com.kkwagh.skillswap.models.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ActivityRepository extends MongoRepository<Activity, String> {
    List<Activity> findByUserIdOrderByTimestampDesc(String userId);
}
