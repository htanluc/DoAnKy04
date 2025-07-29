package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.ResidentCreateRequest;
import com.mytech.apartment.portal.dtos.ResidentDto;
import com.mytech.apartment.portal.dtos.ResidentUpdateRequest;
import com.mytech.apartment.portal.dtos.EmergencyContactDto;
import com.mytech.apartment.portal.models.Resident;
import com.mytech.apartment.portal.models.EmergencyContact;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ResidentMapper {

    public ResidentDto toDto(Resident entity) {
        if (entity == null) {
            return null;
        }
        ResidentDto dto = new ResidentDto();
        dto.setUserId(entity.getUserId());
        dto.setFullName(entity.getFullName());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setIdCardNumber(entity.getIdCardNumber());
        dto.setFamilyRelation(entity.getFamilyRelation());
        dto.setStatus(entity.getStatus());
        // Map emergencyContacts
        if (entity.getEmergencyContacts() != null) {
            dto.setEmergencyContacts(entity.getEmergencyContacts().stream().map(this::toEmergencyContactDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private EmergencyContactDto toEmergencyContactDto(EmergencyContact contact) {
        if (contact == null) return null;
        EmergencyContactDto dto = new EmergencyContactDto();
        dto.setId(contact.getId());
        dto.setName(contact.getName());
        dto.setPhone(contact.getPhone());
        dto.setRelationship(contact.getRelationship());
        return dto;
    }

    public Resident toEntity(ResidentCreateRequest request) {
        if (request == null) {
            return null;
        }
        Resident entity = new Resident();
        entity.setFullName(request.getFullName());
        entity.setDateOfBirth(request.getDateOfBirth());
        entity.setIdCardNumber(request.getIdCardNumber());
        entity.setFamilyRelation(request.getFamilyRelation());
        // Map emergencyContacts nếu có
        if (request.getEmergencyContacts() != null) {
            for (EmergencyContactDto dto : request.getEmergencyContacts()) {
                EmergencyContact contact = new EmergencyContact();
                contact.setName(dto.getName());
                contact.setPhone(dto.getPhone());
                contact.setRelationship(dto.getRelationship());
                contact.setResident(entity);
                entity.getEmergencyContacts().add(contact);
            }
        }
        return entity;
    }

    public void updateEntityFromRequest(Resident entity, ResidentUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        if (request.getFullName() != null) {
            entity.setFullName(request.getFullName());
        }
        if (request.getDateOfBirth() != null) {
            entity.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getIdCardNumber() != null) {
            entity.setIdCardNumber(request.getIdCardNumber());
        }
        if (request.getFamilyRelation() != null) {
            entity.setFamilyRelation(request.getFamilyRelation());
        }
        // Cập nhật emergencyContacts
        if (request.getEmergencyContacts() != null) {
            entity.getEmergencyContacts().clear();
            for (EmergencyContactDto dto : request.getEmergencyContacts()) {
                EmergencyContact contact = new EmergencyContact();
                contact.setName(dto.getName());
                contact.setPhone(dto.getPhone());
                contact.setRelationship(dto.getRelationship());
                contact.setResident(entity);
                entity.getEmergencyContacts().add(contact);
            }
        }
    }
}