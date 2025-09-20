# WEB SYSTEM OVERVIEW
## Smart Building Management System

---

## 🏗️ SYSTEM ARCHITECTURE

The Smart Building Management System consists of three main web components:

### 1. **Backend API** (Spring Boot 3.2.0)
- **Technology Stack**: Java 20, Spring Boot 3.2.0, Spring Security, JPA/Hibernate
- **Database**: MySQL 8.0
- **Port**: 8080
- **Features**:
  - RESTful API endpoints
  - JWT Authentication & Authorization
  - Role-based Access Control (RBAC)
  - WebSocket for real-time communication
  - Payment integration (Stripe)
  - Email service
  - File upload (Cloudinary)
  - AI integration (OpenAI)

### 2. **Admin Portal** (Next.js 15.2.4)
- **Technology Stack**: Next.js 15.2.4, React 19, TypeScript 5.8.3, Tailwind CSS
- **Port**: 3000
- **Features**:
  - Comprehensive management dashboard
  - Resident and apartment management
  - Invoice and billing management
  - Facility and booking management
  - Announcements and events system
  - Reports and analytics
  - Multi-language support (i18n)
  - Real-time notifications

### 3. **User Portal** (Next.js 14.0.4)
- **Technology Stack**: Next.js 14.0.4, React 18.2.0, TypeScript 5.8.3, Tailwind CSS
- **Port**: 3001
- **Features**:
  - Resident-friendly interface
  - Bill viewing and payment
  - Facility booking system
  - Event participation
  - Support request system
  - AI chat support
  - Multi-language support

---

## 🔧 TECHNICAL SPECIFICATIONS

### Backend API Specifications:
```yaml
Framework: Spring Boot 3.2.0
Java Version: 20
Database: MySQL 8.0
Security: Spring Security with JWT
ORM: JPA/Hibernate
Build Tool: Gradle
Documentation: OpenAPI/Swagger
```

### Frontend Specifications:
```yaml
Admin Portal:
  Framework: Next.js 15.2.4
  React: 19
  TypeScript: 5.8.3
  Styling: Tailwind CSS
  UI Components: Radix UI

User Portal:
  Framework: Next.js 14.0.4
  React: 18.2.0
  TypeScript: 5.8.3
  Styling: Tailwind CSS
  UI Components: Radix UI
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Development Environment:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Portal  │    │   User Portal   │    │  Backend API    │
│   (Next.js)     │    │   (Next.js)     │    │  (Spring Boot)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 8080    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MySQL 8.0     │
                    │   Port: 3306    │
                    └─────────────────┘
```

### Production Environment:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Portal  │    │   User Portal   │    │  Backend API    │
│   (Next.js)     │    │   (Next.js)     │    │  (Spring Boot)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 8080    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MySQL 8.0     │
                    │   Port: 3306    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Load Balancer  │
                    │   (Nginx)        │
                    └─────────────────┘
```

---

## 📊 DATABASE SCHEMA

### Core Entities (25+ entities):
1. **Users** - User authentication and roles
2. **Apartments** - Apartment information
3. **Residents** - Resident personal information
4. **Facilities** - Facility catalog
5. **Bookings** - Facility booking management
6. **Invoices** - Billing and service fees
7. **Announcements** - Management announcements
8. **SupportTickets** - Support requests
9. **Buildings** - Building management
10. **Events** - Building events
11. **Vehicles** - Vehicle management
12. **WaterMeterReadings** - Water consumption tracking
13. **PaymentTransactions** - Payment processing
14. **ActivityLogs** - System activity logging
15. **AiQaHistory** - AI chat history
16. **Feedback** - Resident feedback
17. **Roles** - User roles
18. **ServiceCategories** - Service categorization
19. **EmailVerificationTokens** - Email verification
20. **RefreshTokens** - JWT refresh tokens
21. **ServiceFeeConfigs** - Service fee configuration
22. **FacilityCheckIns** - Facility check-in tracking
23. **EventRegistrations** - Event participation
24. **VehicleCapacityConfigs** - Vehicle capacity limits
25. **FeedbackCategories** - Feedback categorization

---

## 🔐 SECURITY FEATURES

### Authentication & Authorization:
- JWT-based authentication
- Role-based access control (RBAC)
- Password encryption with BCrypt
- Email verification system
- Refresh token mechanism

### API Security:
- CORS configuration
- SQL injection prevention
- XSS protection
- Input validation
- Rate limiting

### Data Security:
- Encrypted password storage
- Secure file upload
- Database connection encryption
- Environment variable protection

---

## 🌐 API ENDPOINTS

### Authentication Endpoints:
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### User Management:
```
GET /api/users
POST /api/users
PUT /api/users/{id}
DELETE /api/users/{id}
GET /api/users/profile
PUT /api/users/profile
```

### Apartment Management:
```
GET /api/apartments
POST /api/apartments
PUT /api/apartments/{id}
DELETE /api/apartments/{id}
GET /api/apartments/{id}/residents
```

### Invoice Management:
```
GET /api/invoices
POST /api/invoices
PUT /api/invoices/{id}
DELETE /api/invoices/{id}
POST /api/invoices/{id}/pay
GET /api/invoices/user/{userId}
```

### Facility Management:
```
GET /api/facilities
POST /api/facilities
PUT /api/facilities/{id}
DELETE /api/facilities/{id}
GET /api/facilities/{id}/bookings
POST /api/facilities/{id}/book
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Design Principles:
- Mobile-first approach
- Progressive Web App (PWA) capabilities
- Touch-friendly interface
- Accessible design (WCAG 2.1)
- Cross-browser compatibility

---

## 🌍 INTERNATIONALIZATION

### Supported Languages:
- English (en)
- Vietnamese (vi)

### Features:
- Dynamic language switching
- Localized date and time formatting
- Currency formatting
- RTL language support preparation

---

## 📈 PERFORMANCE OPTIMIZATIONS

### Frontend Optimizations:
- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization
- CDN integration

### Backend Optimizations:
- Database query optimization
- Caching with Spring Cache
- Connection pooling
- Async processing
- Monitoring and metrics

---

## 🔄 REAL-TIME FEATURES

### WebSocket Implementation:
- Real-time notifications
- Live chat support
- Real-time updates
- Event broadcasting

### Use Cases:
- New invoice notifications
- Facility booking updates
- Event announcements
- Support ticket updates
- System maintenance alerts

---

## 📊 MONITORING & ANALYTICS

### Application Monitoring:
- Health checks
- Performance metrics
- Error tracking
- User activity logging

### Analytics Features:
- User engagement metrics
- System usage statistics
- Performance monitoring
- Error rate tracking

---

## 🚀 DEPLOYMENT STRATEGIES

### Development:
- Local development environment
- Hot reload for frontend
- Database seeding
- Mock data for testing

### Staging:
- Production-like environment
- Integration testing
- Performance testing
- Security testing

### Production:
- Load balancing
- Database clustering
- CDN integration
- SSL/TLS encryption
- Backup strategies

---

**Document Version:** 1.0.0  
**Last Updated:** September 18, 2025  
**Author:** AI Assistant
