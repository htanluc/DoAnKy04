package com.mytech.apartment.portal.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 TestDataInitializer is running...");
        System.out.println("📝 This confirms that CommandLineRunner is working");
    }
} 