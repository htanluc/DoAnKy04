package com.mytech.apartment.portal.security;

import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.authentication.DisabledException;
import org.springframework.stereotype.Service;

//src/main/java/com/mytech/apartment/portal/security/CustomUserDetailsService.java
@Service
public class CustomUserDetailsService implements UserDetailsService {
 private final UserRepository userRepo;

 public CustomUserDetailsService(UserRepository userRepo) {
     this.userRepo = userRepo;
 }

 @Override
 public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
     User user = userRepo.findByPhoneNumber(phoneNumber)
         .orElseThrow(() -> new UsernameNotFoundException("Số điện thoại không tồn tại trong hệ thống"));
     return new UserDetailsImpl(user);
 }
}
