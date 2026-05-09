-- Members table (Created first so users can reference it)
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bungalow_no VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'admin',
    member_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
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
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
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

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE,
    month VARCHAR(20),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY,
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    society_name VARCHAR(100) DEFAULT 'Aananda Society',
    due_day INT DEFAULT 10
);

-- Messages table (Chat)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_name VARCHAR(100) NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if not exists
INSERT IGNORE INTO settings (id, opening_balance, society_name, due_day) VALUES (1, 0, 'Aananda Society', 10);

-- Insert a default admin user (password: admin123)
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', '$2a$10$YOvVl7D6LHBCW9iPt7jkCOYVTUTA9iq1WK3DgvB8K5H7RvtQe2JQm', 'admin');

-- Sample members
INSERT INTO members (id, name, bungalow_no, phone, email, status) VALUES 
(1, 'Rajesh Sharma', 'A-101', '+91 98765 00001', 'rajesh@email.com', 'Active'),
(2, 'Priya Patel', 'A-102', '+91 98765 00002', 'priya@email.com', 'Active')
ON DUPLICATE KEY UPDATE name=VALUES(name);
