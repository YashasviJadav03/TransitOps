# Sprint 4: Maintenance Workflow

## Objective
Create a streamlined workflow for logging vehicle maintenance and automating the corresponding vehicle availability status.

## Key Deliverables
- **Maintenance Logging:** Build the interface and logic for creating maintenance records, capturing the vehicle, specific issue, and date.
- **Status Automation (In Shop):** Automate the system to immediately update a vehicle's status to "In Shop" upon the creation of an active maintenance record, thereby removing it from the trip dispatch pool.
- **Status Automation (Available):** Ensure that closing a maintenance record automatically reverts the vehicle's status to "Available" (unless the vehicle has been marked as "Retired").
