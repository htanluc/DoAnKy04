package com.mytech.apartment.portal.models;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ApartmentResidentId implements Serializable {
    /**
	 * 
	 */
	private static final long serialVersionUID = 110423181307585929L;

	@Column(name = "apartment_id")
    private Long apartmentId;

    @Column(name = "user_id")
    private Long userId;
}