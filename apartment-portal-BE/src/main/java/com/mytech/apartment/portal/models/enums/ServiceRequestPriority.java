package com.mytech.apartment.portal.models.enums;

public enum ServiceRequestPriority {
    P1,
    P2,
    P3,
    P4,
    P5;

    /**
     * Convert string to ServiceRequestPriority
     */
    public static ServiceRequestPriority fromString(String priority) {
        if (priority == null || priority.trim().isEmpty()) {
            return P3; // Default to medium priority
        }
        
        switch (priority.toUpperCase()) {
            case "P1":
            case "URGENT":
            case "HIGH":
                return P1;
            case "P2":
            case "MEDIUM_HIGH":
                return P2;
            case "P3":
            case "MEDIUM":
                return P3;
            case "P4":
            case "LOW":
                return P4;
            case "P5":
            case "VERY_LOW":
                return P5;
            default:
                return P3; // Default to medium priority
        }
    }

    /**
     * Get display value for the priority
     */
    public String getValue() {
        switch (this) {
            case P1:
                return "URGENT";
            case P2:
                return "HIGH";
            case P3:
                return "MEDIUM";
            case P4:
                return "LOW";
            case P5:
                return "VERY_LOW";
            default:
                return "MEDIUM";
        }
    }
} 