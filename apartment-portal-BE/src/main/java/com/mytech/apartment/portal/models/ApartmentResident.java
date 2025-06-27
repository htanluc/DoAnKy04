package com.mytech.apartment.portal.models;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
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

    @Column(name = "relation_type", nullable = false)
    private String relationType;

    @Column(name = "move_in_date")
    private LocalDate moveInDate;

    @Column(name = "move_out_date")
    private LocalDate moveOutDate;
}