package com.kkwagh.skillswap.services;

import com.kkwagh.skillswap.models.Activity;
import com.kkwagh.skillswap.repositories.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    public void logActivity(String userId, String description, String type) {
        Activity activity = new Activity(userId, description, type);
        activityRepository.save(activity);
    }

    public List<Activity> getUserActivities(String userId) {
        return activityRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
