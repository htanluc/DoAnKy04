package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_code", unique = true)
    private String categoryCode;

    private String categoryName;
    private String assignedRole;
    private String description;
} 