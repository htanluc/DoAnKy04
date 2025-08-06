package com.mytech.apartment.portal.config;

import com.mytech.apartment.portal.services.SmartActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Configuration
@DependsOn("smartActivityLogService")
public class SmartLoggingConfig {

    @Autowired
    private SmartActivityLogService smartActivityLogService;

    @PostConstruct
    public void init() {
        // Khởi động cache cleanup scheduler
        smartActivityLogService.startCacheCleanup();
    }

    @PreDestroy
    public void cleanup() {
        // Dừng scheduler khi shutdown
        smartActivityLogService.shutdown();
    }
} 