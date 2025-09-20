## 1.5 Modular Monolith Details

### 1.5.1 Core Modules

The system is built on a Modular Monolith architecture with core modules managing primary entities. These modules form the foundation of the system and handle the most essential business entities.

**Core Modules Details:**

- **User Management Module**: Manages authentication, authorization, and user profiles with JWT + RBAC system. Includes features such as email verification, refresh token rotation, and password encryption for enhanced security.

- **Apartment Management Module**: Manages apartment information, floors, blocks, and linking system. Provides comprehensive building information management and unit status tracking capabilities.

- **Resident Management Module**: Manages resident profiles, contact information, and apartment assignments. Includes family member management and resident verification processes.

- **Building Management Module**: Manages building configuration and services. Handles floor management, block organization, and building-specific services.

### 1.5.2 Business Service Modules

Core business service modules handling main system functionalities. These modules implement the primary business logic and operational features of the apartment management system.

**Service Modules Details:**

- **Facility Management Module**: Manages facility catalog, booking system, and QR code check-in system. Provides comprehensive facility status monitoring and availability checking capabilities.

- **Booking Management Module**: Handles reservation scheduling, status tracking, and conflict resolution. Supports recurring bookings and provides notification systems for better user experience.

- **Invoice Management Module**: Generates monthly invoices, calculates service fees, and integrates water billing. Includes service fee configuration and comprehensive billing history tracking.

- **Payment Processing Module**: Processes payments through Stripe (international) and VNPay (domestic) with comprehensive transaction features. Supports multi-currency transactions and provides detailed payment reporting.

### 1.5.3 Extended Modules

Extended modules providing advanced features and external service integrations. These modules extend the core functionality with specialized features for enhanced user experience and operational efficiency.

**Extended Modules Details:**

- **Event Management Module**: Manages community events, registration system, and attendance tracking. Provides event calendar management and comprehensive analytics for event planning and evaluation.

- **Vehicle Management Module**: Manages vehicle registration, parking capacity, and access control. Includes vehicle type classification and parking space allocation with capacity limit enforcement.

- **Water Meter Management Module**: Tracks water meter readings, calculates consumption, and generates bills. Provides historical consumption analysis and water usage alerts for better resource management.

- **AI Integration Module**: Integrates OpenAI GPT-4 to provide intelligent chatbot and natural language processing. Includes knowledge base management and AI chat history tracking for improved customer support.

- **Support & Feedback Module**: Manages support requests, feedback collection, and service quality tracking. Provides comprehensive issue resolution tracking and customer satisfaction metrics.

### 1.5.4 Infrastructure Modules

Infrastructure modules providing foundational services and utilities for the entire system. These modules ensure system reliability, security, and maintainability across all components.

**Infrastructure Modules Details:**

- **Security Module**: Comprehensive security with JWT, RBAC, password encryption, and SQL injection/XSS protection. Implements refresh token rotation and security logging for enhanced protection.

- **File Upload Module**: Handles image and document processing with optimization and security. Provides cloud storage integration readiness and comprehensive file validation.

- **Email Service Module**: Sends notification emails, verification, and HTML templates. Supports password reset emails and event/announcement notifications.

- **WebSocket Module**: Real-time communication with STOMP protocol for chat and notifications. Provides live notifications and system announcements for improved user engagement.

- **Internationalization Module**: Multi-language support (Vietnamese/English) with localized formatting. Includes right-to-left (RTL) language support and dynamic language switching capabilities.

- **Logging & Monitoring Module**: Activity logging, security monitoring, and performance tracking. Provides comprehensive error tracking and system health monitoring.

### 1.5.5 Data Layer

Data layer managing storage and retrieval of information for the entire system. This layer ensures data integrity, availability, and performance optimization across all system components.

**Data Layer Details:**

- **MySQL Database**: Main database with 25+ entities, ACID support, and automatic backup. Includes database migration support, connection pooling, and query optimization for optimal performance.

- **File Storage System**: Local file storage with image optimization and cloud integration ready. Provides comprehensive file security validation and upload progress tracking.

- **Cache Layer**: Multi-tier caching system for performance optimization and session management. Implements query result caching, API response caching, and intelligent cache invalidation strategies.

### 1.5.6 External Integrations

Integrations with external services to extend system functionality. These integrations provide additional capabilities and enhance the overall system value proposition.

**External Integrations Details:**

- **Payment Gateways**: Stripe (international) and VNPay (domestic) integration with comprehensive payment features. Supports secure payment processing, refund handling, and detailed transaction reporting.

- **AI Services**: OpenAI GPT-4 integration for intelligent chatbot and natural language processing. Provides context-aware responses and knowledge base integration for enhanced user support.

- **Third-party APIs**: Ready for integration with email services, file storage, and CDN. Includes support for analytics, monitoring, and cloud backup services.

### 1.5.7 Technology Stack Summary

**Backend Technologies:**
- Spring Boot 3.2.0 with Java 20
- MySQL 8.x Database
- JWT Authentication + RBAC
- WebSocket with STOMP Protocol
- Stripe Java SDK 25.9.0 + VNPay Integration
- OpenAI Java SDK for AI features

**Frontend Technologies:**
- Admin Portal: Next.js 15.2.4, React 19, TypeScript 5.8.3
- User Portal: Next.js 14.0.4, React 18.2.0, TypeScript 5.8.3
- Staff Mobile: Flutter 3.5.0, Dart 3.5.0

**Additional Features:**
- Internationalization (i18n) support
- Real-time communications
- File upload & image processing
- Email notifications system
- Comprehensive logging & monitoring

## Modular Monolith Architecture - Overview

### 1.5.8 Key Architecture Characteristics:
- **Single Deployable Unit**: Single Spring Boot application with modular structure
- **Shared Database**: Shared MySQL database with 25+ entities
- **Internal Communication**: Modules communicate via method calls within the same process
- **Unified API Gateway**: Single REST API serving all clients
- **Modular Organization**: 6 module groups organized by clear functionality

### 1.5.9 Benefits of Modular Monolith Architecture:
- **Simplified Deployment**: Easy to deploy and maintain a single application
- **Consistent Data**: No data consistency issues between services
- **Lower Complexity**: Less complex than microservices, easier to understand and develop
- **Better Performance**: No network overhead between services
- **Easier Development**: Easy to debug, test, and develop new features
- **Cost Effective**: Saves infrastructure and maintenance costs

### 1.5.10 Module Organization:
1. **Core Modules (4 modules)**: Manage basic entities (User, Apartment, Resident, Building)
2. **Business Service Modules (4 modules)**: Core business logic (Facility, Booking, Invoice, Payment)
3. **Extended Modules (5 modules)**: Extended features (Event, Vehicle, Water Meter, AI, Support)
4. **Infrastructure Modules (6 modules)**: Infrastructure and utilities (Security, File, Email, WebSocket, i18n, Logging)
5. **Data Layer**: MySQL Database, File Storage, Cache Layer
6. **External Integrations**: Payment Gateways, AI Services, Third-party APIs

### 1.5.11 Scalability & Future Growth:
- **Horizontal Scaling**: Can scale horizontally when needed
- **Module Extraction**: Modules can be extracted into separate microservices in the future
- **Database Sharding**: Supports database sharding when data grows
- **Cloud Ready**: Ready to migrate to cloud with containerization