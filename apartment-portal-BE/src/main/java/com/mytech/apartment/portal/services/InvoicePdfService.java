package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceItemDto;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Optional;

// OpenPDF
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Service
public class InvoicePdfService {

    @Autowired
    private ApartmentRepository apartmentRepository;

    // Sinh PDF bằng OpenPDF và nhúng font Unicode để hiển thị tiếng Việt chuẩn
    public byte[] generateInvoicePdf(InvoiceDto invoice) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // Tải font Unicode từ classpath resources: resources/fonts/DejaVuSans.ttf
            Font fontNormal = resolveUnicodeFont(11f, Font.NORMAL);
            Font fontHeader = resolveUnicodeFont(16f, Font.BOLD);

            Paragraph title = new Paragraph("HÓA ĐƠN CĂN HỘ", fontHeader);
            title.setAlignment(Element.ALIGN_LEFT);
            title.setSpacingAfter(10f);
            doc.add(title);

            NumberFormat nf = NumberFormat.getInstance(Locale.of("vi", "VN"));

            // Lấy thông tin căn hộ
            String apartmentInfo = "Căn hộ: #" + invoice.getApartmentId();
            Optional<Apartment> apartmentOpt = apartmentRepository.findById(invoice.getApartmentId());
            if (apartmentOpt.isPresent()) {
                Apartment apartment = apartmentOpt.get();
                apartmentInfo = "Căn hộ: " + apartment.getUnitNumber() + " (ID: #" + invoice.getApartmentId() + ")";
            }

            doc.add(new Paragraph("Mã hóa đơn: #" + invoice.getId(), fontNormal));
            doc.add(new Paragraph(apartmentInfo, fontNormal));
            doc.add(new Paragraph("Kỳ: " + invoice.getBillingPeriod(), fontNormal));
            doc.add(new Paragraph("Phát hành: " + String.valueOf(invoice.getIssueDate()), fontNormal));
            doc.add(new Paragraph("Đến hạn: " + String.valueOf(invoice.getDueDate()), fontNormal));

            doc.add(new Paragraph(" ", fontNormal));

            // Bảng chi tiết
            PdfPTable table = new PdfPTable(new float[]{1f, 4f, 2f, 2f});
            table.setWidthPercentage(100);

            table.addCell(headerCell("STT", fontNormal));
            table.addCell(headerCell("Mô tả", fontNormal));
            table.addCell(headerCell("Loại", fontNormal));
            table.addCell(headerCell("Số tiền", fontNormal));

            if (invoice.getItems() != null) {
                int idx = 1;
                for (InvoiceItemDto item : invoice.getItems()) {
                    table.addCell(centerCell(String.valueOf(idx++), fontNormal));
                    table.addCell(normalCell(item.getDescription(), fontNormal));
                    table.addCell(centerCell(String.valueOf(item.getFeeType()), fontNormal));
                    table.addCell(rightCell(nf.format(item.getAmount()), fontNormal));
                }
            }
            doc.add(table);

            doc.add(new Paragraph(" ", fontNormal));
            Paragraph total = new Paragraph("Tổng cộng: " + nf.format(invoice.getTotalAmount()) + " VND", fontHeader);
            doc.add(total);

        } catch (DocumentException e) {
            // Fallback đơn giản nếu có lỗi
            return ("PDF generation error: " + e.getMessage()).getBytes(StandardCharsets.UTF_8);
        } finally {
            doc.close();
        }
        return baos.toByteArray();
    }

    private Font resolveUnicodeFont(float size, int style) {
        try {
            InputStream is = getClass().getClassLoader().getResourceAsStream("fonts/DejaVuSans.ttf");
            if (is != null) {
                byte[] bytes = is.readAllBytes();
                BaseFont bf = BaseFont.createFont("DejaVuSans.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, bytes, null);
                return new Font(bf, size, style);
            }
        } catch (Exception ignored) {}
        // Fallback: Helvetica (không hỗ trợ dấu, chỉ dùng khi thiếu font)
        return new Font(Font.HELVETICA, size, style);
    }

    private PdfPCell headerCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5f);
        return cell;
    }

    private PdfPCell normalCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5f);
        return cell;
    }

    private PdfPCell centerCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5f);
        return cell;
    }

    private PdfPCell rightCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(5f);
        return cell;
    }
}


