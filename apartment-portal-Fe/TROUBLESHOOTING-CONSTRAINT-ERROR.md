# 🔧 Troubleshooting: chk_invoice_amount Constraint Violation Error

## 🚨 Error Description
```
Lỗi khi tạo biểu phí: could not execute statement [Check constraint 'chk_invoice_amount' is violated.] 
[insert into invoices (apartment_id,billing_period,created_at,due_date,issue_date,status,total_amount,updated_at) 
values (?,?,?,?,?,?,?,?)]
```

## 📋 Root Cause Analysis

### 1. **Database Constraint Definition**
The `chk_invoice_amount` constraint likely enforces one of these rules:
- `total_amount >= 0` (non-negative values)
- `total_amount > 0` (positive values only)
- `total_amount BETWEEN 0 AND 999999999` (reasonable range)

### 2. **Potential Causes**

#### A. **Negative Calculation Results**
```sql
-- Check if any calculations result in negative values
SELECT 
    apartment_id,
    billing_period,
    service_fee,
    water_fee, 
    parking_fee,
    total_amount
FROM invoices 
WHERE total_amount < 0;
```

#### B. **Missing or Invalid Data**
- **Apartment area is NULL or 0**: Service fee calculation fails
- **Water consumption is negative**: Water fee calculation fails  
- **Vehicle data is missing**: Parking fee calculation fails
- **Resident data is missing**: Cannot link apartment to resident

#### C. **Calculation Logic Errors**
```java
// Potential issues in calculation:
totalAmount = serviceFee + waterFee + parkingFee;

// If any component is null/negative, total becomes invalid
// Check for:
// - Null pointer exceptions
// - Division by zero
// - Overflow/underflow
// - Type casting issues
```

## 🔍 Investigation Steps

### Step 1: Check Database Schema
```sql
-- Check constraint definition
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'chk_invoice_amount';

-- Check invoices table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'invoices';
```

### Step 2: Validate Input Data
```sql
-- Check apartments with missing/invalid data
SELECT 
    id,
    unit_number,
    area,
    building,
    floor
FROM apartments 
WHERE area IS NULL OR area <= 0;

-- Check water meter readings
SELECT 
    apartment_id,
    reading_month,
    current_reading,
    previous_reading,
    (current_reading - previous_reading) as consumption
FROM water_meter_readings 
WHERE current_reading < previous_reading 
   OR current_reading IS NULL 
   OR previous_reading IS NULL;

-- Check vehicle registrations (updated for new vehicle types)
SELECT 
    apartment_id,
    vehicle_type,
    status,
    COUNT(*) as vehicle_count
FROM vehicles 
WHERE apartment_id IS NOT NULL 
  AND status = 'APPROVED'
  AND vehicle_type IN ('MOTORBIKE', 'CAR_4_SEATS', 'CAR_7_SEATS')
GROUP BY apartment_id, vehicle_type, status;
```

### Step 3: Test Calculation Logic
```java
// Add debug logging to yearly billing service
public void generateYearlyBilling(YearlyBillingRequest request) {
    for (Apartment apartment : apartments) {
        try {
            // Log apartment data
            log.info("Processing apartment: {}", apartment.getId());
            log.info("Area: {}, Water consumption: {}, Vehicles: {}", 
                apartment.getArea(), 
                getWaterConsumption(apartment.getId(), month, year),
                getVehicleCount(apartment.getId()));
            
            // Calculate each fee component
            BigDecimal serviceFee = calculateServiceFee(apartment.getArea(), request.getServiceFeePerM2());
            BigDecimal waterFee = calculateWaterFee(apartment.getId(), month, year, request.getWaterFeePerM3());
            BigDecimal parkingFee = calculateParkingFee(apartment.getId(), request);
            
            // Log individual calculations
            log.info("Service fee: {}, Water fee: {}, Parking fee: {}", 
                serviceFee, waterFee, parkingFee);
            
            BigDecimal totalAmount = serviceFee.add(waterFee).add(parkingFee);
            log.info("Total amount: {}", totalAmount);
            
            // Validate before insert
            if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
                log.error("Invalid total amount: {} for apartment: {}", totalAmount, apartment.getId());
                throw new IllegalArgumentException("Total amount must be positive");
            }
            
            // Insert invoice
            createInvoice(apartment.getId(), totalAmount, billingPeriod);
            
        } catch (Exception e) {
            log.error("Error processing apartment {}: {}", apartment.getId(), e.getMessage());
            throw e;
        }
    }
}
```

### Step 4: Check Calculation Methods
```java
// Service Fee Calculation
private BigDecimal calculateServiceFee(BigDecimal area, BigDecimal ratePerM2) {
    if (area == null || area.compareTo(BigDecimal.ZERO) <= 0) {
        log.warn("Invalid apartment area: {}", area);
        return BigDecimal.ZERO; // or throw exception
    }
    if (ratePerM2 == null || ratePerM2.compareTo(BigDecimal.ZERO) <= 0) {
        log.warn("Invalid service fee rate: {}", ratePerM2);
        return BigDecimal.ZERO; // or throw exception
    }
    return area.multiply(ratePerM2);
}

// Water Fee Calculation
private BigDecimal calculateWaterFee(Long apartmentId, int month, int year, BigDecimal ratePerM3) {
    WaterMeterReading reading = getWaterReading(apartmentId, month, year);
    if (reading == null) {
        log.warn("No water reading found for apartment: {} month: {} year: {}", apartmentId, month, year);
        return BigDecimal.ZERO;
    }
    
    BigDecimal consumption = reading.getCurrentReading().subtract(reading.getPreviousReading());
    if (consumption.compareTo(BigDecimal.ZERO) < 0) {
        log.warn("Negative water consumption: {} for apartment: {}", consumption, apartmentId);
        return BigDecimal.ZERO; // or use absolute value
    }
    
    return consumption.multiply(ratePerM3);
}

// Updated Parking Fee Calculation for new vehicle types
private BigDecimal calculateParkingFee(Long apartmentId, YearlyBillingRequest request) {
    List<Vehicle> vehicles = getApprovedVehicles(apartmentId);
    BigDecimal totalFee = BigDecimal.ZERO;
    
    for (Vehicle vehicle : vehicles) {
        switch (vehicle.getType()) {
            case "MOTORBIKE":
                totalFee = totalFee.add(request.getMotorcycleFee());
                break;
            case "CAR_4_SEATS":
                totalFee = totalFee.add(request.getCar4SeatsFee());
                break;
            case "CAR_7_SEATS":
                totalFee = totalFee.add(request.getCar7SeatsFee());
                break;
            default:
                log.warn("Unknown vehicle type: {} for apartment: {}", vehicle.getType(), apartmentId);
                break;
        }
    }
    
    return totalFee;
}
```

## 🛠️ Recommended Fixes

### 1. **Add Data Validation**
```java
@Validated
public class YearlyBillingService {
    
    @Valid
    public void generateYearlyBilling(@Valid YearlyBillingRequest request) {
        // Validate request
        validateRequest(request);
        
        // Validate apartment data before processing
        List<Apartment> apartments = getApartments(request.getApartmentId());
        for (Apartment apartment : apartments) {
            validateApartmentData(apartment);
        }
        
        // Process billing
        processBilling(request, apartments);
    }
    
    private void validateApartmentData(Apartment apartment) {
        if (apartment.getArea() == null || apartment.getArea().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid apartment area for apartment: " + apartment.getId());
        }
        
        // Check if apartment has residents
        if (getResidents(apartment.getId()).isEmpty()) {
            log.warn("Apartment {} has no residents", apartment.getId());
        }
    }
}
```

### 2. **Handle Missing Data Gracefully**
```java
private BigDecimal calculateServiceFee(BigDecimal area, BigDecimal ratePerM2) {
    if (area == null || area.compareTo(BigDecimal.ZERO) <= 0) {
        log.warn("Using default area for service fee calculation");
        area = new BigDecimal("50"); // Default area
    }
    return area.multiply(ratePerM2);
}

private BigDecimal calculateWaterFee(Long apartmentId, int month, int year, BigDecimal ratePerM3) {
    WaterMeterReading reading = getWaterReading(apartmentId, month, year);
    if (reading == null) {
        log.warn("No water reading for apartment: {}, using default consumption", apartmentId);
        return new BigDecimal("10").multiply(ratePerM3); // Default 10m³
    }
    
    BigDecimal consumption = reading.getCurrentReading().subtract(reading.getPreviousReading());
    if (consumption.compareTo(BigDecimal.ZERO) < 0) {
        log.warn("Negative consumption for apartment: {}, using absolute value", apartmentId);
        consumption = consumption.abs();
    }
    
    return consumption.multiply(ratePerM3);
}
```

### 3. **Add Pre-insert Validation**
```java
private void createInvoice(Long apartmentId, BigDecimal totalAmount, String billingPeriod) {
    // Validate total amount before insert
    if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException("Total amount must be positive: " + totalAmount);
    }
    
    // Check for existing invoice
    if (invoiceExists(apartmentId, billingPeriod)) {
        log.warn("Invoice already exists for apartment: {} period: {}", apartmentId, billingPeriod);
        return; // Skip creation
    }
    
    // Create invoice
    Invoice invoice = new Invoice();
    invoice.setApartmentId(apartmentId);
    invoice.setTotalAmount(totalAmount);
    invoice.setBillingPeriod(billingPeriod);
    // ... set other fields
    
    invoiceRepository.save(invoice);
}
```

### 4. **Update Database Constraint**
```sql
-- If constraint is too restrictive, consider updating it
ALTER TABLE invoices DROP CONSTRAINT chk_invoice_amount;
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_amount 
    CHECK (total_amount >= 0 AND total_amount <= 999999999);
```

## 📊 Monitoring and Prevention

### 1. **Add Logging**
```java
@Slf4j
public class YearlyBillingService {
    
    public void generateYearlyBilling(YearlyBillingRequest request) {
        log.info("Starting yearly billing generation for year: {}", request.getYear());
        
        try {
            // ... processing logic
            
            log.info("Successfully generated {} invoices", invoiceCount);
        } catch (Exception e) {
            log.error("Failed to generate yearly billing: {}", e.getMessage(), e);
            throw e;
        }
    }
}
```

### 2. **Add Metrics**
```java
@Component
public class BillingMetrics {
    
    private final MeterRegistry meterRegistry;
    
    public void recordBillingGeneration(int year, int invoiceCount, BigDecimal totalAmount) {
        meterRegistry.counter("billing.generation", "year", String.valueOf(year))
            .increment();
        
        meterRegistry.gauge("billing.invoices.count", invoiceCount);
        meterRegistry.gauge("billing.total.amount", totalAmount.doubleValue());
    }
}
```

### 3. **Data Quality Checks**
```sql
-- Regular data quality checks
SELECT 
    'apartments_without_area' as issue,
    COUNT(*) as count
FROM apartments 
WHERE area IS NULL OR area <= 0

UNION ALL

SELECT 
    'apartments_without_residents' as issue,
    COUNT(*) as count
FROM apartments a
LEFT JOIN residents r ON a.id = r.apartment_id
WHERE r.id IS NULL

UNION ALL

SELECT 
    'negative_water_consumption' as issue,
    COUNT(*) as count
FROM water_meter_readings 
WHERE current_reading < previous_reading

UNION ALL

SELECT 
    'invalid_vehicle_types' as issue,
    COUNT(*) as count
FROM vehicles 
WHERE vehicle_type NOT IN ('MOTORBIKE', 'CAR_4_SEATS', 'CAR_7_SEATS')
  AND status = 'APPROVED';
```

## 🎯 Summary

The `chk_invoice_amount` constraint violation is likely caused by:

1. **Missing or invalid apartment data** (area, residents)
2. **Invalid water consumption data** (negative readings)
3. **Calculation logic errors** (null handling, type casting)
4. **Missing vehicle data** for parking fee calculation
5. **Invalid vehicle types** (new API supports specific vehicle types)

**Recommended actions:**
1. ✅ Add comprehensive data validation
2. ✅ Handle missing data gracefully with defaults
3. ✅ Add detailed logging for debugging
4. ✅ Implement pre-insert validation
5. ✅ Consider updating database constraints if needed
6. ✅ Add monitoring and alerting for data quality issues
7. ✅ Update vehicle type handling for new API structure

This should resolve the constraint violation and provide better error handling for the yearly billing feature. 