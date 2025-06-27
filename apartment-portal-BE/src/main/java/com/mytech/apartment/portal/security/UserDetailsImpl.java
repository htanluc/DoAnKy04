package com.mytech.apartment.portal.security;

import com.mytech.apartment.portal.models.User;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

@Data
public class UserDetailsImpl implements UserDetails {
	private Long id;
	private String username; // giữ tên biến "username" cho interface
	private String password;
	private Collection<? extends GrantedAuthority> authorities;
	private String status;

	public UserDetailsImpl(User user) {
		this.id = user.getId();
		this.username = user.getPhoneNumber(); // ← gán phoneNumber vào field này
		this.password = user.getPasswordHash(); // ← sử dụng passwordHash
		this.authorities = user.getRoles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName()))
				.collect(Collectors.toList());
		this.status = user.getStatus();
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
}
