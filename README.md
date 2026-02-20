# 🛒 TechStore — React Native / Expo Go

<p align="center">
  <b>A modern mobile e-commerce app for browsing and purchasing tech products.</b><br/>
  Built with React Native, Expo, and React Navigation.
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏠 **Home Screen** | Greeting header, search bar, horizontal category selector, and a 2-column product grid with pull-to-refresh |
| 🔍 **Real-time Search** | Filter products by name or description instantly as you type |
| 🏷️ **Category Filter** | Horizontal chips: All · Laptops · Smartphones · Gadgets |
| 📱 **Product Details** | Hero image, specs list, quantity selector (±), and floating "Add to Cart" button |
| 🛒 **Shopping Cart** | Item list with quantity controls and delete, automatic Subtotal + IVA (16%) + Total calculation |
| 💳 **Simulated Checkout** | Confirmation alert that clears the cart |
| 👤 **Profile Screen** | User avatar, stats bar, and settings menu |
| 🔴 **Cart Badge** | Live item count displayed on the Cart tab icon |
| ⏳ **Loading States** | Activity spinner while data loads |
| 📭 **Empty States** | Custom illustrations for empty cart and no search results |
| 📱 **SafeAreaView** | Proper notch/status bar handling on all devices |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React Native** | Cross-platform mobile UI |
| **Expo SDK 54** | Dev tooling, build pipeline, and Expo Go |
| **React Navigation** | Bottom Tabs + Native Stack navigation |
| **Context API + useReducer** | Global cart state management |
| **Lucide React Native** | Modern icon library |
| **react-native-safe-area-context** | SafeArea handling |
| **react-native-gesture-handler** | Touch gestures |
| **react-native-reanimated** | Animations |

---

## 📁 Project Structure

```
ReactMobile/
├── App.js                              # Entry point (providers + navigation)
├── .env                                # Environment variables (API_URL)
├── .env.example                        # Template for env variables
├── src/
│   ├── api/
│   │   └── productService.js           # Simulated API service (Promise-based)
│   ├── components/
│   │   ├── ProductCard.js              # 2-column grid card with category badge
│   │   ├── CustomButton.js             # Button (primary / outline / danger)
│   │   ├── SearchBar.js                # Search input with clear button
│   │   ├── CategorySelector.js         # Horizontal scrollable category chips
│   │   ├── CartItem.js                 # Cart row with ± controls and delete
│   │   └── EmptyState.js              # Placeholder for empty cart / no results
│   ├── context/
│   │   └── CartContext.js              # Cart state (Context API + useReducer)
│   ├── data/
│   │   └── products.json               # 12 products catalog
│   ├── navigation/
│   │   └── AppNavigator.js             # Bottom Tabs + Home Stack
│   ├── screens/
│   │   ├── HomeScreen.js               # Search, categories, product grid
│   │   ├── DetailsScreen.js            # Hero image, specs, add to cart
│   │   ├── CartScreen.js               # Cart summary, IVA 16%, checkout
│   │   └── ProfileScreen.js            # User profile & settings
│   └── theme/
│       └── colors.js                   # Design palette constants
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| **Primary** | `#007AFF` | Buttons, links, accents |
| **Background** | `#1C1C1E` | App background (dark mode) |
| **White** | `#FFFFFF` | Primary text |
| **Card** | `#2C2C2E` | Card backgrounds |
| **Border** | `#38383A` | Dividers and borders |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Expo CLI** (bundled via `npx`)
- **Expo Go** app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Installation

```bash
# Clone the repository
git clone https://github.com/DiegoLadrondeGuevara/TecnologiaExpoGo.git
cd TecnologiaExpoGo

# Install dependencies
npm install

# Create your env file
cp .env.example .env
# Edit .env and set your API_URL

# Start the development server
npx expo start
```

### Running on Device

1. Run `npx expo start`
2. Scan the QR code with **Expo Go** (Android) or the **Camera** app (iOS)
3. The app will load on your device

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `https://api.techstore.com/v1` | Base URL for the backend API |
| `APP_ENV` | `development` | Current environment |

> The `.env` file is git-ignored. Use `.env.example` as a template.

---

## 📦 Product Catalog

The app ships with **12 demo products** across 3 categories:

- **Laptops** (4) — MacBook Pro, Dell XPS, ThinkPad X1, ASUS ROG Zephyrus
- **Smartphones** (4) — iPhone 16 Pro Max, Galaxy S25 Ultra, Pixel 9 Pro, OnePlus 13
- **Gadgets** (4) — AirPods Pro 3, Apple Watch Ultra 3, Sony WH-1000XM6, Meta Quest 4

Each product includes: `id`, `name`, `price`, `description`, `specs`, `image_url`, `stock`, `category`.

---

## 🧮 Cart Logic

- **Add to Cart** — Items stack by quantity (capped at available stock)
- **Update Quantity** — ± buttons with min: 1, max: stock
- **Remove Item** — Confirmation dialog before deletion
- **Order Summary**:
  - **Subtotal** = Σ (price × quantity)
  - **IVA** = Subtotal × 16%
  - **Total** = Subtotal + IVA
- **Checkout** — Simulated success alert → clears cart

---

## 📄 License

This project is for educational purposes.

---

<p align="center">
  Made with ❤️ using React Native & Expo
</p>
