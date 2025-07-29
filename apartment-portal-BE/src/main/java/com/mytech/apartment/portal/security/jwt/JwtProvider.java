package com.mytech.apartment.portal.security.jwt;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

// Đã loại bỏ import javax.annotation.PostConstruct do lỗi không resolve được
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

import jakarta.annotation.PostConstruct; // Sử dụng jakarta.annotation thay cho javax.annotation

@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String jwtSecretString;

    @Value("${jwt.expirationMs}")
    private int jwtExpirationMs;

    private SecretKey jwtSecretKey;

    @PostConstruct
    public void init() {
        try {
            this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecretString.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            // Xử lý lỗi khi khởi tạo khóa bí mật
            throw new RuntimeException("Lỗi khởi tạo khóa bí mật JWT: " + e.getMessage(), e);
        }
    }

    public String generateToken(Authentication auth) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + jwtExpirationMs);

            return Jwts.builder()
                    .setSubject(auth.getName())
                    .setIssuedAt(now)
                    .setExpiration(expiry)
                    .signWith(jwtSecretKey, SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            // Xử lý lỗi khi tạo token
            throw new RuntimeException("Lỗi khi tạo JWT: " + e.getMessage(), e);
        }
    }

    public String getUsernameFromJwt(String token) {
        try {
            System.out.println("JwtProvider: Getting username from token: " + token.substring(0, Math.min(50, token.length())) + "...");
            String username = Jwts.parserBuilder()
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            System.out.println("JwtProvider: Extracted username: " + username);
            return username;
        } catch (JwtException e) {
            System.err.println("JwtProvider: JWT Exception when getting username: " + e.getMessage());
            throw new RuntimeException("Token JWT không hợp lệ hoặc đã hết hạn: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("JwtProvider: General Exception when getting username: " + e.getMessage());
            throw new RuntimeException("Lỗi khi lấy username từ JWT: " + e.getMessage(), e);
        }
    }

    public boolean validateToken(String token) {
        try {
            System.out.println("JwtProvider: Validating token: " + token.substring(0, Math.min(50, token.length())) + "...");
            Jwts.parserBuilder().setSigningKey(jwtSecretKey).build().parseClaimsJws(token);
            System.out.println("JwtProvider: Token is valid");
            return true;
        } catch (JwtException e) {
            System.err.println("JwtProvider: JWT Exception when validating token: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("JwtProvider: General Exception when validating token: " + e.getMessage());
            return false;
        }
    }

    public String generateTokenFromUsername(String username) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + jwtExpirationMs);
            return Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(now)
                    .setExpiration(expiry)
                    .signWith(jwtSecretKey, SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            // Xử lý lỗi khi tạo token từ username
            throw new RuntimeException("Lỗi khi tạo JWT từ username: " + e.getMessage(), e);
        }
    }
}
