package com.mytech.apartment.portal.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.repositories.RoleRepository;


@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Starting DataInitializer...");
        
        try {
            createAdminUser();
            System.out.println("✅ DataInitializer completed successfully!");
        } catch (Exception e) {
            System.err.println("❌ Error in DataInitializer: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void createAdminUser() {
        System.out.println("👤 Creating admin user...");
        
        if (!userRepository.findByUsername("admin").isPresent()) {
            try {
                String rawPassword = "admin123";
                String encodedPassword = passwordEncoder.encode(rawPassword);
                System.out.println("🔐 Raw password: " + rawPassword);
                System.out.println("🔐 Encoded password: " + encodedPassword);
                User adminUser = User.builder()
                        .username("admin")
                        .email("admin@apartment.com")
                        .passwordHash(encodedPassword)
                        .phoneNumber("admin")
                        .status(UserStatus.ACTIVE)
                        .build();
                // Gán role ADMIN cho admin gốc
                com.mytech.apartment.portal.models.Role adminRole = roleRepository.findByName("ADMIN");
                if (adminRole == null) {
                    adminRole = roleRepository.save(new com.mytech.apartment.portal.models.Role(null, "ADMIN", "Super admin"));
                }
                Set<com.mytech.apartment.portal.models.Role> roles = new HashSet<>();
                roles.add(adminRole);
                adminUser.setRoles(roles);
                User savedAdminUser = userRepository.save(adminUser);
                System.out.println("✅ Admin user created successfully!");
                System.out.println("📱 Username: admin");
                System.out.println("🔑 Password: admin123");
                System.out.println("📞 Phone: admin");
                System.out.println("🆔 User ID: " + savedAdminUser.getId());
                boolean passwordMatches = passwordEncoder.matches(rawPassword, savedAdminUser.getPasswordHash());
                System.out.println("🔍 Password verification test: " + passwordMatches);
            } catch (Exception e) {
                System.err.println("❌ Error creating admin user: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("ℹ️ Admin user already exists");
            userRepository.findByUsername("admin").ifPresent(existingUser -> {
                System.out.println("📋 Existing admin user details:");
                System.out.println("🆔 ID: " + existingUser.getId());
                System.out.println("📱 Username: " + existingUser.getUsername());
                System.out.println("📞 Phone: " + existingUser.getPhoneNumber());
                System.out.println("🔐 Password hash: " + existingUser.getPasswordHash());
                boolean passwordMatches = passwordEncoder.matches("admin123", existingUser.getPasswordHash());
                System.out.println("🔍 Password verification test: " + passwordMatches);
            });
        }
    }
} 