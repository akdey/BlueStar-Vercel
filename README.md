# 🌌 Enterprise Trading & Logistics Command Center

> A premium Enterprise Resource Planning (ERP) system tailored for the modern **Trading and Transport** industry. It seamlessly bridges the gap between financial documentation, warehouse management, and real-time fleet logistics.

---

## 🚀 Key Value Proposition

This system replaces fragmented workflows with a unified, secure digital environment. From the moment a quotation is raised to the second a delivery truck reaches its destination, the suite ensures every stakeholder is informed, every penny is tracked, and every stock item is accounted for.

---

## 💎 Core Feature Ecosystem

### 📨 Smart Voucher Workflow (The "Approval Chain")
The system implements a high-integrity financial workflow for **Invoices, Challans, Quotations, and Bills**.
*   **Draft Creation**: Staff can generate vouchers which remain in a "Draft" status.
*   **Multi-Channel Approval**: 
    *   **Portal**: Admins can review and approve directly through the web dashboard.
    *   **Telegram Integration**: Critical alerts are pumped to the Admin's Telegram. Approvals can be granted **instantly via Telegram buttons** without logging into the portal.
*   **Automated Outreach**: Upon approval, the system automatically triggers a professional mailer to the customer’s inbox with the document details.

### 📄 Professional Documentation & Security
*   **Smart Printing**: All vouchers are print-ready with professional layouts.
*   **Dynamic Watermarking**: To ensure document integrity, unapproved vouchers are generated with a **prominent "DRAFT" watermark** and no authorization markers.
*   **Digital Signatures**: Once approved by an administrator, the watermark is removed, and the **official digital signature** of the approver is automatically embedded into the document for legal and professional validity.

### 📱 Responsive Design & PWA
*   **Mobile First**: The interface is fully responsive, looking stunning on desktops, tablets, and smartphones.
*   **Progressive Web App (PWA)**: Install the application directly on your device for a native-like experience, offline capabilities, and quick access from the home screen.

### 🚛 Precision Logistics & Fleet Tracking
*   **Mission Control**: Start, manage, and complete trips with assigned drivers and vehicles.
*   **Live Intelligence**: Monitor fleet movement and trip status (In Transit, Completed, Delayed).
*   **Expense Management**: Real-time logging of road expenses (Tolls, Diesel, Bhatta) to calculate **Net Trip Margin**.

### 📦 Dynamic Inventory Registry
*   **Universal Ledger**: Support for both **Goods** (Diesel, Cement, Steel) and **Services** (Freight, Consultation).
*   **Automatic Sync**: Inventory levels are live-linked to Trade Vouchers. Generating a Sales Invoice or Challan automatically "burns" stock, while Purchase Bills replenish it.

### 🤖 Enterprise AI Assistant
*   **Data Conversationalist**: Integrated chat interface that allows users to query their business data using natural language.
*   *Example: "What was our total profit across all trips last week?" or "List customers with outstanding balance > ₹50,000."*

---

## 🛠 Tech Stack & Architecture

### Frontend (User Experience)
*   **Framework**: Next.js (React)
*   **Styling**: Premium UI with rich aesthetics, glassmorphism, and responsive design.
*   **PWA**: PWA-ready with manifest and service worker configuration.

### Backend (The Engine)
*   **API**: FastAPI (High-performance Python)
*   **Database**: PostgreSQL with SQLAlchemy ORM.
*   **Authentication**: JWT-based Secure RBAC (Admin, Manager, Accountant).
*   **Task Queue**: Asynchronous background tasks for Emails and Telegram notifications.

### External Integrations
*   **Messaging**: Telegram Bot API for remote actions.
*   **Email**: SMTP/Email Service for automated customer notifications.

---

## 📂 Project Structure

```text
├── Backend/          # FastAPI server, Database models, & Business logic
├── Frontend/         # Next.js Application & UI Components
├── VercelDeployable/ # Ready-to-ship production bundle (for Vercel deployment & deployed)
```

---

## 🚦 Getting Started

### Prerequisites
*   Node.js v18+
*   Python 3.10+
*   PostgreSQL Database

### Rapid Setup
1. **Clone the Repo**: `git clone <repo-url>`
2. **Backend Setup**:
   - `cd Backend`
   - Create `.env` from `.env.example`
   - `pip install -r requirements.txt` (or use `uv sync`)
   - `python main.py`
3. **Frontend Setup**:
   - `cd Frontend`
   - `npm install`
   - `npm run dev`

---

## 👔 Roles & Permissions
*   **Admin**: Full system control, high-level analytics, and final approval authority.
*   **Manager**: Operations management, Fleet assignment, and Party registry.
*   **Accountant**: Documentation focus, Payment processing, and Expense logging.

---

Developed with ❤️.  
*Empowering the backbone of logistics with next-gen technology.*
