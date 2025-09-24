## 2. USER INTERFACE (UI/UX) DESIGN

### 2.1 Website interface

### 2.1.1 Login
- **Layout:** Centered login form with gradient background
- **Components:**
  - System logo at top
  - Login form with phone number and password
  - "Remember me" checkbox
  - "Forgot password" and "Register" links
  - Login button with hover effect
- **Responsive:** Auto-adjust for mobile and tablet

### 2.1.2 Dashboard
- **Layout:** Grid layout with sidebar navigation
- **Components:**
  - Sidebar: Main menu, user profile, quick actions
  - Header: Search bar, notifications, user menu
  - Main content: Statistic widgets, charts, data tables
  - Footer: System info, support links
- **Widgets:** Number of residents, apartments, facilities, unpaid invoices

### 2.1.3 Resident Management
- **Layout:** Table layout with search and filter
- **Components:**
  - Toolbar: Add new, import/export, bulk actions
  - Search bar with filters by status, apartment
  - Data table with pagination
  - Modal form to add/edit resident info
- **Features:** CRUD operations, bulk delete, Excel export

### 2.1.4 Facility Management
- **Layout:** Card layout with grid system
- **Components:**
  - Grid cards showing facilities
  - Modal form to add/edit facilities
  - Calendar view for bookings
  - Status indicators (available, maintenance, closed)
- **Features:** Manage maintenance schedules, update usage fees

### 2.1.5 Invoices
- **Layout:** Table layout with advanced filters
- **Components:**
  - Filter panel: By month, status, apartment
  - Data table with sortable columns
  - Action buttons: View details, send email, print PDF
  - Summary panel: Total invoices, total amount
- **Features:** Create manual invoices, send reminders

### 2.1.6 Announcements
- **Layout:** List layout with timeline view
- **Components:**
  - Form to create a new announcement
  - Announcement list with priority indicators
  - Preview panel for content
  - Schedule panel for delivery time
- **Features:** Draft, schedule, target audience selection

### 2.1.7 Support Requests (Tickets)
- **Layout:** Table + details drawer
- **Components:**
  - Toolbar filters: Status, priority, category, assignee
  - SLA timer and priority badges
  - Assignee selector, canned responses, internal notes
  - Processing timeline and file attachments
- **Features:** SLA per category, overdue alerts, assign/reassign, merge duplicates, CSAT survey, CSV export

### 2.1.8 Vehicle Management
- **Layout:** Tabs (pending, approved, rejected, expired)
- **Components:**
  - Vehicle table with resident, type, plate, status
  - Bulk approve/reject with reason
  - Attachments viewer, capacity indicator per parking area
  - Renewal reminders
- **Features:** Quota/capacity management, over-limit alerts, plate change history, receipt/PDF export

### 2.1.9 Water Meter Management
- **Layout:** Periods overview + household details
- **Components:**
  - CSV import readings with preview & validation
  - Approve/close period; anomaly flags for spikes
  - Photo verification viewer
- **Features:** Estimate missing readings, lock period after closing, sync water invoices per period

### 2.1.10 Billing Config & Feature Flags
- **Layout:** Versioned settings
- **Components:**
  - Version list with effective date
  - Compare versions (diff)
  - Feature flags (overdue fee, yearly billing)
- **Features:** Preview before apply, audit who/when changed

### 2.1.11 Notification Center
- **Layout:** Templates + Campaigns
- **Components:**
  - i18n template editor (email/in-app)
  - Audience targeting and scheduling
  - Delivery status (delivered/failed)
- **Features:** Test send, auto-retry, open/click metrics (if available)

### 2.1.12 Role-Based Access Control (RBAC)
- **Layout:** Role matrix
- **Components:**
  - Roles vs permissions table
  - Assign roles to users
- **Features:** Hide/disable UI per role, FE route guards, BE authorization

### 2.1.13 Reports & Analytics
- **Layout:** Report dashboards + export
- **Components:**
  - Revenue, overdue, facility usage, ticket performance
- **Features:** PDF/CSV export, time/building filters

### 2.1.14 Facility Booking 2.0
- **Layout:** Calendar + booking list
- **Components:**
  - Calendar per facility with conflict checks
  - Time-based pricing and status indicators
- **Features:** Cancel/reschedule policy, pre-approval workflow, reminders

### 2.1.15 Announcements 2.0
- **Layout:** Timeline + scheduler
- **Components:**
  - Target by building/floor/household/group
  - Priority and multi-channel preview (email/app)
- **Features:** Draft, clone, read receipts/seen stats

### 2.1.16 Resident Portal Enhancements
- **Layout:** My bills, my tickets, my vehicles
- **Components:**
  - Bills: View/download PDF, history, dispute
  - Tickets: Chat per ticket, CSAT rating
  - Vehicles: Register/change plate, track approval
- **Features:** Dunning preferences, water anomaly notifications

### 2.1.17 Settings & Branding
- **Layout:** System settings
- **Components:**
  - FPT theme (colors, logo), favicon
  - i18n defaults/fallback
- **Features:** Theme preview, import/export UI config

### 2.1.18 Audit Logs
- **Layout:** Event table
- **Components:**
  - Module filters (billing, vehicles, water, support)
  - User/action/time filters
- **Features:** CSV export, retention/TTL policy

### 2.1.19 Accessibility & Performance
- **Components:**
  - Keyboard navigation, ARIA labels, contrast checks
  - Loading skeleton, virtualized tables
- **Features:** SSR pagination/sort, debounced search, client cache

### 2.1.20 Dark Mode & Preferences
- **Components:**
  - Dark mode toggle, per-user preferences
  - Column visibility, saved filters
- **Features:** Sync preferences with account, persist across devices
