package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feedback_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackCategory {
    @Id
    @Column(name = "category_code")
    private String categoryCode;

    private String categoryName;
    private String description;
} 