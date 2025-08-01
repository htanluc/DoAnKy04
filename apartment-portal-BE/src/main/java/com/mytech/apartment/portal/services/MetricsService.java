package com.mytech.apartment.portal.services;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class MetricsService {

    private final Counter userLoginCounter;
    private final Counter userRegistrationCounter;
    private final Counter paymentSuccessCounter;
    private final Counter paymentFailureCounter;
    private final Timer apartmentOperationTimer;
    private final Timer paymentProcessingTimer;

    public MetricsService(MeterRegistry meterRegistry) {
        this.userLoginCounter = Counter.builder("user.login.total")
                .description("Total number of user logins")
                .register(meterRegistry);
        
        this.userRegistrationCounter = Counter.builder("user.registration.total")
                .description("Total number of user registrations")
                .register(meterRegistry);
        
        this.paymentSuccessCounter = Counter.builder("payment.success.total")
                .description("Total number of successful payments")
                .register(meterRegistry);
        
        this.paymentFailureCounter = Counter.builder("payment.failure.total")
                .description("Total number of failed payments")
                .register(meterRegistry);
        
        this.apartmentOperationTimer = Timer.builder("apartment.operation.duration")
                .description("Time taken for apartment operations")
                .register(meterRegistry);
        
        this.paymentProcessingTimer = Timer.builder("payment.processing.duration")
                .description("Time taken for payment processing")
                .register(meterRegistry);
    }

    public void incrementUserLogin() {
        userLoginCounter.increment();
    }

    public void incrementUserRegistration() {
        userRegistrationCounter.increment();
    }

    public void incrementPaymentSuccess() {
        paymentSuccessCounter.increment();
    }

    public void incrementPaymentFailure() {
        paymentFailureCounter.increment();
    }

    public Timer.Sample startApartmentOperationTimer() {
        return Timer.start();
    }

    public void stopApartmentOperationTimer(Timer.Sample sample) {
        sample.stop(apartmentOperationTimer);
    }

    public Timer.Sample startPaymentProcessingTimer() {
        return Timer.start();
    }

    public void stopPaymentProcessingTimer(Timer.Sample sample) {
        sample.stop(paymentProcessingTimer);
    }

    public void recordApartmentOperationDuration(long duration, TimeUnit unit) {
        apartmentOperationTimer.record(duration, unit);
    }

    public void recordPaymentProcessingDuration(long duration, TimeUnit unit) {
        paymentProcessingTimer.record(duration, unit);
    }
} 