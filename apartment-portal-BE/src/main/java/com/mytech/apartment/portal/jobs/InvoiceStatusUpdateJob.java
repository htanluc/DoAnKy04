package com.mytech.apartment.portal.jobs;

import com.mytech.apartment.portal.services.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Scheduled job để tự động cập nhật trạng thái hóa đơn quá hạn
 */
@Component
public class InvoiceStatusUpdateJob {
    
    private static final Logger logger = LoggerFactory.getLogger(InvoiceStatusUpdateJob.class);
    
    @Autowired
    private InvoiceService invoiceService;
    
    /**
     * Chạy mỗi ngày lúc 00:05 để cập nhật trạng thái quá hạn
     * Cron format: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 5 0 * * *")
    public void updateOverdueInvoiceStatus() {
        try {
            logger.info("Bắt đầu cập nhật trạng thái hóa đơn quá hạn...");
            
            int updatedCount = invoiceService.updateOverdueStatus();
            
            logger.info("Hoàn thành cập nhật trạng thái quá hạn: {} hóa đơn đã được cập nhật", updatedCount);
            
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật trạng thái hóa đơn quá hạn: {}", e.getMessage(), e);
        }
    }
}
