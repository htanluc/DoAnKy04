package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.WaterMeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterMeterReadingRepository extends JpaRepository<WaterMeterReading, Long> {

    Optional<WaterMeterReading> findByApartmentIdAndReadingDate(
        Long apartmentId,
        LocalDate readingDate
    );

    Optional<WaterMeterReading>
    findTopByApartmentIdAndReadingDateLessThanOrderByReadingDateDesc(
        Long apartmentId,
        LocalDate readingDate
    );

    @Query("select distinct w.apartmentId from WaterMeterReading w")
    List<Long> findDistinctApartmentIds();

    List<WaterMeterReading> findAllByReadingDate(LocalDate readingDate);

    List<WaterMeterReading> findAllByApartmentIdOrderByReadingDateDesc(Long apartmentId);
}