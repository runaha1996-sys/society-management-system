CREATE DATABASE IF NOT EXISTS society_db;
USE society_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bungalow_no VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE,
    status ENUM('Paid', 'Pending', 'Overdue') DEFAULT 'Pending',
    type VARCHAR(50),
    month VARCHAR(20),
    payment_method ENUM('Cash', 'UPI') DEFAULT 'Cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    purpose VARCHAR(255),
    visiting_bungalow VARCHAR(20),
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('In', 'Out') DEFAULT 'In'
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin user (password: admin123, hashed with bcrypt)
-- Note: $2b$10$8qDVHvKVVf5Z5H5Z5H5Z5eZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z is 'admin123'
INSERT IGNORE INTO users (username, password) VALUES ('admin', '$2b$10$8qDVHvKVVf5Z5H5Z5H5Z5eZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z');

-- Sample members
INSERT INTO members (name, bungalow_no, phone, email, status) VALUES 
('Rajesh Sharma', 'A-101', '+91 98765 00001', 'rajesh@email.com', 'Active'),
('Priya Patel', 'A-102', '+91 98765 00002', 'priya@email.com', 'Active'),
('Amit Singh', 'B-201', '+91 98765 00003', 'amit@email.com', 'Active'),
('Neha Gupta', 'B-202', '+91 98765 00004', 'neha@email.com', 'Inactive'),
('Vikram Joshi', 'C-301', '+91 98765 00005', 'vikram@email.com', 'Active'),
('Sneha Reddy', 'C-302', '+91 98765 00006', 'sneha@email.com', 'Active'),
('Mahesh Kulkarni', 'D-401', '+91 98765 00007', 'mahesh@email.com', 'Active'),
('Anita Deshmukh', 'D-402', '+91 98765 00008', 'anita@email.com', 'Inactive');
