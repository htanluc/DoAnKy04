package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.RoleDto;
import com.mytech.apartment.portal.mappers.RoleMapper;
import com.mytech.apartment.portal.models.Role;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.RoleRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleMapper roleMapper;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Optional<Role> getRoleById(Long id) {
        return roleRepository.findById(id);
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public Role updateRole(Long id, Role role) {
        Role existing = roleRepository.findById(id).orElseThrow();
        existing.setName(role.getName());
        existing.setDescription(role.getDescription());
        return roleRepository.save(existing);
    }

    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
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

    public List<Role> getRolesOfUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return List.copyOf(user.getRoles());
    }

    public List<RoleDto> getAllRoleDtos() {
        return roleRepository.findAll().stream().map(roleMapper::toDto).toList();
    }
} 