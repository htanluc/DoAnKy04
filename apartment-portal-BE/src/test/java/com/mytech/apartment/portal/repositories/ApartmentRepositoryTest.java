package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.Building;
import com.mytech.apartment.portal.models.enums.ApartmentStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Random;

@DataJpaTest
public class ApartmentRepositoryTest {
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private BuildingRepository buildingRepository;

    @Test
    void testCreate100Apartments() {
        // Tạo 1 building trước
        Building building = Building.builder()
                .buildingName("Test Building")
                .address("123 Test St")
                .floors(10)
                .description("Test building for apartment bulk insert")
                .build();
        building = buildingRepository.save(building);

        Random random = new Random();
        for (int i = 1; i <= 100; i++) {
            Apartment apartment = Apartment.builder()
                    .buildingId(building.getId())
                    .floorNumber(1 + random.nextInt(10))
                    .unitNumber("A" + i)
                    .area(50.0 + random.nextDouble() * 100.0)
                    .status(ApartmentStatus.VACANT)
                    .build();
            apartmentRepository.save(apartment);
        }

        List<Apartment> apartments = apartmentRepository.findByBuildingId(building.getId());
        Assertions.assertEquals(100, apartments.size());
    }
} 