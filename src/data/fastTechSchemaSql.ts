export const FAST_TECH_SCHEMA_SQL = `-- ============================================================================
-- FAST TECH — On-Demand IT Hardware Services & Integrated E-Commerce Schema
-- Compatible with PostgreSQL 15+ / MySQL 8+ (Normalized Relational DDL + Seed)
-- ============================================================================

-- 1. USERS (Customers, Service Engineers, Super Admins)
CREATE TABLE users (
    id              VARCHAR(36) PRIMARY KEY,
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL UNIQUE,
    phone_e164      VARCHAR(24)  NOT NULL UNIQUE,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('customer', 'engineer', 'admin')),
    city            VARCHAR(80)  NOT NULL DEFAULT 'Kolkata',
    postal_code     VARCHAR(16)  NOT NULL DEFAULT '700001',
    kyc_status      VARCHAR(20)  NOT NULL DEFAULT 'Pending'
        CHECK (kyc_status IN ('Approved', 'Pending', 'Suspended')),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. ENGINEER PROFILES (Strict Dual-Specialization Policy Enforced)
CREATE TABLE engineer_profiles (
    engineer_id         VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    primary_specialty   VARCHAR(48) NOT NULL,
    secondary_specialty VARCHAR(48) NULL,
    availability_status VARCHAR(20) NOT NULL DEFAULT 'Online'
        CHECK (availability_status IN ('Online', 'Busy', 'Offline', 'Frozen')),
    rating_avg          DECIMAL(3,2) NOT NULL DEFAULT 4.80,
    completed_jobs      INT NOT NULL DEFAULT 0,
    ongoing_jobs        INT NOT NULL DEFAULT 0,
    home_lat            DECIMAL(9,6) NOT NULL,
    home_lng            DECIMAL(9,6) NOT NULL,
    CONSTRAINT chk_dual_specialization CHECK (primary_specialty <> secondary_specialty)
);

-- 3. SERVICE TICKETS
CREATE TABLE service_tickets (
    id                  VARCHAR(36) PRIMARY KEY,
    customer_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    assigned_engineer_id VARCHAR(36) NULL REFERENCES engineer_profiles(engineer_id),
    device_category     VARCHAR(48) NOT NULL,
    device_serial_no    VARCHAR(64) NOT NULL,
    device_model        VARCHAR(120) NOT NULL,
    issue_subject       VARCHAR(180) NOT NULL,
    issue_description   TEXT NOT NULL,
    is_urgent           BOOLEAN NOT NULL DEFAULT FALSE,
    priority            VARCHAR(16) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    ticket_status       VARCHAR(24) NOT NULL DEFAULT 'Dispatching' CHECK (ticket_status IN ('Dispatching', 'In Progress', 'Completed', 'Escalated')),
    distance_km         DECIMAL(5,2) NOT NULL,
    visitation_fee_inr  DECIMAL(10,2) NOT NULL,
    payment_method      VARCHAR(32) NOT NULL,
    slot_day            VARCHAR(24) NOT NULL,
    slot_time           VARCHAR(32) NOT NULL,
    current_tier        SMALLINT NOT NULL DEFAULT 1 CHECK (current_tier IN (1, 2, 3)),
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. TICKET DISPATCH LOGS (Waterfall Tier 1 -> Tier 2 -> Tier 3 Audit Trail)
CREATE TABLE ticket_dispatch_logs (
    id              VARCHAR(36) PRIMARY KEY,
    ticket_id       VARCHAR(36) NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
    engineer_id     VARCHAR(36) NOT NULL REFERENCES engineer_profiles(engineer_id),
    dispatch_tier   SMALLINT NOT NULL CHECK (dispatch_tier IN (1, 2, 3)),
    outcome         VARCHAR(20) NOT NULL CHECK (outcome IN ('sent', 'accepted', 'rejected', 'timeout')),
    note            VARCHAR(255) NULL,
    logged_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS (Fast Tech Hardware Store Catalog)
CREATE TABLE products (
    id                  VARCHAR(36) PRIMARY KEY,
    sku                 VARCHAR(48) NOT NULL UNIQUE,
    name                VARCHAR(160) NOT NULL,
    category            VARCHAR(48) NOT NULL,
    unit_price_inr      DECIMAL(10,2) NOT NULL,
    stock_qty           INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    serial_tracked      BOOLEAN NOT NULL DEFAULT TRUE,
    compatible_models   VARCHAR(200) NOT NULL,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCT SERIAL UNITS (Per-Unit Serialized Inventory Tracking)
CREATE TABLE product_serial_units (
    id              VARCHAR(36) PRIMARY KEY,
    product_id      VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    serial_number   VARCHAR(80) NOT NULL UNIQUE,
    unit_status     VARCHAR(20) NOT NULL DEFAULT 'In Stock' CHECK (unit_status IN ('In Stock', 'Reserved', 'Sold', 'RMA')),
    received_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. ORDERS (Hardware E-Commerce Orders)
CREATE TABLE orders (
    id                  VARCHAR(36) PRIMARY KEY,
    customer_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    product_id          VARCHAR(36) NOT NULL REFERENCES products(id),
    serial_unit_id      VARCHAR(36) NULL REFERENCES product_serial_units(id),
    quantity            INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_amount_inr    DECIMAL(10,2) NOT NULL,
    payment_method      VARCHAR(32) NOT NULL,
    order_status        VARCHAR(24) NOT NULL DEFAULT 'Confirmed',
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. ENGINEER WALLETS (Earnings & Cash-in-Hand Liability)
CREATE TABLE engineer_wallets (
    engineer_id         VARCHAR(36) PRIMARY KEY REFERENCES engineer_profiles(engineer_id) ON DELETE CASCADE,
    total_earnings_inr  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cash_in_hand_inr    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    overdue_days        INT NOT NULL DEFAULT 0,
    last_settled_at     TIMESTAMP NULL
);

-- 9. FINANCIAL TRANSACTIONS (Visitation Fees, Cash Settlements, Penalties, Store)
CREATE TABLE financial_transactions (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    ticket_id       VARCHAR(36) NULL REFERENCES service_tickets(id),
    order_id        VARCHAR(36) NULL REFERENCES orders(id),
    tx_type         VARCHAR(24) NOT NULL CHECK (tx_type IN ('visitation_fee', 'cash_settlement', 'store_order', 'penalty')),
    amount_inr      DECIMAL(12,2) NOT NULL,
    payment_method  VARCHAR(32) NOT NULL,
    tx_status       VARCHAR(20) NOT NULL CHECK (tx_status IN ('Settled', 'Pending', 'Overdue')),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA FOR FAST TECH (Kolkata Hub & Metro Ring)
-- ============================================================================

INSERT INTO users (id, full_name, email, phone_e164, role, city, postal_code, kyc_status) VALUES
('usr-cust-01', 'Rohan Chatterjee', 'rohan.c@example.in', '+919830451218', 'customer', 'Kolkata', '700001', 'Approved'),
('usr-cust-02', 'Ananya Mukherjee', 'ananya.m@example.in', '+919831120490', 'customer', 'Kolkata', '700019', 'Approved'),
('usr-eng-01',  'Arjun Sen',        'arjun.sen@fasttech.in', '+919874211044', 'engineer', 'Kolkata', '700016', 'Approved'),
('usr-eng-02',  'Vikram Das',       'vikram.d@fasttech.in',  '+919007823119', 'engineer', 'Kolkata', '700091', 'Approved'),
('usr-eng-03',  'Sourav Bose',      'sourav.b@fasttech.in',  '+919830992841', 'engineer', 'Kolkata', '700064', 'Pending');

INSERT INTO engineer_profiles (engineer_id, primary_specialty, secondary_specialty, availability_status, rating_avg, completed_jobs, ongoing_jobs, home_lat, home_lng) VALUES
('usr-eng-01', 'MacBook',  'NoteBook',    'Online', 4.80, 5, 1, 22.553500, 88.352500),
('usr-eng-02', 'Workstation', 'Desktop',  'Online', 4.70, 14, 0, 22.586700, 88.417100),
('usr-eng-03', 'Printer',  'Preventative Cleaning', 'Offline', 4.55, 8, 0, 22.595800, 88.401200);

INSERT INTO engineer_wallets (engineer_id, total_earnings_inr, cash_in_hand_inr, overdue_days, last_settled_at) VALUES
('usr-eng-01', 3099.00, 600.00, 1, '2026-11-12 18:30:00'),
('usr-eng-02', 8420.00, 1450.00, 5, '2026-11-05 14:15:00'),
('usr-eng-03', 4150.00, 0.00, 0, '2026-11-16 11:00:00');

INSERT INTO service_tickets (id, customer_id, assigned_engineer_id, device_category, device_serial_no, device_model, issue_subject, issue_description, is_urgent, priority, ticket_status, distance_km, visitation_fee_inr, payment_method, slot_day, slot_time, current_tier) VALUES
('FT-TK-9042', 'usr-cust-01', NULL, 'MacBook', 'C02Z9123LVDL', 'MacBook Pro 14 M3', 'USB-C PD charging port intermittent', 'Left Thunderbolt ports drop power delivery under load; logic board power rail check requested.', TRUE, 'High', 'Dispatching', 3.20, 300.00, 'UPI', 'Today', 'Within 45 mins', 1),
('FT-TK-9038', 'usr-cust-02', 'usr-eng-01', 'NoteBook', 'PF3K8821TNKP', 'Lenovo ThinkPad X1 Carbon', 'Thermal fan rattle & high CPU temps', 'Cooling fan grinds above 75C; thermal paste and fan assembly service in progress.', FALSE, 'Medium', 'In Progress', 2.40, 200.00, 'Card', 'Today', '2:00 PM - 4:00 PM', 1);

INSERT INTO ticket_dispatch_logs (id, ticket_id, engineer_id, dispatch_tier, outcome, note) VALUES
('log-01', 'FT-TK-9042', 'usr-eng-01', 1, 'sent', 'Dispatched to Tier 1 engineer within 5 km geofence'),
('log-02', 'FT-TK-9038', 'usr-eng-01', 1, 'accepted', 'Engineer Arjun Sen accepted within 14s');

INSERT INTO products (id, sku, name, category, unit_price_inr, stock_qty, serial_tracked, compatible_models) VALUES
('prd-01', 'FT-NVME-1TB', 'Fast Tech Pro 1TB PCIe Gen4 NVMe SSD', 'SSD', 6499.00, 14, TRUE, 'MacBook / ThinkPad / Dell XPS / Workstation'),
('prd-02', 'FT-MOBO-X1C', 'OEM Logic Motherboard Assembly (i7-1365U)', 'Motherboard', 24999.00, 4, TRUE, 'ThinkPad X1 Carbon Gen 11 / NoteBook'),
('prd-03', 'FT-RAM-32D5', 'Vengeance 32GB (2x16GB) DDR5 SO-DIMM 4800MHz', 'RAM', 7899.00, 9, TRUE, 'Workstation / Gaming NoteBook / Desktop'),
('prd-04', 'FT-PERI-MX',  'Tactile Wireless Mechanical Keyboard & Mouse Kit', 'Peripherals', 4299.00, 18, FALSE, 'Universal USB-C / Bluetooth');

INSERT INTO product_serial_units (id, product_id, serial_number, unit_status) VALUES
('sru-01', 'prd-01', 'SN-NVME-99401', 'In Stock'),
('sru-02', 'prd-01', 'SN-NVME-99402', 'In Stock'),
('sru-03', 'prd-02', 'SN-MOBO-44108', 'In Stock'),
('sru-04', 'prd-03', 'SN-DDR5-77120', 'In Stock');

INSERT INTO orders (id, customer_id, product_id, serial_unit_id, quantity, total_amount_inr, payment_method, order_status) VALUES
('ORD-5501', 'usr-cust-01', 'prd-01', 'sru-01', 1, 6499.00, 'UPI', 'Confirmed');

INSERT INTO financial_transactions (id, user_id, ticket_id, order_id, tx_type, amount_inr, payment_method, tx_status) VALUES
('tx-101', 'usr-cust-01', 'FT-TK-9042', NULL, 'visitation_fee', 300.00, 'UPI', 'Settled'),
('tx-102', 'usr-eng-02',  NULL, NULL, 'cash_settlement', 1450.00, 'Cash on Service', 'Overdue'),
('tx-103', 'usr-cust-01', NULL, 'ORD-5501', 'store_order', 6499.00, 'UPI', 'Settled');
`;
