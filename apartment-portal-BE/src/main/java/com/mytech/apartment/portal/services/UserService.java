package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.UserCreateRequest;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.dtos.UserUpdateRequest;
import com.mytech.apartment.portal.mappers.UserMapper;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.models.Role;
import com.mytech.apartment.portal.repositories.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toDto).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id).map(userMapper::toDto).orElse(null)  ;
    }

    public User getUserEntityById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Transactional
    public UserDto createUser(UserCreateRequest userCreateRequest) {
        User user = userMapper.toEntity(userCreateRequest);
        user.setPasswordHash(passwordEncoder.encode(userCreateRequest.getPassword()));
        if (userCreateRequest.getRoles() != null && !userCreateRequest.getRoles().isEmpty()) {
            HashSet<Role> roles = new HashSet<>();
            for (String roleName : userCreateRequest.getRoles()) {
                Role role = roleRepository.findByName(roleName);
                if (role != null) roles.add(role);
            }
            user.setRoles(roles);
        }
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest userUpdateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));

        userMapper.updateUserFromRequest(user, userUpdateRequest);

        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * [EN] Update avatar URL for user
     * [VI] Cập nhật URL avatar cho user
     */
    public boolean updateAvatar(String username, String avatarUrl) {
        try {
            Optional<User> userOpt = userRepository.findByPhoneNumber(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setAvatarUrl(avatarUrl);
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public UserDto setUserStatus(Long id, UserStatus status, String reason) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id " + id));
        user.setStatus(status);
        if ("LOCKED".equalsIgnoreCase(status.toString()) || "INACTIVE".equalsIgnoreCase(status.toString())) {
            user.setLockReason(reason);
        } else if ("ACTIVE".equalsIgnoreCase(status.toString())) {
            user.setLockReason(null);
        }
        return userMapper.toDto(userRepository.save(user));
    }

    public UserDto resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id " + id));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        return userMapper.toDto(userRepository.save(user));
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
            .map(User::getId)
            .orElse(null);
    }

    public List<Role> getRolesOfUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return List.copyOf(user.getRoles());
    }

    public void assignRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId).orElseThrow();
        Role role = roleRepository.findById(roleId).orElseThrow();
        user.getRoles().add(role);
        userRepository.save(user);
    }

    public void removeRoleFromUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId).orElseThrow();
        Role role = roleRepository.findById(roleId).orElseThrow();
        user.getRoles().remove(role);
        userRepository.save(user);
    }

    public UserDto registerUser(UserCreateRequest userCreateRequest) {
        User user = userMapper.toEntity(userCreateRequest);
        user.setPasswordHash(passwordEncoder.encode(userCreateRequest.getPassword()));
        HashSet<Role> roles = new HashSet<>();
        Role residentRole = roleRepository.findByName("RESIDENT");
        if (residentRole == null) {
            residentRole = roleRepository.save(new Role(null, "RESIDENT", "Cư dân"));
        }
        roles.add(residentRole);
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    public User registerUserReturnEntity(UserCreateRequest userCreateRequest) {
        User user = userMapper.toEntity(userCreateRequest);
        user.setPasswordHash(passwordEncoder.encode(userCreateRequest.getPassword()));
        HashSet<Role> roles = new HashSet<>();
        Role residentRole = roleRepository.findByName("RESIDENT");
        if (residentRole == null) {
            residentRole = roleRepository.save(new Role(null, "RESIDENT", "Cư dân"));
        }
        roles.add(residentRole);
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        return savedUser;
    }

    public Long getUserIdByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .map(User::getId)
            .orElse(null);
    }

    /**
     * [EN] Get all residents (users with RESIDENT role)
     * [VI] Lấy tất cả cư dân (users có role RESIDENT)
     */
    public List<UserDto> getAllResidents() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> "RESIDENT".equals(role.getName())))
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }
}
