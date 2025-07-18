package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ApartmentInvitationDto;
import com.mytech.apartment.portal.dtos.CreateInvitationRequest;
import com.mytech.apartment.portal.services.ApartmentInvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-invitations")
public class ApartmentInvitationController {
    @Autowired
    private ApartmentInvitationService invitationService;

    /**
     * Get all apartment invitations
     * Lấy tất cả lời mời căn hộ
     */
    @GetMapping
    public List<ApartmentInvitationDto> getAllInvitations() {
        return invitationService.getAllInvitations();
    }

    /**
     * Get invitation by id
     * Lấy lời mời theo id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApartmentInvitationDto> getInvitationById(@PathVariable("id") Long id) {
        return invitationService.getInvitationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get invitation by code
     * Lấy lời mời theo mã code
     */
    @GetMapping("/by-code/{code}")
    public ResponseEntity<ApartmentInvitationDto> getInvitationByCode(@PathVariable("code") String code) {
        return invitationService.getInvitationByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new apartment invitation
     * Tạo lời mời căn hộ mới
     */
    @PostMapping
    public ApartmentInvitationDto createInvitation(@RequestBody CreateInvitationRequest request) {
        return invitationService.createInvitation(request.getApartmentId(), request.getValidityInHours());
    }

    /**
     * Update invitation by id
     * Cập nhật lời mời theo id
     */
    @PutMapping("/by-code/{code}/use")
    public ResponseEntity<ApartmentInvitationDto> useInvitation(@PathVariable String code, @RequestParam Long userId) {
        try {
            ApartmentInvitationDto usedInvitation = invitationService.markAsUsed(code, userId);
            return ResponseEntity.ok(usedInvitation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null); // Hoặc trả về message lỗi cụ thể
        }
    }

    /**
     * Delete invitation by id
     * Xóa lời mời theo id
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvitation(@PathVariable Long id) {
        invitationService.deleteInvitation(id);
        return ResponseEntity.noContent().build();
    }
} 