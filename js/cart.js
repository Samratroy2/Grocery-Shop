// ─────────────────────────────────────────
// cart.js  —  Cart state, drawer & page
// ─────────────────────────────────────────

import { db, doc, updateDoc } from "./firebase.js";
import { state } from "./state.js";
import { showToast, showPage, closeDrawer } from "./ui.js";

// ── Mutate cart ──────────────────────────

export function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  refreshCartUI();
  const p = state.products.find((x) => x.id === id);
  showToast(`${p?.emoji || "✅"} ${p?.name || ""} added!`);
  if (state.currentUser) saveCart();
}

export function changeQty(id, delta) {
  state.cart[id] = (state.cart[id] || 0) + delta;
  if (state.cart[id] <= 0) delete state.cart[id];
  refreshCartUI();
  if (state.currentUser) saveCart();
}

// ── Persist to Firestore ─────────────────

export async function saveCart() {
  try {
    await updateDoc(doc(db, "users", state.currentUser.uid), { cart: state.cart });
  } catch (e) {
    console.error("saveCart error:", e);
  }
}

// ── Refresh all cart-related UI ──────────

export function refreshCartUI() {
  const count = Object.values(state.cart).reduce((s, v) => s + v, 0);
  const total = Object.entries(state.cart).reduce((s, [id, q]) => {
    const p = state.products.find((x) => x.id === id);
    return s + (p ? p.price * q : 0);
  }, 0);

  document.getElementById("cart-badge").textContent = count;
  document.getElementById("drawer-total-val").textContent = `₹${total}`;

  renderDrawer();

  // Re-render product grids if visible
  const { renderProductGrid } = window._freshmart;
  const hp = document.getElementById("home-grid");
  if (hp && hp.innerHTML.includes("prod-body"))
    renderProductGrid("home-grid", state.products.slice(0, 8));
  const pp = document.getElementById("products-grid");
  if (pp && pp.innerHTML.includes("prod-body"))
    renderProductGrid("products-grid", state.products);
}

// ── Drawer ───────────────────────────────

export function renderDrawer() {
  const body    = document.getElementById("drawer-body");
  const entries = Object.entries(state.cart);

  if (!entries.length) {
    body.innerHTML = `
      <div style="text-align:center;padding:50px 20px;color:var(--muted)">
        <div style="font-size:50px;margin-bottom:14px">🛒</div>
        <p>Cart is empty</p>
      </div>`;
    return;
  }

  body.innerHTML = entries
    .map(([id, qty]) => {
      const p = state.products.find((x) => x.id === id);
      if (!p) return "";
      return `
        <div class="cart-item-row">
          <div class="cart-item-img">${p.emoji}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-unit">${p.unit}</div>
            <div class="cart-item-price">₹${p.price * qty}</div>
          </div>
          <div class="qty-ctrl" style="flex-direction:column;gap:4px">
            <div class="qty-ctrl">
              <button class="qty-btn" style="width:24px;height:24px;font-size:14px" onclick="window._changeQty('${id}',-1)">−</button>
              <span class="qty-num">${qty}</span>
              <button class="qty-btn" style="width:24px;height:24px;font-size:14px" onclick="window._changeQty('${id}',1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="window._changeQty('${id}',-99)">🗑️</button>
          </div>
        </div>`;
    })
    .join("");
}

// ── Full cart page ───────────────────────

export function renderCartPage() {
  const panel   = document.getElementById("cart-items-panel");
  const entries = Object.entries(state.cart);

  if (!entries.length) {
    panel.innerHTML = `
      <div class="cart-empty-msg">
        <div class="big">🛒</div>
        <p>Your cart is empty</p>
      </div>`;
    document.getElementById("savings-pill").style.display = "none";
    return;
  }

  const totalCount = Object.values(state.cart).reduce((s, v) => s + v, 0);
  panel.innerHTML =
    `<h3 style="font-size:16px;font-weight:600;margin-bottom:16px">${totalCount} items</h3>` +
    entries
      .map(([id, qty]) => {
        const p = state.products.find((x) => x.id === id);
        if (!p) return "";
        return `
          <div class="cart-item-row">
            <div class="cart-item-img">${p.emoji}</div>
            <div class="cart-item-info">
              <div class="cart-item-name">${p.name} <span style="color:var(--muted);font-size:12px">${p.unit}</span></div>
              <div class="cart-item-price">₹${p.price} × ${qty} = ₹${p.price * qty}</div>
              <div class="qty-ctrl" style="margin-top:8px">
                <button class="qty-btn" onclick="window._changeQty('${id}',-1);window._renderCartPage()">−</button>
                <span class="qty-num">${qty}</span>
                <button class="qty-btn" onclick="window._changeQty('${id}',1);window._renderCartPage()">+</button>
                <button class="cart-item-remove" onclick="window._changeQty('${id}',-99);window._renderCartPage()">🗑️ Remove</button>
              </div>
            </div>
          </div>`;
      })
      .join("");

  // Summary calc
  const total    = entries.reduce((s, [id, q]) => { const p = state.products.find((x) => x.id === id); return s + (p ? p.price * q : 0); }, 0);
  const mrp      = entries.reduce((s, [id, q]) => { const p = state.products.find((x) => x.id === id); return s + (p ? p.mrp * q : 0); }, 0);
  const disc     = mrp - total;
  const delivery = total >= 499 ? 0 : 40;
  const promoDisc = state.promoApplied ? Math.round(total * 0.2) : 0;
  const finalTotal = total + delivery - promoDisc;

  document.getElementById("sum-mrp").textContent   = `₹${mrp}`;
  document.getElementById("sum-disc").textContent  = `-₹${disc + promoDisc}`;
  document.getElementById("sum-del").textContent   = delivery === 0 ? "FREE 🎉" : `₹${delivery}`;
  document.getElementById("sum-total").textContent = `₹${finalTotal}`;

  if (disc > 0) {
    const sp = document.getElementById("savings-pill");
    sp.style.display = "block";
    sp.textContent   = `🎉 You save ₹${disc}${state.promoApplied ? " + promo" : ""} on this order!`;
  }
}

// ── Promo code ───────────────────────────

export function applyPromo() {
  const v = document.getElementById("promo-input").value.toUpperCase();
  if (v === "FRESH20") {
    state.promoApplied = true;
    showToast("🎉 Promo applied! 20% extra off");
    renderCartPage();
  } else {
    showToast("❌ Invalid promo code", "error");
  }
}
