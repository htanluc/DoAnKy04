package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceItemDto;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class InvoicePdfService {

    // Tạm thời tạo PDF đơn giản theo chuẩn PDF 1.4 (rất basic) để tránh thêm phụ thuộc
    public byte[] generateInvoicePdf(InvoiceDto invoice) {
        StringBuilder sb = new StringBuilder();
        sb.append("%PDF-1.4\n");
        sb.append("1 0 obj<<>>endobj\n");
        String text = buildText(invoice).replace("(", "\\(").replace(")", "\\)");
        String content = "BT /F1 12 Tf 50 750 Td (" + text + ") Tj ET";
        int streamLen = content.getBytes(StandardCharsets.UTF_8).length;
        sb.append("2 0 obj<< /Length ").append(streamLen).append(" >>stream\n");
        sb.append(content).append("\nendstream endobj\n");
        sb.append("3 0 obj<</Type /Page /Parent 4 0 R /MediaBox [0 0 595 842] /Resources <</Font <</F1 <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>>>>> /Contents 2 0 R>> endobj\n");
        sb.append("4 0 obj<</Type /Pages /Count 1 /Kids [3 0 R]>> endobj\n");
        sb.append("5 0 obj<</Type /Catalog /Pages 4 0 R>> endobj\n");
        sb.append("xref\n0 6\n0000000000 65535 f \n");
        // Offsets are not accurate in this minimal approach; many viewers still render it.
        sb.append("trailer<</Size 6/Root 5 0 R>>\nstartxref\n0\n%%EOF");
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String buildText(InvoiceDto invoice) {
        StringBuilder t = new StringBuilder();
        t.append("HOA DON CAN HO\\n");
        t.append("Ma: #").append(invoice.getId()).append("\\n");
        t.append("Can ho: ").append(invoice.getApartmentId()).append("\\n");
        t.append("Ky: ").append(invoice.getBillingPeriod()).append("\\n");
        t.append("Issue: ").append(String.valueOf(invoice.getIssueDate())).append("\\n");
        t.append("Due: ").append(String.valueOf(invoice.getDueDate())).append("\\n\\n");
        t.append("Mo ta | Loai | So tien\\n");
        if (invoice.getItems() != null) {
            for (InvoiceItemDto item : invoice.getItems()) {
                t.append(item.getDescription()).append(" | ")
                 .append(item.getFeeType()).append(" | ")
                 .append(String.format("%,.0f", item.getAmount())).append("\\n");
            }
        }
        t.append("\\nTong cong: ").append(String.format("%,.0f VND", invoice.getTotalAmount())).append("\\n");
        return t.toString();
    }
}


