package com.mytech.apartment.portal.security;

import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.authentication.DisabledException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

//src/main/java/com/mytech/apartment/portal/security/CustomUserDetailsService.java
@Service
public class CustomUserDetailsService implements UserDetailsService {
 private final UserRepository userRepo;

 public CustomUserDetailsService(UserRepository userRepo) {
     this.userRepo = userRepo;
 }

 @Override
 @Transactional(readOnly = true)
 public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
     User user = userRepo.findByPhoneNumber(phoneNumber)
         .orElseThrow(() -> new UsernameNotFoundException("Số điện thoại không tồn tại trong hệ thống"));
     
     // Kiểm tra roles một cách an toàn
     if (user.getRoles() == null || user.getRoles().isEmpty()) {
         throw new DisabledException("User has no roles");
     }
     return new UserDetailsImpl(user);
 }
}
