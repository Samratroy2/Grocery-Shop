// ─────────────────────────────────────────
// app.js  —  Entry point, wires all modules
// ─────────────────────────────────────────

import { state } from "./state.js";

import {
  showPage,
  showToast,
  openDrawer,
  closeDrawer
} from "./ui.js";

import {
  fetchProducts,
  loadProducts as productsLoadProducts,
  loadHomeProducts,
  filterCat,
  sortProducts,
  doSearch,
  renderProductGrid
} from "./products.js";

import {
  addToCart,
  changeQty,
  refreshCartUI,
  renderCartPage,
  applyPromo
} from "./cart.js";

import {
  placeOrder,
  loadOrders
} from "./orders.js";

import {
  openAuth,
  closeAuth,
  toggleAuthMode,
  handleAuth,
  signOut,
  initAuthListener
} from "./auth.js";

import {
  toggleWish
} from "./wishlist.js";

import {
  loadProfile,
  profileTab,
  saveProfile
} from "./profile.js";

import {
  loadAdmin,
  adminSection,
  adminAddProduct,
  adminDeleteProduct,
  adminUpdateProduct,
  adminUpdateOrder,
  adminUpdatePayment
} from "./admin.js";

// ─────────────────────────────────────────
// Shared render fn
// ─────────────────────────────────────────

window._freshmart = {
  renderProductGrid
};

// ─────────────────────────────────────────
// Global bridge functions
// ─────────────────────────────────────────

// Cart

window._addToCart =
  addToCart;

window._changeQty =
  changeQty;

window._renderCartPage =
  renderCartPage;

// Wishlist

window._toggleWish =
  toggleWish;

// Auth

window._openAuth =
  openAuth;

window._toggleAuthMode =
  toggleAuthMode;

// Profile

window._loadProfile =
  loadProfile;

window._saveProfile =
  saveProfile;

// Admin

window._adminAddProduct =
  adminAddProduct;

window._adminDeleteProduct =
  adminDeleteProduct;

window._adminUpdateProduct =
  adminUpdateProduct;

window._adminUpdateOrder =
  adminUpdateOrder;

window._adminUpdatePayment =
  adminUpdatePayment;

// ─────────────────────────────────────────
// Active Navbar
// ─────────────────────────────────────────

window.setActiveNav = (label) => {

  document
    .querySelectorAll(
      ".nav-cat-btn"
    )
    .forEach((btn) => {

      btn.classList.remove(
        "active"
      );

      if (
        btn.textContent.trim() ===
        label
      ) {

        btn.classList.add(
          "active"
        );

      }

    });

};

// ─────────────────────────────────────────
// Page Navigation
// ─────────────────────────────────────────

window.showPage = (pageId) => {

  // Save active page

  localStorage.setItem(
    "activePage",
    pageId
  );

  // Open page

  showPage(pageId);

};

// ─────────────────────────────────────────
// Home
// ─────────────────────────────────────────

window.goHome = () => {

  localStorage.removeItem(
    "activeCategory"
  );

  window.showPage(
    "home-page"
  );

  loadHomeProducts();

  setActiveNav(
    "Home"
  );

};

// ─────────────────────────────────────────
// Products
// ─────────────────────────────────────────

window.filterCat = (cat) => {

  // Save category

  localStorage.setItem(
    "activeCategory",
    cat
  );

  // Save page

  localStorage.setItem(
    "activePage",
    "products-page"
  );

  // ONLY call products.js filterCat

  filterCat(cat);

  // Active nav

  setActiveNav(cat);

};

// ─────────────────────────────────────────
// Auth
// ─────────────────────────────────────────

window.openAuth =
  openAuth;

window.closeAuth =
  closeAuth;

window.handleAuth =
  handleAuth;

window.signOut =
  signOut;

// ─────────────────────────────────────────
// Cart
// ─────────────────────────────────────────

window.openDrawer =
  openDrawer;

window.closeDrawer =
  closeDrawer;

window.renderCartPage = () => {

  localStorage.setItem(
    "activePage",
    "cart-page"
  );

  showPage(
    "cart-page"
  );

  renderCartPage();

  setActiveNav("");

};

window.applyPromo =
  applyPromo;

// ─────────────────────────────────────────
// Orders
// ─────────────────────────────────────────

window.placeOrder =
  placeOrder;

window.loadOrders = () => {

  localStorage.setItem(
    "activePage",
    "orders-page"
  );

  showPage(
    "orders-page"
  );

  loadOrders();

  setActiveNav(
    "My Orders"
  );

};

// ─────────────────────────────────────────
// Profile
// ─────────────────────────────────────────

window.profileTab =
  profileTab;

// ─────────────────────────────────────────
// Admin
// ─────────────────────────────────────────

window.loadAdmin = () => {

  localStorage.setItem(
    "activePage",
    "admin-page"
  );

  showPage(
    "admin-page"
  );

  loadAdmin();

  setActiveNav(
    "Admin"
  );

};

window.adminSection =
  adminSection;

window.showToast =
  showToast;

// ─────────────────────────────────────────
// Search Enter Key
// ─────────────────────────────────────────

document
  .getElementById(
    "search-input"
  )
  ?.addEventListener(
    "keyup",
    (e) => {

      if (
        e.key === "Enter"
      ) {

        doSearch();

      }

    }
  );

// ─────────────────────────────────────────
// App Init
// ─────────────────────────────────────────

(async () => {

  // Auth listener

  initAuthListener();

  // Fetch products

  await fetchProducts();

  // Restore page

  const savedPage =

    localStorage.getItem(
      "activePage"
    ) || "home-page";

  // Restore category

  const savedCategory =

    localStorage.getItem(
      "activeCategory"
    );

  // Open saved page

  showPage(savedPage);

  // ───────────────── HOME

  if (
    savedPage ===
    "home-page"
  ) {

    loadHomeProducts();

    setActiveNav(
      "Home"
    );

  }

  // ───────────────── PRODUCTS

  else if (
    savedPage ===
    "products-page"
  ) {

    // Restore category

    if (
      savedCategory
    ) {

      document.getElementById(
        "products-title"
      ).textContent =
        savedCategory;

      const filtered =

        state.products.filter(
          (p) =>

            p.category &&
            p.category.toLowerCase() ===
            savedCategory.toLowerCase()

        );

      renderProductGrid(
        "products-grid",
        filtered
      );

      setActiveNav(
        savedCategory
      );

    }

    // Restore all products

    else {

      document.getElementById(
        "products-title"
      ).textContent =
        "All Products";

      renderProductGrid(
        "products-grid",
        state.products
      );

      setActiveNav(
        "All Products"
      );

    }

  }

  // ───────────────── CART

  else if (
    savedPage ===
    "cart-page"
  ) {

    renderCartPage();

  }

  // ───────────────── ORDERS

  else if (
    savedPage ===
    "orders-page"
  ) {

    loadOrders();

    setActiveNav(
      "My Orders"
    );

  }

  // ───────────────── ADMIN

  else if (
    savedPage ===
    "admin-page"
  ) {

    loadAdmin();

    setActiveNav(
      "Admin"
    );

  }

  // Refresh cart

  refreshCartUI();

})();

// ─────────────────────────────────────────
// Discount Toggle
// ─────────────────────────────────────────

window.toggleDiscountDetails = () => {

  const box =

    document.getElementById(
      "discount-details"
    );

  if (!box) return;

  box.style.display =

    box.style.display ===
    "none"

      ? "block"

      : "none";

};

// ─────────────────────────────────────────
// All Products
// ─────────────────────────────────────────

window.loadProducts = () => {

  // Remove category filter

  localStorage.removeItem(
    "activeCategory"
  );

  // Save active page

  localStorage.setItem(
    "activePage",
    "products-page"
  );

  // Open products page

  showPage(
    "products-page"
  );

  // Load all products

  productsLoadProducts();

  // Active navbar

  setActiveNav(
    "All Products"
  );

};