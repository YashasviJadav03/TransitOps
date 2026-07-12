-- TransitOps Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    name_model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    max_capacity_kg INTEGER NOT NULL,
    odometer INTEGER NOT NULL DEFAULT 0,
    acquisition_cost DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available'
);

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    license_no VARCHAR(50) NOT NULL UNIQUE,
    license_category VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL,
    contact_number VARCHAR(20),
    safety_score DECIMAL(5, 2) DEFAULT 100.0,
    status VARCHAR(50) NOT NULL DEFAULT 'Available'
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES drivers(id) ON DELETE RESTRICT,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    cargo_weight_kg INTEGER NOT NULL,
    planned_distance_km INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    service_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'In Shop'
);

CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    liters DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    maintenance_id UUID REFERENCES maintenance_logs(id) ON DELETE SET NULL,
    toll_amount DECIMAL(10, 2) DEFAULT 0,
    other_amount DECIMAL(10, 2) DEFAULT 0,
    expense_date DATE NOT NULL
);

CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Roles
INSERT INTO roles (name) VALUES 
    ('Fleet Manager'),
    ('Dispatcher'),
    ('Safety Officer'),
    ('Financial Analyst');

-- ==========================================
-- SEED DATA (For Local Development)
-- ==========================================

-- Insert Default Admin User (Password: password123)
-- Note: In a real app, this should be properly hashed via bcrypt. This is a dummy hash for dev.
INSERT INTO users (email, password_hash, role_id) 
SELECT 'admin@transitops.com', '$2b$10$dummyHashForDevEnvironmentJustForTesting', id 
FROM roles WHERE name = 'Fleet Manager';

-- Insert Dummy Vehicles
INSERT INTO vehicles (registration_number, name_model, type, max_capacity_kg, odometer, acquisition_cost, status) VALUES 
    ('GJ01AB4521', 'VAN-05', 'Van', 500, 74000, 620000, 'Available'),
    ('GJ01AB9987', 'TRUCK-11', 'Truck', 5000, 182000, 2450000, 'Available'),
    ('GJ01AB1120', 'MINI-03', 'Mini', 1000, 66000, 410000, 'In Shop'),
    ('GJ01AB0087', 'VAN-09', 'Van', 750, 241900, 590000, 'Retired'),
    ('GJ01AB7732', 'TRUCK-04', 'Truck', 8000, 45000, 3100000, 'Available');

-- Insert Dummy Drivers
INSERT INTO drivers (name, license_no, license_category, license_expiry, contact_number, safety_score, status) VALUES 
    ('Alex Sharma', 'DL-88213', 'LMV', '2028-12-31', '9876500001', 96.00, 'Available'),
    ('John Doe', 'DL-44120', 'HMV', '2025-03-15', '9822000002', 81.00, 'Suspended'),
    ('Priya Patel', 'DL-77031', 'LMV', '2029-08-20', '9911000003', 99.00, 'Available'),
    ('Suresh Kumar', 'DL-90045', 'HMV', '2027-01-10', '9744000004', 88.00, 'Off Duty');

