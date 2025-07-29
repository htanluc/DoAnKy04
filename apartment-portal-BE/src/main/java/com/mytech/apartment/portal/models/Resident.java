package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "residents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resident {
    @Id
    @Column(name = "user_id")
    private Long userId;  // liên kết tới User, là khóa chính

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "id_card_number", unique = true)
    private String idCardNumber;

    @Column(name = "family_relation")
    private String familyRelation;

    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private java.util.List<EmergencyContact> emergencyContacts = new java.util.ArrayList<>();

    @Column(name = "status", nullable = false)
    @Builder.Default
    private Integer status = 0;
}