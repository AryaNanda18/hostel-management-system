-- ============================================================
-- LBSITW HOSTEL MANAGEMENT SYSTEM - MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS hostel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hostel_db;

-- ============================================================
-- Table: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(80) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL
);

-- Default admin: username=admin, password=password123
-- (Created automatically by db_init on first run)

-- ============================================================
-- Table: students_applications
-- ============================================================
CREATE TABLE IF NOT EXISTS students_applications (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    student_name            VARCHAR(150) NOT NULL,
    semester_branch         VARCHAR(100) NOT NULL,
    let_status              VARCHAR(10) NOT NULL,
    college_admn_no         VARCHAR(50) NOT NULL,
    parent_name             VARCHAR(150) NOT NULL,
    student_contact         VARCHAR(20) NOT NULL,
    permanent_address       TEXT NOT NULL,
    official_address        TEXT NOT NULL,
    dob                     DATE NOT NULL,
    caste                   VARCHAR(50) NOT NULL,
    religion                VARCHAR(50) NOT NULL,
    fee_concession          VARCHAR(10) NOT NULL,
    nationality             VARCHAR(50) NOT NULL,
    local_guardian_name     VARCHAR(150) NOT NULL,
    local_guardian_address  TEXT NOT NULL,
    inside_outside_india    VARCHAR(20) NOT NULL,
    state                   VARCHAR(50) NOT NULL,
    district                VARCHAR(50),
    -- Priority/Category
    category VARCHAR(50) NOT NULL, -- SC, ST, OEC, OBCH, General
    distance_km FLOAT NOT NULL,
    
    -- Documents
    photo_path VARCHAR(255) NOT NULL,
    document_path VARCHAR(255),
    caste_certificate_path VARCHAR(255) NOT NULL,
    
    -- Status
    application_status VARCHAR(20) DEFAULT 'Pending',
    rejection_reason TEXT,
    priority_rank INT,
    hostel_admission_no VARCHAR(50) UNIQUE,
    generated_password VARCHAR(255),
    
    -- Fees & Manual Payment
    admission_fee FLOAT,
    caution_deposit FLOAT,
    payment_status VARCHAR(20) DEFAULT 'N/A', -- N/A, Pending, Paid
    payment_date VARCHAR(50),
    
    -- Notification status
    whatsapp_approval_sent BOOLEAN DEFAULT FALSE,
    whatsapp_credentials_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- ============================================================
-- Sample dummy data for testing
-- ============================================================
-- NOTE: photo_path / document_path should point to actual uploaded files.
-- Run the Flask app first so tables are created, then insert sample data.

-- Admin table
-- Sample Data (Pre-hashed password for 'admin123')
INSERT IGNORE INTO admins (username, password) VALUES 
('admin', 'pbkdf2:sha256:600000$cOqMizM1$ef829e924d62fb64359998818f4a3479b12a8039c3817f730c459f0f9b32e850');

-- Sample Application
INSERT INTO students_applications
(student_name, semester_branch, let_status, college_admn_no, parent_name, student_contact,
 permanent_address, official_address, dob, caste, religion, fee_concession, nationality,
 local_guardian_name, local_guardian_address, inside_outside_india, state, district,
 category, distance_km, photo_path, document_path, caste_certificate_path, application_status)
VALUES
('ANJU KRISHNA', 'S3 CSE', 'No', 'LBSITW/22/101', 'Krishnadas P', '9876543210',
 'TC 12/345 Peroorkada Thiruvananthapuram 695005, Ph: 9876543211',
 'Same as permanent', '2004-05-12', 'Ezhava', 'Hindu', 'No', 'Indian',
 'Suresh Kumar', 'TC 9/456 Peroorkada, Ph: 9876543230',
 'Inside India', 'Kerala', 'Thiruvananthapuram',
 'OBCH', 45.0, 'uploads/sample_photo.jpg', NULL, 'uploads/sample_caste.pdf', 'Pending'),

('DIVYA MOHAN', 'S5 ECE', 'No', 'LBSITW/20/202', 'Mohanan R', '8765432109',
 'Chalakudy, Thrissur 680307, Ph: 8765432100',
 'Hostel local: same', '2002-08-22', 'SC', 'Hindu', 'Yes', 'Indian',
 'Rani Thomas', 'Near St. Marys Church, Chalakudy, Ph: 8765432101',
 'Inside India', 'Kerala', 'Thrissur',
 'SC', 120.5, 'uploads/sample_photo.jpg', 'uploads/sample_doc.pdf', 'uploads/sample_caste.pdf', 'Pending'),

('MEENA SEBASTIAN', 'S1 Civil', 'No', 'LBSITW/24/305', 'Sebastian Thomas', '7654321098',
 'Kottayam Town, Kottayam 686001, Ph: 7654321099',
 'Same as permanent', '2006-03-15', 'OBC', 'Christian', 'No', 'Indian',
 'Asha K', 'MG Road Kottayam, Ph: 7654321010',
 'Inside India', 'Kerala', 'Kottayam',
 'General', 90.0, 'uploads/sample_photo.jpg', NULL, 'uploads/sample_caste.pdf', 'Pending');
