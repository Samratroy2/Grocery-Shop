# 🌿 FreshMart — Premium Grocery Store

A full-featured grocery e-commerce web app built with **Vanilla JS (ES Modules)** + **Firebase** (Auth + Firestore).

---

## 📁 Folder Structure

```
freshmart/
│
├── index.html                  ← Single-page app shell (all page markup)
│
├── package.json
│
├── css/
│   ├── variables.css           ← CSS custom properties (design tokens) + reset
│   ├── navbar.css              ← Top nav, search bar, category strip
│   ├── home.css                ← Hero, offers strip, category grid, toast, loader
│   ├── products.css            ← Product cards, grid, add/qty buttons, section titles
│   ├── cart.css                ← Cart page, cart drawer, order cards
│   ├── auth.css                ← Auth modal, profile page, admin panel, shared form styles
│   └── responsive.css          ← Media queries / mobile breakpoints
│
└── js/
    ├── firebase.js             ← Firebase init & re-exported SDK helpers
    ├── state.js                ← Central shared state object
    ├── seed.js                 ← Initial product catalog (20 products)
    ├── ui.js                   ← Toast, page navigation, drawer, emoji map
    ├── products.js             ← Fetch, render, search, sort, filter products
    ├── cart.js                 ← Cart mutations, drawer render, cart page, promo
    ├── orders.js               ← Place order, load & display orders
    ├── auth.js                 ← Login, register, sign-out, auth state listener
    ├── wishlist.js             ← Toggle wishlist & persist to Firestore
    ├── profile.js              ← Profile page tabs, save profile
    ├── admin.js                ← Admin dashboard, product/order/customer management
    └── app.js                  ← Entry point — imports & wires all modules together
```

---

## 🚀 Features

| Feature | Details |
|---|---|
| 🔐 Auth | Email/password via Firebase Auth |
| 🛒 Cart | Add, remove, qty control, drawer sidebar |
| ❤️ Wishlist | Toggle & persist per user |
| 📦 Orders | Place orders, view history with status |
| 🔍 Search | Realtime search across name & category |
| 🏷️ Filter | Filter by 8 categories, sort by price/name |
| 🎟️ Promo | Code `FRESH20` for 20% extra discount |
| ⚙️ Admin | Dashboard, add/delete products, manage orders & customers |
| 📱 Responsive | Mobile-first breakpoints |

---

## 🔧 How to Run

Since the JS uses **ES Modules** with `import` statements, you must serve this over **HTTP** (not `file://`).

```bash
# Option 1: Python
cd freshmart
python3 -m http.server 8080

# Option 2: Node (npx)
npx serve freshmart

# Option 3: VS Code
# Install "Live Server" extension → Right-click index.html → Open with Live Server
```

Then open `http://localhost:8080`.

---

## 🔑 Admin Access

To grant admin access to a user:
1. Register a new account normally
2. Go to Firebase Console → Firestore → `users` collection
3. Find the user document and set `role: "admin"`
4. The ⚙️ Admin link will appear in the navbar on next login

---

## 🌐 Firebase Setup

The app uses a pre-configured Firebase project. To use your own:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password Authentication**
3. Create a **Firestore** database in production mode
4. Replace the config object in `js/firebase.js`
5. Add a Firestore composite index for orders:
   - Collection: `orders` | Fields: `uid ASC`, `createdAt DESC`
