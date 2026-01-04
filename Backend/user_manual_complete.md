# BlueStar Business System: The Complete User Manual

## 1. Welcome to BlueStar
BlueStar is your digital command center. It is designed to replace your handwritten registers, Excel sheets, and mental notes with a single, secure system. It handles **Trading** (Buying/Selling) and **Transport** (Trucks/Trips) in one place.

---

## 2. Who Uses This System? (Roles)

### 👑 The Admin (Owner)
*   **Power**: Unlimited.
*   **Responsibilities**:
    *   Check **Dashboard** to see Total Profit.
    *   **Approve/Delete** sensitive data (like deleting a wrong Invoice).
    *   Manage **Users** (Create accounts for staff).
*   **Key Question**: "Did we make money this month?"

### 👔 The Manager (Operations Head)
*   **Power**: High (Cannot Delete critical data).
*   **Responsibilities**:
    *   Create **Parties** (New Customers/Suppliers).
    *   Manage **Fleets** (Add trucks, checking expiry).
    *   Create **Trips** (Assigning drivers to trucks).
    *   Manage **Inventory** (Stock check).
*   **Key Question**: "Are the trucks running? Is the stock sufficient?"

### 🖊️ The Accountant (Clerk)
*   **Power**: Medium (Focus on Documents & Money).
*   **Responsibilities**:
    *   Generate **Invoices/Challans**.
    *   Enter **Payments** received (Cheques/Cash).
    *   Record **Expenses** (Diesel slips, Tolls).
*   **Key Question**: "Who owes us money? Have we paid our suppliers?"

---

## 3. The "Diesel Business" Workflow (Liquid Cargo)
*Scenario: You buy Diesel from Reliance and sell it to Sharma Petrol Pump.*

### Step 1: Procurement (Buying the Stock) -> *Role: Manager/Accountant*
1.  **Action**: Use **Inventory** feature.
    *   Ensure Item "Diesel" exists (Unit: Liters).
2.  **Action**: Use **Documents** feature.
    *   Create a **Purchase Invoice**.
    *   **Selection**: Supplier = "Reliance", Item = "Diesel", Qty = 20,000 Ltr.
    *   **Result**: 
        *   Your System Stock: **+20,000 Liters**.
        *   Reliance Ledger: You owe them money.

### Step 2: The Trip (Loading & Moving) -> *Role: Manager*
1.  **Action**: Use **Trips** feature.
    *   Start a new **Trip**.
    *   **Vehicle**: Select your tanker `MH-12-TANK-99`.
    *   **Driver**: Select "Ramesh".
    *   **Route**: Jamnagar to Pune.
    *   **Result**: System knows this truck is busy.

### Step 3: Expenses (On the Road) -> *Role: Driver calls Accountant*
1.  **Action**: Use **Trips** feature.
    *   Add **Expense**.
    *   **Type**: "Toll", **Amount**: ₹500.
    *   **Type**: "Driver Allowance (Bhatta)", **Amount**: ₹200.
    *   **Result**: This money is deducted from the Trip's profit.

### Step 4: Delivery & Sale -> *Role: Accountant*
1.  **Action**: Use **Documents** feature.
    *   Create **Sales Invoice**.
    *   **Customer**: "Sharma Petrol Pump".
    *   **Item**: "Diesel", Qty: 20,000 Ltr.
    *   **Link**: Link it to the Trip ID (optional but recommended).
    *   **Result**: 
        *   Your System Stock: **-20,000 Liters** (Back to zero).
        *   Sharma's Ledger: He owes you ₹18 Lakhs.

---

## 4. The "Cement Trading" Workflow (Solid Cargo)
*Scenario: You buy Cement bags, store them, and sell partially to small builders.*

### Step 1: Stock In (Warehousing) -> *Role: Store Keeper / Manager*
1.  **Action**: Create **Purchase Invoice**.
    *   **Supplier**: "UltraTech Cement".
    *   **Item**: "Cement Bag (50kg)", Qty: 1000 Bags.
    *   **Result**: Warehouse Stock = 1000 Bags.

### Step 2: Partial Sales (Retail) -> *Role: Sales Staff*
1.  **Action**: Create **Challan** (Delivery Note).
    *   **Customer**: "Small Builder A".
    *   **Qty**: 50 Bags.
    *   *Note*: Challan reduces stock but doesn't ask for money immediately (if credit).
2.  **Action**: Create **Sales Invoice** later.
    *   Convert Challan to Bill.
    *   **Result**: Builder A owes you for 50 bags. 
    *   **Stock**: 950 Bags remaining.

---

## 5. The "Direct Delivery" Workflow (Trading without Warehouse)
*Scenario: You buy Steel from Tata and ship it DIRECTLY to a Bridge Construction Site. You never touch the steel.*

1.  **Action**: Start a **Trip**.
    *   Set **Source**: "Tata Steel Plant" (Supplier Link).
    *   Set **Destination**: "Bridge Site" (Customer Link).
2.  **Action**: Create **Purchase Invoice** (from Tata) AND **Sales Invoice** (to Bridge Site) on the same day.
3.  **Result**: 
    *   You make a profit (Sales Price - Purchase Price).
    *   Transport Cost is deducted from this profit.
    *   Stock remains neutral.

---

## 6. Managing Money (The Ledger)

### Receiving Payment
*Sharma Pump gives you a Cheque of ₹5 Lakhs.*

1.  **Where**: **Transactions** -> `Create Payment In`.
2.  **Inputs**:
    *   **Party**: Sharma Pump.
    *   **Amount**: 500,000.
    *   **Related Doc**: Link to Invoice #101 (Optional).
3.  **Outcome**: Sharma's debt reduces. Your Cash position increases.

### Paying Suppliers
*You pay Reliance Refinery via Bank Transfer.*

1.  **Where**: **Transactions** -> `Create Payment Out`.
2.  **Inputs**: 
    *   **Party**: Reliance.
    *   **Amount**: 10,00,000.
3.  **Outcome**: Your debt to Reliance reduces.

---

## 7. The Dashboard (The "Bird's Eye View")

The Admin starts their day here. The Dashboard tells you:
1.  **Sales Revenue**: Total bills generated this month.
2.  **Outstanding (Receivable)**: Total money stuck in the market. *Critical for cashflow.*
3.  **Fleet Usage**: How many trips did we run?
4.  **Trip Margin**: Are we engaged in profitable transport or losing money on diesel?

---
*Created by Antigravity. This manual serves as the standard operating procedure for BlueStar.*
