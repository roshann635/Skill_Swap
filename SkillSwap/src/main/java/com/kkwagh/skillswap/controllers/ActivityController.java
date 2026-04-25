package com.kkwagh.skillswap.controllers;

import com.kkwagh.skillswap.models.Activity;
import com.kkwagh.skillswap.services.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Activity>> getActivities(@PathVariable String userId) {
        return ResponseEntity.ok(activityService.getUserActivities(userId));
    }
}
