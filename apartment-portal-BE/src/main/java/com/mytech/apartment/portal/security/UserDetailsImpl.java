package com.mytech.apartment.portal.security;

import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.Role;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class UserDetailsImpl implements UserDetails {
	private Long id;
	private String username; // giữ tên biến "username" cho interface
	private String password;
	private Collection<? extends GrantedAuthority> authorities;
	private String status;
	private Set<Role> roles;
	private String fullName; // Thêm fullName

	public UserDetailsImpl(User user) {
		this.id = user.getId();
		this.username = user.getPhoneNumber();
		this.password = user.getPasswordHash();
		this.status = user.getStatus() != null ? user.getStatus().name() : null;
		this.roles = user.getRoles();
		this.fullName = user.getFullName(); // Thêm fullName
		// Xử lý LAZY loading cho roles
		this.authorities = user.getRoles() != null ? user.getRoles().stream()
			.map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
			.collect(Collectors.toList()) : new ArrayList<>();
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
	
	public Set<Role> getRoles() {
		return roles;
	}
}
