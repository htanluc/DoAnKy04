// File: PaymentMethod.java
package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_methods")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {
    @Id
    @Column(name = "method_code", length = 20)
    private String methodCode; // CASH, BANK, MOMO, VISA...

    @Column(name = "method_name", nullable = false)
    private String methodName; // “Tiền mặt”, “Chuyển khoản”…

    @Column(columnDefinition = "TEXT")
    private String details;    // STK ngân hàng, số ví, v.v.
}
