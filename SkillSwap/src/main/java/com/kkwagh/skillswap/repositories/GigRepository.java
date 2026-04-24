package com.kkwagh.skillswap.repositories;

import com.kkwagh.skillswap.models.Gig;
import com.kkwagh.skillswap.models.GigStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GigRepository extends MongoRepository<Gig, String> {
    List<Gig> findByStatus(GigStatus status);
    List<Gig> findByDepartmentAndStatus(String department, GigStatus status);
    List<Gig> findByRequesterId(String requesterId);
    List<Gig> findByProviderId(String providerId);
    long countByStatus(GigStatus status);
    long countByFileUrlIsNotNull();
}
