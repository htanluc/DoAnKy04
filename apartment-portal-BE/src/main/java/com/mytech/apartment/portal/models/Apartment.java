package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import com.mytech.apartment.portal.models.enums.ApartmentStatus;

@Entity
@Table(name = "apartments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Apartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "building_id", nullable = false)
    private Long buildingId;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "unit_number", nullable = false)
    private String unitNumber;

    @Column
    private Double area;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ApartmentStatus status;
}
