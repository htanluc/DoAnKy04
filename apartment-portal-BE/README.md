# Apartment Portal Backend

Spring Boot application for apartment management system.

## Setup

1. **Database Setup**
   - MySQL database required
   - Run `setup-database.bat` (Windows) or `setup-database.sh` (Linux/Mac)
   - Or manually execute `complete-schema.sql`

2. **Application Setup**
   - Java 17+ required
   - Run `./gradlew bootRun` to start the application
   - Or use `run-app.bat` (Windows) or `run-app.ps1` (PowerShell)

3. **Configuration**
   - Update `application.properties` for database connection
   - JWT secret key configuration
   - File upload settings

## Features

- User authentication and authorization
- Apartment and resident management
- Invoice and payment processing
- Facility booking system
- Service request management
- Announcement and event system
- Vehicle registration
- Activity logging

## API Endpoints

- Authentication: `/api/auth/**`
- Apartments: `/api/apartments/**`
- Invoices: `/api/invoices/**`
- Payments: `/api/payments/**`
- Facilities: `/api/facilities/**`
- Service Requests: `/api/service-requests/**`
- Announcements: `/api/announcements/**`
- Events: `/api/events/**`
- Vehicles: `/api/vehicles/**`

## Database Schema

- Complete schema defined in `complete-schema.sql`
- JPA entities with proper relationships
- Many-to-many relationships supported
- Audit fields (created_at, updated_at)

## Security

- JWT-based authentication
- Role-based authorization
- Password encryption
- Activity logging for audit trail

## Development

- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- MySQL database
- Gradle build system 