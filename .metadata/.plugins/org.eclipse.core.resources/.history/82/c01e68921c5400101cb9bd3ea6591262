package com.mytech.apartment.portal.apis;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class AuthTestController {

    @GetMapping("/public")
    public String publicEndpoint() {
        return "Public endpoint - không cần đăng nhập";
    }

    @GetMapping("/auth")
    public String authEndpoint() {
        return "Auth endpoint - cần đăng nhập";
    }
} 