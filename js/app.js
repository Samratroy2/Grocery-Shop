// ─────────────────────────────────────────
// app.js  —  Entry point, wires all modules
// ─────────────────────────────────────────

import { state }                                        from "./state.js";
import { showPage, showToast, openDrawer, closeDrawer } from "./ui.js";
import { seedProducts, fetchProducts, loadProducts,
         loadHomeProducts, filterCat, sortProducts,
         doSearch, renderProductGrid }                  from "./products.js";
import { addToCart, changeQty, refreshCartUI,
         renderCartPage, applyPromo }                   from "./cart.js";
import { placeOrder, loadOrders }                       from "./orders.js";
import { openAuth, closeAuth, toggleAuthMode,
         handleAuth, signOut, initAuthListener }        from "./auth.js";
import { toggleWish }                                   from "./wishlist.js";
import { loadProfile, profileTab, saveProfile }         from "./profile.js";
import { loadAdmin, adminSection,
         adminAddProduct, adminDeleteProduct,
         adminUpdateOrder }                             from "./admin.js";

// ── Expose shared render fn for cross-module use ──
window._freshmart = { renderProductGrid };

// ── Global bridging functions (called from inline HTML onclick) ──
window._addToCart         = addToCart;
window._changeQty         = changeQty;
window._toggleWish        = toggleWish;
window._renderCartPage    = renderCartPage;
window._openAuth          = openAuth;
window._toggleAuthMode    = toggleAuthMode;
window._loadProfile       = loadProfile;
window._saveProfile       = saveProfile;
window._adminAddProduct   = adminAddProduct;
window._adminDeleteProduct= adminDeleteProduct;
window._adminUpdateOrder  = adminUpdateOrder;

// ── Expose to HTML onclick attributes ───

window.showPage      = showPage;
window.goHome        = () => { showPage("home-page"); loadHomeProducts(); };
window.filterCat     = filterCat;
window.loadProducts  = loadProducts;
window.sortProducts  = sortProducts;
window.doSearch      = doSearch;
window.openAuth      = openAuth;
window.closeAuth     = closeAuth;
window.handleAuth    = handleAuth;
window.signOut       = signOut;
window.openDrawer    = openDrawer;
window.closeDrawer   = closeDrawer;
window.renderCartPage= renderCartPage;
window.applyPromo    = applyPromo;
window.placeOrder    = placeOrder;
window.loadOrders    = loadOrders;
window.profileTab    = profileTab;
window.loadAdmin     = loadAdmin;
window.adminSection  = adminSection;
window.showToast     = showToast;

// ── Search: Enter key ────────────────────
document.getElementById("search-input")
  .addEventListener("keyup", (e) => { if (e.key === "Enter") doSearch(); });

// ── Init ─────────────────────────────────
(async () => {
  initAuthListener();          // firebase auth → state sync
  await seedProducts();        // seed on first run
  await fetchProducts();       // populate state.products
  renderProductGrid("home-grid", state.products.slice(0, 8));
  refreshCartUI();             // set badge / drawer totals
})();
