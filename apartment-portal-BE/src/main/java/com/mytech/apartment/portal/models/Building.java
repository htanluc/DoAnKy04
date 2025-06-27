package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "buildings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "building_name", nullable = false)
    private String buildingName;

    @Column
    private String address;

    @Column
    private Integer floors;

    @Column(columnDefinition = "TEXT")
    private String description;
}
