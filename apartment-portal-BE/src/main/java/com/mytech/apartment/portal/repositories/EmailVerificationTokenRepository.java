package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.EmailVerificationToken;
import com.mytech.apartment.portal.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);
    Optional<EmailVerificationToken> findByUser(User user);
    void deleteByToken(String token);
    void deleteByUser(User user);
} 