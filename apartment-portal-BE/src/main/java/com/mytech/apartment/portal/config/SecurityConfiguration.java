package com.mytech.apartment.portal.config;

import com.mytech.apartment.portal.security.CustomUserDetailsService;
import com.mytech.apartment.portal.security.jwt.JwtAuthenticationFilter;
import com.mytech.apartment.portal.security.jwt.JwtProvider;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fasterxml.jackson.databind.ObjectMapper;


import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private final CustomUserDetailsService userDetailsService;
    private final JwtProvider jwtProvider;

    public SecurityConfiguration(CustomUserDetailsService uds, JwtProvider jp) {
        this.userDetailsService = uds;
        this.jwtProvider = jp;
    }

    @Bean
    public JwtAuthenticationFilter authenticationJwtTokenFilter() {
        return new JwtAuthenticationFilter(jwtProvider, userDetailsService);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:3000","http://localhost:3001"));
        cfg.setAllowCredentials(true);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            String message = "Đăng nhập thất bại";
            Throwable cause = authException.getCause() != null ? authException.getCause() : authException;
            if (cause instanceof DisabledException) {
                message = cause.getMessage();
            } else if (cause instanceof UsernameNotFoundException) {
                message = cause.getMessage();
            } else if (cause instanceof BadCredentialsException) {
                message = "Sai mật khẩu hoặc tài khoản";
            } else {
                message = authException.getMessage();
            }
            body.put("message", message);
            new ObjectMapper().writeValue(response.getOutputStream(), body);
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
          .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Sử dụng cấu hình CORS đã định nghĩa
          .csrf(csrf -> csrf.disable())
          .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
          .and()
          .authorizeHttpRequests(auth -> auth
              // Cho phép pre-flight CORS cho tất cả
              .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
              // Swagger UI
              .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/webjars/**").permitAll()
              // Auth endpoints - cho phép tất cả
              .requestMatchers("/api/auth/**").permitAll()
              // Chỉ ADMIN mới được truy cập các endpoint quản lý user/role
              .requestMatchers("/api/admin/users/**", "/api/admin/roles/**").hasAuthority("ADMIN")
              // Các endpoint khác cần authentication
              .anyRequest().authenticated()
          )
          .exceptionHandling().authenticationEntryPoint(customAuthenticationEntryPoint())
          .and()
          .addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                   .userDetailsService(userDetailsService)
                   .passwordEncoder(passwordEncoder())
                   .and().build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
