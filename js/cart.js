// ─────────────────────────────────────────
// cart.js  —  Cart state, drawer & page
// ─────────────────────────────────────────

import {
  db,
  doc,
  updateDoc,
  increment
} from "./firebase.js";

import { state } from "./state.js";

import {
  showToast
} from "./ui.js";

// ─────────────────────────────────────────
// Add to cart
// ─────────────────────────────────────────

export async function addToCart(id) {

  const product = state.products.find(
    (x) => x.id === id
  );

  // Product check

  if (!product) {

    showToast(
      "Product not found",
      "error"
    );

    return;
  }

  // Stock check

  if (
    product.stock !== undefined &&
    product.stock <= 0
  ) {

    showToast(
      "❌ Out of stock",
      "error"
    );

    return;
  }

  // Add locally

  state.cart[id] =
    (state.cart[id] || 0) + 1;

  // Reduce stock locally

  if (product.stock !== undefined) {

    product.stock -= 1;

  }

  // Update Firebase stock

  try {

    await updateDoc(

      doc(db, "products", id),

      {
        stock: increment(-1)
      }

    );

  } catch (e) {

    console.error(e);

  }

  refreshCartUI();

  showToast(
    `🛒 ${product.name} added`
  );

  // Save cart

  if (state.currentUser) {

    saveCart();

  }

}

// ─────────────────────────────────────────
// Change quantity
// ─────────────────────────────────────────

export async function changeQty(id, delta) {

  const product = state.products.find(
    (x) => x.id === id
  );

  if (!product) return;

  const current =
    state.cart[id] || 0;

  // Increase qty

  if (delta > 0) {

    // Stock check

    if (
      product.stock !== undefined &&
      product.stock <= 0
    ) {

      showToast(
        "❌ No stock left",
        "error"
      );

      return;
    }

    // Increase locally

    state.cart[id] =
      current + delta;

    // Reduce stock locally

    if (product.stock !== undefined) {

      product.stock -= delta;

    }

    // Firebase update

    try {

      await updateDoc(

        doc(db, "products", id),

        {
          stock: increment(-delta)
        }

      );

    } catch (e) {

      console.error(e);

    }

  }

  // Decrease qty

  else {

    const removeQty =
      Math.abs(delta);

    // Restore stock locally

    if (product.stock !== undefined) {

      product.stock += removeQty;

    }

    // Decrease cart qty

    state.cart[id] =
      current - removeQty;

    // Firebase restore stock

    try {

      await updateDoc(

        doc(db, "products", id),

        {
          stock: increment(removeQty)
        }

      );

    } catch (e) {

      console.error(e);

    }

    // Remove item fully

    if (state.cart[id] <= 0) {

      delete state.cart[id];

    }

  }

  refreshCartUI();

  // Save cart

  if (state.currentUser) {

    saveCart();

  }

}

// ─────────────────────────────────────────
// Save cart to Firebase
// ─────────────────────────────────────────

export async function saveCart() {

  try {

    await updateDoc(

      doc(
        db,
        "users",
        state.currentUser.uid
      ),

      {
        cart: state.cart
      }

    );

  } catch (e) {

    console.error(
      "saveCart error:",
      e
    );

  }

}

// ─────────────────────────────────────────
// Refresh Cart UI
// ─────────────────────────────────────────

export function refreshCartUI() {

  const count = Object.values(
    state.cart
  ).reduce((s, v) => s + v, 0);

  const total = Object.entries(
    state.cart
  ).reduce((s, [id, q]) => {

    const p = state.products.find(
      (x) => x.id === id
    );

    return s + (
      p
        ? p.price * q
        : 0
    );

  }, 0);

  // Badge

  const badge =
    document.getElementById(
      "cart-badge"
    );

  if (badge) {

    badge.textContent = count;

  }

  // Drawer total

  const drawerTotal =
    document.getElementById(
      "drawer-total-val"
    );

  if (drawerTotal) {

    drawerTotal.textContent =
      `₹${total}`;

  }

  // Render drawer

  renderDrawer();

  // Re-render products

  const {
    renderProductGrid
  } = window._freshmart || {};

  if (!renderProductGrid) return;

  // Home grid

  const hp =
    document.getElementById(
      "home-grid"
    );

  if (
    hp &&
    hp.innerHTML.includes("prod-body")
  ) {

    renderProductGrid(

      "home-grid",

      state.products.slice(0, 12)

    );

  }

  // Product grid

  const pp =
    document.getElementById(
      "products-grid"
    );

  if (
    pp &&
    pp.innerHTML.includes("prod-body")
  ) {

    renderProductGrid(

      "products-grid",

      state.products

    );

  }

}

// ─────────────────────────────────────────
// Render Cart Page
// ─────────────────────────────────────────

export function renderCartPage() {

  const panel =
    document.getElementById(
      "cart-items-panel"
    );

  if (!panel) return;

  const entries =
    Object.entries(state.cart);

  // Empty cart

  if (!entries.length) {

    panel.innerHTML = `

      <div class="cart-empty-msg">

        <div class="big">
          🛒
        </div>

        <p>Your cart is empty</p>

      </div>

    `;

    return;
  }

  // Render items

  panel.innerHTML = entries.map(

    ([id, qty]) => {

      const p =
        state.products.find(
          (x) => x.id === id
        );

      if (!p) return "";

      return `

        <div class="cart-item-row">

          <div class="cart-item-img">

            <img
              src="${
                p.image ||
                "https://via.placeholder.com/80"
              }"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:12px;
              "
            />

          </div>

          <div class="cart-item-info">

            <div class="cart-item-name">
              ${p.name}
            </div>

            <div class="cart-item-unit">
              ${p.unit || ""}
            </div>

            <div class="cart-item-price">
              ₹${p.price * qty}
            </div>

          </div>

          <div class="qty-ctrl">

            <button
              class="qty-btn"
              onclick="
                window._changeQty(
                  '${id}',
                  -1
                );
                window._renderCartPage();
              "
            >
              −
            </button>

            <span class="qty-num">
              ${qty}
            </span>

            <button
              class="qty-btn"
              onclick="
                window._changeQty(
                  '${id}',
                  1
                );
                window._renderCartPage();
              "
            >
              +
            </button>

          </div>

        </div>

      `;

    }

  ).join("");

  // Totals

  const total = entries.reduce(

    (sum, [id, qty]) => {

      const p =
        state.products.find(
          (x) => x.id === id
        );

      return sum + (
        p
          ? p.price * qty
          : 0
      );

    },

    0

  );

  // Update total

  const totalEl =
    document.getElementById(
      "sum-total"
    );

  if (totalEl) {

    totalEl.textContent =
      `₹${total}`;

  }

}

// ─────────────────────────────────────────
// Drawer
// ─────────────────────────────────────────

export function renderDrawer() {

  const body =
    document.getElementById(
      "drawer-body"
    );

  if (!body) return;

  const entries =
    Object.entries(state.cart);

  // Empty cart

  if (!entries.length) {

    body.innerHTML = `

      <div style="
        text-align:center;
        padding:50px 20px;
        color:var(--muted)
      ">

        <div style="
          font-size:50px;
          margin-bottom:14px
        ">
          🛒
        </div>

        <p>Cart is empty</p>

      </div>

    `;

    return;
  }

  // Render cart

  body.innerHTML = entries.map(

    ([id, qty]) => {

      const p =
        state.products.find(
          (x) => x.id === id
        );

      if (!p) return "";

      return `

        <div class="cart-item-row">

          <div class="cart-item-img">

            <img
              src="${
                p.image ||
                "https://via.placeholder.com/80"
              }"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:12px;
              "
            />

          </div>

          <div class="cart-item-info">

            <div class="cart-item-name">
              ${p.name}
            </div>

            <div class="cart-item-unit">
              ${p.unit || ""}
            </div>

            <div class="cart-item-price">
              ₹${p.price * qty}
            </div>

          </div>

          <div
            class="qty-ctrl"
            style="
              flex-direction:column;
              gap:4px
            "
          >

            <div class="qty-ctrl">

              <button
                class="qty-btn"
                onclick="
                  window._changeQty(
                    '${id}',
                    -1
                  )
                "
              >
                −
              </button>

              <span class="qty-num">
                ${qty}
              </span>

              <button
                class="qty-btn"
                onclick="
                  window._changeQty(
                    '${id}',
                    1
                  )
                "
              >
                +
              </button>

            </div>

            <button
              class="cart-item-remove"
              onclick="
                window._changeQty(
                  '${id}',
                  -${qty}
                )
              "
            >
              🗑️
            </button>

          </div>

        </div>

      `;

    }

  ).join("");

}

// ─────────────────────────────────────────
// Apply Promo
// ─────────────────────────────────────────

export function applyPromo() {

  const code = document
    .getElementById("promo-input")
    ?.value
    .toUpperCase()
    .trim();

  if (!code) return;

  // Cart subtotal

  const subtotal =
    Object.entries(state.cart)
      .reduce((s, [id, q]) => {

        const p =
          state.products.find(
            (x) => x.id === id
          );

        return s + (
          p
            ? p.price * q
            : 0
        );

      }, 0);

  // Promo database

  const PROMOS = {

    FRESH20: {

      minOrder: 500,

      discountPercent: 20,

      maxDiscount: 150,

      message:
        "🎉 20% OFF Applied"

    },

    SAVE100: {

      minOrder: 999,

      flatDiscount: 100,

      message:
        "🔥 ₹100 OFF Applied"

    },

    VEG30: {

      minOrder: 399,

      discountPercent: 30,

      maxDiscount: 120,

      category: "Vegetables",

      message:
        "🥦 Vegetable Discount Applied"

    }

  };

  // Invalid code

  if (!PROMOS[code]) {

    showToast(
      "❌ Invalid promo code",
      "error"
    );

    return;
  }

  const promo =
    PROMOS[code];

  // Minimum order

  if (
    subtotal <
    promo.minOrder
  ) {

    showToast(

      `❌ Minimum order ₹${promo.minOrder} required`,

      "error"

    );

    return;
  }

  // Save promo

  state.activePromo = {

    code,

    ...promo

  };

  showToast(
    promo.message
  );

  // Refresh page

  if (
    typeof window._renderCartPage ===
    "function"
  ) {

    window._renderCartPage();

  }

}