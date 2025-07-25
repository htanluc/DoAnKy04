package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_qa_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQaHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long qaId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String aiAnswer;

    private LocalDateTime askedAt;
    private Integer responseTime; // ms
    private String feedback;
} 