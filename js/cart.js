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

  if (!product) {

    showToast(
      "Product not found",
      "error"
    );

    return;
  }

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

  state.cart[id] =
    (state.cart[id] || 0) + 1;

  if (product.stock !== undefined) {

    product.stock -= 1;

  }

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
    `${product.name} added to cart`
  );

  if (state.currentUser) {

    saveCart();

  }

}

// ─────────────────────────────────────────
// Change Quantity
// ─────────────────────────────────────────

export async function changeQty(id, delta) {

  const product = state.products.find(
    (x) => x.id === id
  );

  if (!product) return;

  const current =
    state.cart[id] || 0;

  if (delta > 0) {

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

    state.cart[id] =
      current + delta;

    if (product.stock !== undefined) {

      product.stock -= delta;

    }

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

  else {

    const removeQty =
      Math.abs(delta);

    if (product.stock !== undefined) {

      product.stock += removeQty;

    }

    state.cart[id] =
      current - removeQty;

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

    if (state.cart[id] <= 0) {

      delete state.cart[id];

    }

  }

  refreshCartUI();

  if (state.currentUser) {

    saveCart();

  }

}

// ─────────────────────────────────────────
// Save Cart
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

  const badge =
    document.getElementById(
      "cart-badge"
    );

  if (badge) {

    badge.textContent = count;

  }

  const drawerTotal =
    document.getElementById(
      "drawer-total-val"
    );

  if (drawerTotal) {

    drawerTotal.textContent =
      `₹${total.toFixed(2)}`;

  }

  renderDrawer();

  const {
    renderProductGrid
  } = window._freshmart || {};

  if (!renderProductGrid) return;

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

  const pp =
    document.getElementById(
      "products-grid"
    );

  if (
    pp &&
    pp.innerHTML.includes("prod-body")
  ) {

    

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
              ₹${(p.price * qty).toFixed(2)}
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

  // ───────────────── Totals ─────────────────

  const total = entries.reduce(

    (sum, [id, qty]) => {

      const p = state.products.find(
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

  const mrpTotal = entries.reduce(

    (sum, [id, qty]) => {

      const p = state.products.find(
        (x) => x.id === id
      );

      return sum + (

        p
          ? (p.mrp || p.price) * qty
          : 0

      );

    },

    0

  );

  const delivery =
    total >= 499
      ? 0
      : 40;

  const productDiscount =
    mrpTotal - total;

  let promoDiscount = 0;

  if (state.activePromo) {

    const promo =
      state.activePromo;

    let eligibleTotal = total;

    if (promo.category) {

      eligibleTotal = entries.reduce(

        (sum, [id, qty]) => {

          const p = state.products.find(
            (x) => x.id === id
          );

          if (
            p &&
            p.category &&
            p.category.toLowerCase() ===
            promo.category.toLowerCase()
          ) {

            return sum + (
              p.price * qty
            );

          }

          return sum;

        },

        0

      );

    }

    if (promo.discountPercent) {

      promoDiscount = Math.min(

        (
          eligibleTotal *
          promo.discountPercent
        ) / 100,

        promo.maxDiscount || Infinity

      );

    }

    if (promo.flatDiscount) {

      promoDiscount =
        promo.flatDiscount;

    }

  }

  const deliveryDiscount =
    delivery === 0
      ? 40
      : 0;

  const totalSavings =

    productDiscount +
    promoDiscount +
    deliveryDiscount;

  const finalTotal =

    total +
    delivery -
    promoDiscount;

  // ───────────────── Update UI ─────────────────

  const mrpEl =
    document.getElementById(
      "sum-mrp"
    );

  if (mrpEl) {

    mrpEl.textContent =
      `₹${mrpTotal.toFixed(2)}`;

  }

  const discEl =
    document.getElementById(
      "sum-disc"
    );

  if (discEl) {

    discEl.textContent =
      `-₹${totalSavings.toFixed(2)}`;

  }

  const detailsEl =
    document.getElementById(
      "discount-details"
    );

  if (detailsEl) {

    let detailsHTML = `

      Product Discount:
      ₹${productDiscount.toFixed(2)}

    `;

    if (promoDiscount > 0) {

      detailsHTML += `

        <br/><br/>

        Promo Discount:
        ₹${promoDiscount.toFixed(2)}

      `;

    }

    if (deliveryDiscount > 0) {

      detailsHTML += `

        <br/><br/>

        Free Delivery Saving:
        ₹${deliveryDiscount.toFixed(2)}

      `;

    }

    detailsHTML += `

      <br/><br/>

      Total Savings:
      ₹${totalSavings.toFixed(2)}

    `;

    detailsEl.innerHTML =
      detailsHTML;

  }

  // ───────────────── Coupon UI ─────────────────

const promoBox =
  document.getElementById(
    "applied-promo-box"
  );

const applyBtn =
  document.getElementById(
    "apply-promo-btn"
  );

if (promoBox && applyBtn) {

  if (state.activePromo) {

    // Hide apply button

    applyBtn.style.display =
      "none";

    promoBox.innerHTML = `

      <div class="applied-promo">

        <div>

          <div class="promo-title">
            Coupon Applied
          </div>

          <div class="promo-code">
            ${state.activePromo.code}
          </div>

        </div>

        <button
          class="remove-promo-btn"
          onclick="removePromo()"
        >
          Remove
        </button>

      </div>

    `;

  }

  else {

    // Show apply button again

    applyBtn.style.display =
      "block";

    promoBox.innerHTML = "";

  }

}





  const delEl =
    document.getElementById(
      "sum-del"
    );

  if (delEl) {

    delEl.textContent =

      delivery === 0
        ? "FREE"
        : `₹${delivery.toFixed(2)}`;

  }

  const totalEl =
    document.getElementById(
      "sum-total"
    );

  if (totalEl) {

    totalEl.textContent =
      `₹${finalTotal.toFixed(2)}`;

  }

}

// ─────────────────────────────────────────
// Render Drawer
// ─────────────────────────────────────────

export function renderDrawer() {

  const body =
    document.getElementById(
      "drawer-body"
    );

  if (!body) return;

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
              ₹${(p.price * qty).toFixed(2)}
            </div>

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

    FRESH10: {

      minOrder: 500,
      discountPercent: 10,
      maxDiscount: 150,
      category: "Fresh Food",

      message:
        "🎉 10% OFF Applied"

    },

    SAVE50: {

      minOrder: 999,
      flatDiscount: 50,

      message:
        "🔥 ₹50 OFF Applied"

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

  // Category validation

  if (promo.category) {

    const cartEntries =
      Object.entries(state.cart);

    const hasCategoryProduct =
      cartEntries.some(
        ([id]) => {

          const p =
            state.products.find(
              (x) => x.id === id
            );

          return (
            p &&
            p.category &&
            p.category.toLowerCase() ===
            promo.category.toLowerCase()
          );

        }
      );

    if (!hasCategoryProduct) {

      showToast(
        `❌ Promo valid only for ${promo.category}`,
        "error"
      );

      return;

    }

  }

  // Minimum order validation

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

  // Refresh cart page

  if (
    typeof window._renderCartPage ===
    "function"
  ) {

    window._renderCartPage();

  }

}

// ─────────────────────────────────────────
// Remove Promo
// ─────────────────────────────────────────

export function removePromo() {

  // Remove active promo

  state.activePromo = null;

  // Clear input

  const input =
    document.getElementById(
      "promo-input"
    );

  if (input) {

    input.value = "";

  }



  // Remove promo UI

  const appliedBox =
    document.getElementById(
      "applied-promo-box"
    );

  if (appliedBox) {

    appliedBox.innerHTML = "";

  }

  showToast(
    "Coupon removed"
  );

  // Refresh totals

  if (
    typeof window._renderCartPage ===
    "function"
  ) {

    window._renderCartPage();

  }

}

// ─────────────────────────────────────────
// Global Functions
// ─────────────────────────────────────────

window.applyPromo =
  applyPromo;

window.removePromo =
  removePromo;