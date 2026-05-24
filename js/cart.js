// ─────────────────────────────────────────
// cart.js  —  Cart state, drawer & page
// ─────────────────────────────────────────

import { db, doc, updateDoc } from "./firebase.js";
import { state } from "./state.js";
import { showToast } from "./ui.js";

// ─────────────────────────────────────────
// Add to cart
// ─────────────────────────────────────────

export function addToCart(id) {

  state.cart[id] =
    (state.cart[id] || 0) + 1;

  refreshCartUI();

  const p = state.products.find(
    (x) => x.id === id
  );

  showToast(
    `🛒 ${p?.name || "Item"} added`
  );

  if (state.currentUser) {
    saveCart();
  }
}

// ─────────────────────────────────────────
// Change quantity
// ─────────────────────────────────────────

export function changeQty(id, delta) {

  state.cart[id] =
    (state.cart[id] || 0) + delta;

  if (state.cart[id] <= 0) {
    delete state.cart[id];
  }

  refreshCartUI();

  if (state.currentUser) {
    saveCart();
  }
}

// ─────────────────────────────────────────
// Save cart
// ─────────────────────────────────────────

export async function saveCart() {

  try {

    await updateDoc(
      doc(db, "users", state.currentUser.uid),
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
// Refresh UI
// ─────────────────────────────────────────

export function refreshCartUI() {

  const count = Object.values(state.cart)
    .reduce((s, v) => s + v, 0);

  const total = Object.entries(state.cart)
    .reduce((s, [id, q]) => {

      const p = state.products.find(
        (x) => x.id === id
      );

      return s + (
        p
          ? p.price * q
          : 0
      );

    }, 0);

  document.getElementById(
    "cart-badge"
  ).textContent = count;

  document.getElementById(
    "drawer-total-val"
  ).textContent = `₹${total}`;

  renderDrawer();

  // Re-render grids

  const {
    renderProductGrid
  } = window._freshmart;

  const hp =
    document.getElementById("home-grid");

  if (
    hp &&
    hp.innerHTML.includes("prod-body")
  ) {

    renderProductGrid(
      "home-grid",
      state.products.slice(0, 8)
    );

  }

  const pp =
    document.getElementById("products-grid");

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
// Drawer
// ─────────────────────────────────────────

export function renderDrawer() {

  const body =
    document.getElementById("drawer-body");

  const entries =
    Object.entries(state.cart);

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

  body.innerHTML = entries.map(([id, qty]) => {

    const p = state.products.find(
      (x) => x.id === id
    );

    if (!p) return "";

    return `

      <div class="cart-item-row">

        <div class="cart-item-img">

          <img
            src="${p.image}"
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
            ${p.unit}
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
              style="
                width:24px;
                height:24px;
                font-size:14px
              "
              onclick="window._changeQty('${id}',-1)"
            >
              −
            </button>

            <span class="qty-num">
              ${qty}
            </span>

            <button
              class="qty-btn"
              style="
                width:24px;
                height:24px;
                font-size:14px
              "
              onclick="window._changeQty('${id}',1)"
            >
              +
            </button>

          </div>

          <button
            class="cart-item-remove"
            onclick="window._changeQty('${id}',-99)"
          >
            🗑️
          </button>

        </div>

      </div>

    `;

  }).join("");
}

// ─────────────────────────────────────────
// Render Cart Page
// ─────────────────────────────────────────

export function renderCartPage() {

  const panel =
    document.getElementById(
      "cart-items-panel"
    );

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

    document.getElementById(
      "savings-pill"
    ).style.display = "none";

    return;
  }

  // Item count

  const totalCount =
    Object.values(state.cart)
      .reduce((s, v) => s + v, 0);

  // Render items

  panel.innerHTML =

    `<h3 style="
      font-size:16px;
      font-weight:600;
      margin-bottom:16px
    ">
      ${totalCount} items
    </h3>`

    +

    entries.map(([id, qty]) => {

      const p = state.products.find(
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
              alt="${p.name}"
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

              <span style="
                color:var(--muted);
                font-size:12px
              ">
                ${p.unit}
              </span>

            </div>

            <div class="cart-item-price">

              ₹${p.price}
              ×
              ${qty}
              =
              ₹${p.price * qty}

            </div>

            <div
              class="qty-ctrl"
              style="margin-top:8px"
            >

              <button
                class="qty-btn"
                onclick="
                  window._changeQty('${id}',-1);
                  window._renderCartPage()
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
                  window._changeQty('${id}',1);
                  window._renderCartPage()
                "
              >
                +
              </button>

              <button
                class="cart-item-remove"
                onclick="
                  window._changeQty('${id}',-99);
                  window._renderCartPage()
                "
              >
                🗑️ Remove
              </button>

            </div>

          </div>

        </div>

      `;

    }).join("");

  // ───────────────────────────────────────
  // Summary calculations
  // ───────────────────────────────────────

  const total = entries.reduce(

    (s, [id, q]) => {

      const p = state.products.find(
        (x) => x.id === id
      );

      return s + (
        p
          ? p.price * q
          : 0
      );

    },

    0

  );

  const mrp = entries.reduce(

    (s, [id, q]) => {

      const p = state.products.find(
        (x) => x.id === id
      );

      return s + (
        p
          ? p.mrp * q
          : 0
      );

    },

    0

  );

  const disc = mrp - total;

  const delivery =
    total >= 499 ? 0 : 40;

  // ───────────────────────────────────────
  // Promo Calculation
  // ───────────────────────────────────────

  let promoDisc = 0;

  if (state.activePromo) {

    const promo =
      state.activePromo;

    // Category promo

    if (promo.category) {

      const categoryTotal =
        entries.reduce(

          (sum, [id, q]) => {

            const p =
              state.products.find(
                (x) => x.id === id
              );

            if (
              p &&
              p.category === promo.category
            ) {

              return (
                sum +
                (p.price * q)
              );

            }

            return sum;

          },

          0

        );

      promoDisc =
        Math.round(

          categoryTotal *
          (promo.discountPercent / 100)

        );

    }

    // Flat discount

    else if (promo.flatDiscount) {

      promoDisc =
        promo.flatDiscount;

    }

    // Percentage discount

    else if (promo.discountPercent) {

      promoDisc =
        Math.round(

          total *
          (promo.discountPercent / 100)

        );

    }

    // Max discount cap

    if (
      promo.maxDiscount &&
      promoDisc > promo.maxDiscount
    ) {

      promoDisc =
        promo.maxDiscount;

    }
  }

  // Final total

  const finalTotal =
    total +
    delivery -
    promoDisc;

  // Update UI

  document.getElementById(
    "sum-mrp"
  ).textContent = `₹${mrp}`;

  document.getElementById(
    "sum-disc"
  ).textContent =
    `-₹${disc + promoDisc}`;

  document.getElementById(
    "sum-del"
  ).textContent =
    delivery === 0
      ? "FREE 🎉"
      : `₹${delivery}`;

  document.getElementById(
    "sum-total"
  ).textContent =
    `₹${finalTotal}`;

  // Savings

  if (disc > 0 || promoDisc > 0) {

    const sp =
      document.getElementById(
        "savings-pill"
      );

    sp.style.display = "block";

    sp.textContent =

      `🎉 You save ₹${
        disc + promoDisc
      }${
        state.activePromo
          ? ` using ${state.activePromo.code}`
          : ""
      }`;

  }

  // ───────────────────────────────────────
  // Payment section
  // ───────────────────────────────────────

  const paymentBox =
    document.getElementById(
      "payment-methods"
    );

  if (paymentBox) {

    paymentBox.innerHTML = `

      <div style="
        border:1px solid #16a34a;
        background:#f0fdf4;
        padding:14px;
        border-radius:12px;
        margin-top:16px;
      ">

        <div style="
          font-size:16px;
          font-weight:700;
          color:#166534;
          margin-bottom:10px;
        ">

          💵 Payment Method

        </div>

        <label style="
          display:flex;
          align-items:center;
          gap:10px;
          font-size:15px;
          font-weight:600;
        ">

          <input
            type="radio"
            checked
            disabled
          />

          Cash on Delivery (COD)

        </label>

        <div style="
          margin-top:14px;
          padding-top:12px;
          border-top:1px dashed #ccc;
          color:#666;
          font-size:14px;
          line-height:1.6;
        ">

          🟡 UPI Payments — Coming Soon<br/>
          🟡 Credit / Debit Cards — Coming Soon<br/>
          🟡 Wallet Payments — Coming Soon

        </div>

      </div>

    `;
  }
}

// ─────────────────────────────────────────
// Apply Promo
// ─────────────────────────────────────────

export function applyPromo() {

  const code = document
    .getElementById("promo-input")
    .value
    .toUpperCase()
    .trim();

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

  // Save active promo

  state.activePromo = {

    code,

    ...promo

  };

  showToast(
    promo.message
  );

  renderCartPage();
}