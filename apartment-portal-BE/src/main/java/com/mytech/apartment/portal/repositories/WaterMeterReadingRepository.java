package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.WaterMeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaterMeterReadingRepository extends JpaRepository<WaterMeterReading, Long> {

    Optional<WaterMeterReading> findByApartmentIdAndReadingMonth(
        Integer apartmentId,
        String readingMonth
    );

    Optional<WaterMeterReading>
    findTopByApartmentIdAndReadingMonthLessThanOrderByReadingMonthDesc(
        Integer apartmentId,
        String readingMonth
    );

    @Query("select distinct w.apartmentId from WaterMeterReading w")
    List<Integer> findDistinctApartmentIds();

    List<WaterMeterReading> findAllByReadingMonth(String readingMonth);

    List<WaterMeterReading> findAllByApartmentIdOrderByReadingMonthDesc(Integer apartmentId);
}