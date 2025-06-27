package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.FeedbackCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackCategoryRepository extends JpaRepository<FeedbackCategory, String> {
} 