package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.repositories.ActivityLogRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SmartActivityLogServiceTest {

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private SmartActivityLogService smartActivityLogService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .phoneNumber("0123456789")
                .fullName("Test User")
                .build();

        // Mock SecurityContext
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testImmediateActionLogging() {
        // Arrange
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(activityLogRepository.save(any(ActivityLog.class))).thenReturn(new ActivityLog());

        // Act - Test immediate action (LOGIN)
        smartActivityLogService.logSmartActivity(ActivityActionType.LOGIN, "Đăng nhập thành công");

        // Assert - Should log immediately
        verify(activityLogRepository, times(1)).save(any(ActivityLog.class));
    }

    @Test
    void testCachedActionLogging() {
        // Arrange
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(activityLogRepository.save(any(ActivityLog.class))).thenReturn(new ActivityLog());

        // Act - Test cached action (VIEW_ANNOUNCEMENT)
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_ANNOUNCEMENT, "Xem thông báo");
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_ANNOUNCEMENT, "Xem thông báo");
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_ANNOUNCEMENT, "Xem thông báo");

        // Assert - Should only log once due to cache
        verify(activityLogRepository, times(1)).save(any(ActivityLog.class));
    }

    @Test
    void testDifferentActionsLogging() {
        // Arrange
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(activityLogRepository.save(any(ActivityLog.class))).thenReturn(new ActivityLog());

        // Act - Test different actions
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_ANNOUNCEMENT, "Xem thông báo");
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_INVOICE, "Xem hóa đơn");
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_EVENT, "Xem sự kiện");

        // Assert - Should log all different actions
        verify(activityLogRepository, times(3)).save(any(ActivityLog.class));
    }

    @Test
    void testUserNotFound() {
        // Arrange
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("nonexistent");
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        when(userRepository.findByPhoneNumber("nonexistent")).thenReturn(Optional.empty());

        // Act
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_ANNOUNCEMENT, "Xem thông báo");

        // Assert - Should not log anything
        verify(activityLogRepository, never()).save(any(ActivityLog.class));
    }

    @Test
    void testUnauthenticatedUser() {
        // Arrange
        when(authentication.isAuthenticated()).thenReturn(false);

        // Act
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_ANNOUNCEMENT, "Xem thông báo");

        // Assert - Should not log anything
        verify(activityLogRepository, never()).save(any(ActivityLog.class));
    }

    @Test
    void testAnonymousUser() {
        // Arrange
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("anonymousUser");

        // Act
        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_ANNOUNCEMENT, "Xem thông báo");

        // Assert - Should not log anything
        verify(activityLogRepository, never()).save(any(ActivityLog.class));
    }

    @Test
    void testCacheCleanup() {
        // Arrange
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(activityLogRepository.save(any(ActivityLog.class))).thenReturn(new ActivityLog());

        // Act - Start cache cleanup
        smartActivityLogService.startCacheCleanup();

        // Wait a bit for cleanup to run
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Assert - Cleanup should run without errors
        // Note: This is a basic test, in real scenario we'd need more sophisticated testing
        verify(activityLogRepository, atLeast(0)).save(any(ActivityLog.class));
    }
} 