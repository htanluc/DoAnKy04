package com.mytech.apartment.portal.models;

import java.time.LocalDate;

import com.mytech.apartment.portal.models.enums.RelationType;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "apartment_residents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApartmentResident {
    @EmbeddedId
    private ApartmentResidentId id;

    @ManyToOne
    @MapsId("apartmentId")
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "relation_type", nullable = false)
    private RelationType relationType;

    @Column(name = "move_in_date")
    private LocalDate moveInDate;

    @Column(name = "move_out_date")
    private LocalDate moveOutDate;

    @Column(name = "is_primary_resident")
    private Boolean isPrimaryResident = false;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    public Long getApartmentId() {
        return id != null ? id.getApartmentId() : null;
    }

    public Long getUserId() {
        return id != null ? id.getUserId() : null;
    }

    public void setApartmentId(Long apartmentId) {
        if (id == null) {
            id = new ApartmentResidentId();
        }
        id.setApartmentId(apartmentId);
    }

    public void setUserId(Long userId) {
        if (id == null) {
            id = new ApartmentResidentId();
        }
        id.setUserId(userId);
    }
}