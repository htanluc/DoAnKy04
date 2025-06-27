package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.RefreshToken;
import com.mytech.apartment.portal.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
} 