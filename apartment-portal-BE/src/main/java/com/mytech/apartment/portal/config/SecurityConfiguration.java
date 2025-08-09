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
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
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
          .cors(cors -> cors.configurationSource(corsConfigurationSource()))
          .csrf(csrf -> csrf.disable())
          .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
          .authorizeHttpRequests(auth -> auth
              .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
              .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/webjars/**").permitAll()
              .requestMatchers("/api/auth/**").permitAll()
              .requestMatchers("/uploads/**", "/api/files/**").permitAll()  // Static files không cần auth
              .requestMatchers("/stripe-checkout.html", "/api/payments/stripe/success", "/api/payments/stripe/cancel", "/api/payments/stripe/webhook").permitAll()  // Stripe checkout pages cần thiết
              .requestMatchers("/api/admin/**").hasRole("ADMIN")
              .requestMatchers("/api/apartments/admin/**").hasRole("ADMIN")
              .requestMatchers("/api/apartments/**").hasRole("RESIDENT")
              .requestMatchers("/api/invoices/**","/api/facility-bookings/**","/api/residents/**", "/api/announcements/**", "/api/events/**", "/api/facilities/**", "/api/feedback/**", "/api/support-requests/**", "/api/upload/**", "/api/event-registrations/**", "/api/activity-logs/**", "/api/vehicles/**")
                  .hasRole("RESIDENT")
              .anyRequest().authenticated()
          )
          .exceptionHandling(ex -> ex.authenticationEntryPoint(customAuthenticationEntryPoint()))
          .addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = 
            http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
            .userDetailsService(userDetailsService)
            .passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
