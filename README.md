# TransitOps

**Smart Transport Operations Platform**

TransitOps is a full-stack web application that brings transport operations under a single, centralized platform. It replaces fragmented spreadsheets and manual logbooks with a structured system for managing vehicles, drivers, trips, maintenance, and expenses — all governed by automated business rules and role-based access.

The platform addresses common pain points in logistics: scheduling conflicts caused by double-booked drivers, vehicles sent on trips while still in the shop, expired licenses going unnoticed, and operational costs scattered across disconnected records. TransitOps eliminates these by enforcing constraints at the application level and providing a real-time dashboard for operational visibility.

---

## Tech Stack

| Layer            | Technology                    |
|------------------|-------------------------------|
| Frontend         | React                         |
| Backend          | Node.js with Express          |
| Database         | PostgreSQL (via Docker)       |
| Auth             | JWT-based session management  |
| Containerization | Docker, Docker Compose        |
| Styling          | CSS (responsive, mobile-first)|

---

## Features

### Authentication and Access Control
Secure email and password login with JWT-based sessions. The platform implements Role-Based Access Control (RBAC) to restrict functionality based on user roles. All application routes are protected and accessible only to authenticated users.

**Supported Roles:**
- Fleet Manager — full access to fleet assets, maintenance, and operational data.
- Driver — trip creation, vehicle/driver assignment, and delivery monitoring.
- Safety Officer — driver compliance monitoring, license tracking, and safety scoring.
- Financial Analyst — expense review, fuel cost analysis, and profitability reporting.

### Vehicle Registry
A centralized register of all fleet vehicles. Each record captures the Registration Number (enforced as unique), Vehicle Name/Model, Type (e.g., Truck, Van, Sedan), Maximum Load Capacity, current Odometer reading, Acquisition Cost, and operational Status.

**Vehicle Statuses:** `Available` | `On Trip` | `In Shop` | `Retired`

### Driver Management
Maintains detailed driver profiles including Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score, and current Status. The system actively checks license validity and prevents non-compliant drivers from being dispatched.

**Driver Statuses:** `Available` | `On Trip` | `Off Duty` | `Suspended`

### Trip Dispatch and Lifecycle
Trips are created by specifying a source, destination, vehicle, driver, cargo weight, and planned distance. The system validates every assignment against capacity limits, vehicle availability, and driver eligibility before allowing dispatch.

**Trip Lifecycle:** `Draft` → `Dispatched` → `Completed` | `Cancelled`

All status transitions are automated. Dispatching a trip marks both the vehicle and driver as "On Trip". Completing or cancelling the trip restores them to "Available".

### Maintenance Workflow
When a maintenance record is created for a vehicle, the system automatically sets that vehicle's status to "In Shop", removing it from the dispatch pool entirely. Closing the maintenance record restores the vehicle to "Available" (unless it has been retired). This prevents any possibility of dispatching a vehicle that is undergoing service.

### Fuel and Expense Tracking
Fuel logs capture liters consumed, cost, and date per vehicle. Additional operational expenses such as tolls and ad-hoc costs are recorded separately. The system automatically computes total operational cost (Fuel + Maintenance) per vehicle for financial reporting.

### Dashboard and Analytics
A real-time dashboard surfaces key performance indicators at a glance:
- Active Vehicles, Available Vehicles, Vehicles in Maintenance
- Active Trips, Pending Trips
- Drivers On Duty
- Fleet Utilization (%)

Analytical metrics include Fuel Efficiency (distance per liter), total Operational Cost per vehicle, and Vehicle ROI calculated as `(Revenue - Maintenance - Fuel) / Acquisition Cost`. The dashboard supports filtering by vehicle type, status, and region. CSV export is available for reporting.

---

## Business Rules

These rules are enforced programmatically to maintain data integrity and operational safety:

| Rule | Description |
|------|-------------|
| Unique Registration | No two vehicles can share the same registration number. |
| Dispatch Eligibility | Only vehicles with "Available" status appear in the dispatch pool. "Retired" and "In Shop" vehicles are excluded. |
| Driver Compliance | Drivers with expired licenses or "Suspended" status cannot be assigned to any trip. |
| No Double Booking | A vehicle or driver already marked "On Trip" cannot be assigned to another trip simultaneously. |
| Capacity Check | Cargo weight must not exceed the selected vehicle's maximum load capacity. |
| Auto Dispatch Status | Dispatching a trip automatically transitions both the vehicle and driver to "On Trip". |
| Auto Completion Status | Completing a trip automatically restores both the vehicle and driver to "Available". |
| Auto Cancellation Status | Cancelling a dispatched trip restores both the vehicle and driver to "Available". |
| Maintenance Lock | Creating an active maintenance record automatically sets the vehicle to "In Shop". |
| Maintenance Release | Closing a maintenance record restores the vehicle to "Available", unless the vehicle is retired. |

---

## Database Schema

The application is built around the following core entities:

| Entity            | Purpose                                                  |
|-------------------|----------------------------------------------------------|
| Users             | Authentication credentials and role assignments          |
| Roles             | Access control definitions (Fleet Manager, Driver, etc.) |
| Vehicles          | Fleet asset registry with status and capacity tracking   |
| Drivers           | Driver profiles with license and compliance data         |
| Trips             | Dispatch records with lifecycle state management         |
| Maintenance Logs  | Service history tied to vehicles with status automation  |
| Fuel Logs         | Per-vehicle fuel consumption records                     |
| Expenses          | Supplementary operational cost entries                   |

---

## Project Documentation

Detailed sprint-level documentation is available in the [`docs/`](docs/) directory, covering the development approach from initial setup through final delivery.
