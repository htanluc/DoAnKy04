package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.mytech.apartment.portal.models.enums.FeedbackStatus;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "category")
    private FeedbackCategory category;

    private String content;
    private String imageAttachment;
    private LocalDateTime submittedAt;
    private FeedbackStatus status;
    private String response;
    private LocalDateTime respondedAt;
} 