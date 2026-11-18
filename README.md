# ⚡ Fast Tech — On-Demand IT Hardware Services & E-Commerce Ecosystem

**Fast Tech** is a unified, multi-role service fulfillment and IT hardware retail platform connecting customers with verified field technicians in real time. Designed as a mobile-first Progressive Web App (PWA) ready for native Android/iOS packaging via Capacitor, the ecosystem consists of three integrated portals:

1. **Customer App:** On-demand hardware repair ticketing, diagnostic audio/video uploads, live technician tracking, and a serial-tracked hardware store.
2. **Service Engineer App:** Geo-located job acceptance with countdown timers, route navigation, earnings wallet, and cash-settlement ledger.
3. **Super Admin Command Center:** Runtime pricing and geofence configuration, KYC verification, unmasked audit logs, and inventory control.

---

## 🚀 Key Features

### 📱 Customer Portal
* **Smart Service Ticketing:** Book repairs across NoteBooks, MacBooks, Desktops, Workstations, Printers, and Peripherals with mandatory hardware **Serial Number** verification.
* **Diagnostic Media Suite:** Capture and attach audio notes, fault demonstration videos, and images directly during ticket creation.
* **Dynamic Distance-Based Pricing:** Automated visitation fee calculation across configurable distance brackets (`0–5 km`, `5–10 km`, `10–20 km`).
* **Real-Time Tracking & Privacy Masking:** Live map route tracking with ETA and encrypted in-app chat/VoIP—customer and technician phone numbers remain permanently masked.
* **Integrated Hardware Store:** Browse and purchase motherboards, RAM, SSDs, chips, and peripherals with serial-number warranty binding.

### 🛠️ Service Engineer Portal
* **Zero-Cost Onboarding & Dual-Specialization Rule:** Free technician registration with admin KYC approval and a strict limit of up to **two core specializations** to ensure accurate job routing.
* **Tiered Waterfall Dispatch Engine:** Incoming job alerts featuring proximity distance, diagnostic media previews, and a **60-second acceptance timer** that cascades across Tier 1 (`0–5 km`), Tier 2 (`5–10 km`), and Tier 3 (`10–20 km`).
* **Earnings Wallet & Cash Liability Tracker:** Real-time tracking of completed services, weekly performance charts, online payouts, and cash-on-hand settlement tracking.

### 🛡️ Super Admin Command Center
* **Runtime Configuration:** Adjust service fees, geofence radiuses, and dispatch timers dynamically without requiring app updates.
* **KYC & User Registry:** Full directory with unmasked audit access, profile approvals, and account freeze controls.
* **Anti-Fraud Cash Settlement Monitor:** Automated tracking and penalty enforcement for overdue engineer cash-in-hand deposits.

---

## 🏗️ System Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend (Mobile & Web)** | HTML5, CSS3 / Tailwind CSS, JavaScript / React (PWA + Capacitor) |
| **Maps & Geolocation** | Leaflet.js / Google Maps Distance Matrix API |
| **Database** | PostgreSQL + PostGIS (Spatial Indexing) / MySQL |
| **Payments** | Razorpay Payment Gateway (UPI, Cards, NetBanking, Cash) |
| **Storage** | Cloud Object Storage (Diagnostic Audio/Video & KYC Docs) |

---

## 🗄️ Database Schema Overview

The relational schema (`fast_tech_schema.sql`) is normalized across 9 core tables:
* `users` — Role-based authentication (`customer`, `engineer`, `admin`) and account status.
* `engineer_profiles` — Dual specializations, KYC document URLs, live GPS coordinates, and availability state.
* `service_tickets` — Device serial numbers, diagnostic media URLs, pickup coordinates, distance, and fee breakdown.
* `ticket_dispatch_logs` — Audit trail for Tier 1–3 waterfall escalation attempts.
* `products` & `product_serial_units` — Hardware catalog and individual unit serial tracking.
* `orders` — E-commerce checkout and fulfillment records.
* `financial_transactions` & `engineer_wallets` — Commission splits, online settlements, cash-in-hand liabilities, and penalties.

---

## ⚙️ Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Bibhanshuu/fast-tech.git](https://github.com/Bibhanshuu/fast-tech.git)
   cd fast-tech
