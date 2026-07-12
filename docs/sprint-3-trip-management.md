# Sprint 3: Trip Management and Validations

## Objective
Implement the critical path of the application: creating, validating, and managing trips. This involves rigorous enforcement of the platform's core business rules.

## Key Deliverables
- **Trip Creation Interface:** Build a form capturing the source, destination, selected vehicle, selected driver, cargo weight, and planned distance.
- **Resource Validation:** Ensure that vehicles marked as "Retired" or "In Shop" are strictly excluded from the dispatch selection pool.
- **Compliance Validation:** Ensure that drivers with expired licenses or a "Suspended" status cannot be selected for a trip.
- **Availability Validation:** Block the assignment of any vehicle or driver that is currently marked as "On Trip".
- **Capacity Validation:** Enforce the rule that the designated Cargo Weight must not exceed the maximum load capacity of the selected vehicle.
- **Lifecycle Management:** Implement the trip progression states: Draft → Dispatched → Completed → Cancelled.
- **Automated State Transitions:** Ensure that dispatching, completing, or cancelling a trip automatically updates the availability statuses of the assigned vehicle and driver accordingly.
