# TransitOps
A centralized transport operations platform for managing vehicles, drivers, trips, maintenance, and fuel expenses with real-time tracking, role-based access control, and automated business workflows.

## Hackathon Sprint Plan

The project development was structured into the following targeted sprints:

### Sprint 0: Setup
- Initialize the repository and establish a branching strategy.
- Scaffold the technical stack for both frontend and backend architectures.
- Define a shared database schema and entity relationship model covering Users, Vehicles, Drivers, Trips, Maintenance, and Fuel/Expenses.
- Deploy a skeletal application locally to verify development environments.

### Sprint 1: Authentication and Core Data Models
- Implement the User model, including required role fields (Fleet Manager, Driver).
- Develop secure sign-up and login workflows utilizing email, password, and session handling.
- Configure protected routes to restrict application access to authenticated users only.
- Define initial models for Vehicles and Drivers, encompassing all mandatory fields.

### Sprint 2: Resource Management
- Develop the Vehicle Registry module, enabling list creation and editing while enforcing unique registration numbers.
- Create the Driver Management module, incorporating list creation, editing, license expiry tracking, and status assignment.
- Build initial user interfaces for data tables, including status indicators.

### Sprint 3: Trip Management and Validations
- Construct the trip creation interface requiring source, destination, selected vehicle, selected driver, cargo weight, and planned distance.
- Implement strict validation to exclude vehicles designated as "Retired" or "In Shop" from dispatch selection.
- Implement validation to exclude drivers with expired licenses or a "Suspended" status.
- Block the selection of vehicles or drivers currently engaged in an active trip.
- Ensure cargo weight limits do not exceed the designated vehicle's maximum load capacity.
- Manage the trip lifecycle states (Draft, Dispatched, Completed, Cancelled) with automated status transitions for resources upon dispatch, completion, or cancellation.

### Sprint 4: Maintenance Workflow
- Establish a maintenance record creation system capturing the vehicle, identified issue, and date.
- Automate the transition of a vehicle's status to "In Shop" when an active maintenance record is generated, removing it from the dispatch pool.
- Ensure vehicle status reverts to "Available" upon the closure of a maintenance record (unless marked as "Retired").

### Sprint 5: Fuel and Expense Tracking
- Create logging interfaces for fuel consumption (liters, cost, date) associated with specific vehicles.
- Implement expense entry forms for secondary costs such as tolls.
- Automate the computation of total operational costs per vehicle, aggregating fuel and maintenance expenses.

### Sprint 6: Dashboard and KPIs
- Develop key performance indicator modules for Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, and overall Fleet Utilization percentage.
- Implement basic filtering options by vehicle type, status, and region.
- Calculate and display simple analytics including Fuel Efficiency, Fleet Utilization, and Operational Cost.

### Sprint 7: Polish and Bugfix
- Conduct end-to-end testing and resolve identified workflow issues.
- Perform a responsive layout review to ensure functionality across mobile and tablet devices.
- Implement comprehensive loading and error states throughout the application.

### Sprint 8: Demo Preparation and Submission
- Provide required repository access to evaluators.
- Seed the application database with sample vehicles, drivers, and trips for a seamless demonstration.
- Record an end-to-end walkthrough video demonstrating registration, trip creation, validation blocking, and the main dashboard.
- Finalize the repository and submit the solution package.
