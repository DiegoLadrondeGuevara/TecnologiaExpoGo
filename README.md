# 🛒 TechStore Ecosystem — Fullstack Solution

<p align="center">
<b>A complete e-commerce ecosystem featuring a Cross-platform Mobile App and a Web Admin Dashboard.</b>




Built with React Native (Expo), Vite, Tailwind CSS, and Mercado Pago integration.
</p>

---

## 🏗️ Ecosystem Overview

The project has been migrated to a **Monorepo-style** structure to ensure consistency between the customer experience and business management.

| Component | Technology | Description |
| --- | --- | --- |
| 📱 **Mobile App** | React Native / Expo | Customer-facing app with catalog, cart, and payments. |
| 💻 **Admin Dashboard** | React / Vite / Tailwind | Web portal for managing products, users, and sales. |
| 🌍 **Shared Logic** | JavaScript / i18next | Centralized translations, currency logic, and constants. |

---

## ✨ Key Features

### 📱 Customer Mobile App (`/mobile-app`)

* 🌐 **i18n Multi-language:** Seamless toggle between **English (USD $)** and **Spanish (PEN S/.)**.
* 💳 **Mercado Pago Integration:** Real checkout flow using WebView with status handling (Success/Pending/Failure).
* 🛍️ **Advanced Catalog:** Real-time search, category filtering, and live stock badges.
* 🛒 **Smart Cart:** Global state management with automatic tax (IVA) and currency conversion.
* 👤 **Profile & Settings:** Localization controls and user history.

### 🛡️ Admin Web Portal (`/admin-dashboard`)

* 📊 **Business Analytics:** Dashboard with key stats (Total Sales, Active Users, Inventory).
* 📦 **Inventory Management:** Full CRUD for products with bilingual support and image previews.
* 👥 **User Control:** View customer database, registration dates, and spending habits.
* 💰 **Payment Monitor:** Real-time transaction log synced with Mercado Pago statuses.
* 🎨 **Category Manager:** Dynamic creation of tech categories with custom color coding.

---

## 🛠️ Tech Stack

| Mobile | Web Admin | Shared / Backend |
| --- | --- | --- |
| Expo SDK 54 | Vite + React | i18next (120+ keys) |
| React Navigation | Tailwind CSS v4 | Mercado Pago SDK |
| Context API + useReducer | Lucide React | Axios (Mock API Service) |
| React Native WebView | React Router | Currency Formatter (1:3.80 rate) |

---

## 📁 Project Structure

```bash
TechStore-Project/
├── mobile-app/           # React Native App (formerly ReacMobile)
│   ├── src/
│   │   ├── api/          # Product & Payment services
│   │   ├── context/      # Cart & Language providers
│   │   └── screens/      # Home, Details, Cart, Profile, Payment (WebView)
├── admin-dashboard/      # Web Management Portal
│   ├── src/
│   │   ├── pages/        # Dashboard, Products CRUD, Users, Payments
│   │   ├── layouts/      # Sidebar & Navigation
│   │   └── services/     # Mock API for Admin tasks
└── shared-logic/         # Shared assets (Internalization & Constants)
    ├── locales/          # en.json & es.json (120+ translation keys)
    ├── currency.js       # USD ↔ PEN conversion logic
    └── constants.js      # Shared Enums & Config

```

---

## 🚀 Getting Started

### 1. Setup Shared Logic

Ensure translations and constants are available:

```bash
cd shared-logic
npm install

```

### 2. Run Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
# Open http://localhost:5173

```

### 3. Run Mobile App

```bash
cd mobile-app
npm install
npx expo start
# Scan QR code with Expo Go app

```

---

## 🌍 Localization & Currency

The system uses a sophisticated **Locale Engine** located in `/shared-logic`:

* **Logic:** Prices are calculated dynamically based on a base rate (1 USD = 3.80 PEN).
* **Formatting:** Uses `Intl.NumberFormat` to display currency according to the selected region.
* **Keys:** Over 120+ translation strings ensure that every button, alert, and spec is fully localized.

---

## 💳 Payment Flow (Mercado Pago)

1. **Checkout:** User clicks "Checkout" in the Mobile App.
2. **Preference:** `paymentService.js` creates a mock preference ID.
3. **WebView:** The app opens a secure Mercado Pago sandbox environment.
4. **Handling:** The app listens to URL changes to detect `?status=approved` or `?status=rejected`.
5. **Completion:** The cart is cleared on success and the user is redirected to a confirmation screen.

---

## 📄 License

This project is for educational and portfolio purposes.

<p align="center">
<b>Developed with ❤️ as a Fullstack Tech-Store Solution</b>
</p>

