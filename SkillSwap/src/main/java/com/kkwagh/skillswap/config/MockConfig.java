package com.kkwagh.skillswap.config;

import com.kkwagh.skillswap.models.User;
import com.kkwagh.skillswap.models.Gig;
import com.kkwagh.skillswap.repositories.UserRepository;
import com.kkwagh.skillswap.repositories.GigRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.ArrayList;

@Configuration
@Profile("mock")
public class MockConfig {

    @Bean
    public CommandLineRunner initMockData(UserRepository userRepository, GigRepository gigRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User mockUser = new User();
                mockUser.setClerkId("user_mock_123");
                mockUser.setName("Mock Student");
                mockUser.setEmail("mock@kkwagh.edu");
                mockUser.setCredits(100.0);
                mockUser.setSkills(new ArrayList<>());
                userRepository.save(mockUser);
            }
        };
    }
}
