-- ============================================================================
-- FAST TECH — On-Demand IT Hardware Services & Integrated E-Commerce Schema
-- Compatible with PostgreSQL 15+ / MySQL 8+ (Normalized Relational DDL + Seed)
-- ============================================================================

CREATE TABLE users (
    id              VARCHAR(36) PRIMARY KEY,
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL UNIQUE,
    phone_e164      VARCHAR(24)  NOT NULL UNIQUE,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('customer', 'engineer', 'admin')),
    city            VARCHAR(80)  NOT NULL DEFAULT 'Kolkata',
    postal_code     VARCHAR(16)  NOT NULL DEFAULT '700001',
    kyc_status      VARCHAR(20)  NOT NULL DEFAULT 'Pending' CHECK (kyc_status IN ('Approved', 'Pending', 'Suspended')),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE engineer_profiles (
    engineer_id         VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    primary_specialty   VARCHAR(48) NOT NULL,
    secondary_specialty VARCHAR(48) NULL,
    availability_status VARCHAR(20) NOT NULL DEFAULT 'Online' CHECK (availability_status IN ('Online', 'Busy', 'Offline', 'Frozen')),
    rating_avg          DECIMAL(3,2) NOT NULL DEFAULT 4.80,
    completed_jobs      INT NOT NULL DEFAULT 0,
    ongoing_jobs        INT NOT NULL DEFAULT 0,
    home_lat            DECIMAL(9,6) NOT NULL,
    home_lng            DECIMAL(9,6) NOT NULL,
    CONSTRAINT chk_dual_specialization CHECK (primary_specialty <> secondary_specialty)
);

CREATE TABLE service_tickets (
    id                   VARCHAR(36) PRIMARY KEY,
    customer_id          VARCHAR(36) NOT NULL REFERENCES users(id),
    assigned_engineer_id VARCHAR(36) NULL REFERENCES engineer_profiles(engineer_id),
    device_category      VARCHAR(48) NOT NULL,
    device_serial_no     VARCHAR(64) NOT NULL,
    device_model         VARCHAR(120) NOT NULL,
    issue_subject        VARCHAR(180) NOT NULL,
    issue_description    TEXT NOT NULL,
    is_urgent            BOOLEAN NOT NULL DEFAULT FALSE,
    priority             VARCHAR(16) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    ticket_status        VARCHAR(24) NOT NULL DEFAULT 'Dispatching' CHECK (ticket_status IN ('Dispatching', 'In Progress', 'Completed', 'Escalated')),
    distance_km          DECIMAL(5,2) NOT NULL,
    visitation_fee_inr   DECIMAL(10,2) NOT NULL,
    payment_method       VARCHAR(32) NOT NULL,
    slot_day             VARCHAR(24) NOT NULL,
    slot_time            VARCHAR(32) NOT NULL,
    current_tier         SMALLINT NOT NULL DEFAULT 1 CHECK (current_tier IN (1, 2, 3)),
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_dispatch_logs (
    id              VARCHAR(36) PRIMARY KEY,
    ticket_id       VARCHAR(36) NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
    engineer_id     VARCHAR(36) NOT NULL REFERENCES engineer_profiles(engineer_id),
    dispatch_tier   SMALLINT NOT NULL CHECK (dispatch_tier IN (1, 2, 3)),
    outcome         VARCHAR(20) NOT NULL CHECK (outcome IN ('sent', 'accepted', 'rejected', 'timeout')),
    note            VARCHAR(255) NULL,
    logged_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE product_serial_units (
    id              VARCHAR(36) PRIMARY KEY,
    product_id      VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    serial_number   VARCHAR(80) NOT NULL UNIQUE,
    unit_status     VARCHAR(20) NOT NULL DEFAULT 'In Stock' CHECK (unit_status IN ('In Stock', 'Reserved', 'Sold', 'RMA')),
    received_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE engineer_wallets (
    engineer_id         VARCHAR(36) PRIMARY KEY REFERENCES engineer_profiles(engineer_id) ON DELETE CASCADE,
    total_earnings_inr  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cash_in_hand_inr    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    overdue_days        INT NOT NULL DEFAULT 0,
    last_settled_at     TIMESTAMP NULL
);

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
