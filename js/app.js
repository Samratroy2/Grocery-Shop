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
  loadProducts,
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
// Shared render fn for cross-module use
// ─────────────────────────────────────────

window._freshmart = {
  renderProductGrid
};

// ─────────────────────────────────────────
// Global bridge functions
// Used inside inline onclick HTML
// ─────────────────────────────────────────

// Cart
window._addToCart = addToCart;
window._changeQty = changeQty;
window._renderCartPage = renderCartPage;

// Wishlist
window._toggleWish = toggleWish;

// Auth
window._openAuth = openAuth;
window._toggleAuthMode = toggleAuthMode;

// Profile
window._loadProfile = loadProfile;
window._saveProfile = saveProfile;

// Admin
window._adminAddProduct = adminAddProduct;

window._adminDeleteProduct = adminDeleteProduct;

window._adminUpdateProduct = adminUpdateProduct;

window._adminUpdateOrder = adminUpdateOrder;

window._adminUpdatePayment =adminUpdatePayment;

// ─────────────────────────────────────────
// Expose functions to HTML
// ─────────────────────────────────────────

window.showPage = showPage;

window.goHome = () => {

  showPage("home-page");

  loadHomeProducts();

};

window.filterCat = filterCat;

window.loadProducts = loadProducts;

window.sortProducts = sortProducts;

window.doSearch = doSearch;

window.openAuth = openAuth;

window.closeAuth = closeAuth;

window.handleAuth = handleAuth;

window.signOut = signOut;

window.openDrawer = openDrawer;

window.closeDrawer = closeDrawer;

window.renderCartPage = renderCartPage;

window.applyPromo = applyPromo;

window.placeOrder = placeOrder;

window.loadOrders = loadOrders;

window.profileTab = profileTab;

window.loadAdmin = loadAdmin;

window.adminSection = adminSection;

window.showToast = showToast;

// ─────────────────────────────────────────
// Search Enter Key
// ─────────────────────────────────────────

document
  .getElementById("search-input")
  ?.addEventListener("keyup", (e) => {

    if (e.key === "Enter") {

      doSearch();

    }

  });

// ─────────────────────────────────────────
// App Init
// ─────────────────────────────────────────

(async () => {

  // Firebase auth listener

  initAuthListener();

  // Load products from firestore

  await fetchProducts();

  // Render home products

  renderProductGrid(
    "home-grid",
    state.products.slice(0, 8)
  );

  // Refresh cart badge + totals

  refreshCartUI();

})();