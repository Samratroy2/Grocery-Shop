// ─────────────────────────────────────────
// orders.js  —  Place & display orders
// ─────────────────────────────────────────

import {
  db, collection, addDoc, getDocs,
  query, where, orderBy, serverTimestamp,
} from "./firebase.js";
import { state } from "./state.js";
import { showToast, showPage } from "./ui.js";
import { refreshCartUI, saveCart } from "./cart.js";

// ── Place order ──────────────────────────

export async function placeOrder() {
  if (!state.currentUser) {
    window._openAuth();
    showToast("Please login to order", "error");
    return;
  }

  const entries = Object.entries(state.cart);
  if (!entries.length) {
    showToast("Cart is empty", "error");
    return;
  }

  const items = entries.map(([id, qty]) => {
    const p = state.products.find((x) => x.id === id);
    return { productId: id, name: p.name, emoji: p.emoji, qty, price: p.price };
  });

  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery   = subtotal >= 499 ? 0 : 40;
  const promoDisc  = state.promoApplied ? Math.round(subtotal * 0.2) : 0;
  const totalAmount = subtotal + delivery - promoDisc;

  try {
    await addDoc(collection(db, "orders"), {
      uid:            state.currentUser.uid,
      email:          state.currentUser.email,
      items,
      totalAmount,
      paymentStatus:  "Paid",
      deliveryStatus: "Confirmed",
      createdAt:      serverTimestamp(),
    });

    state.cart         = {};
    state.promoApplied = false;
    refreshCartUI();
    showPage("orders-page");
    loadOrders();
    showToast("🎉 Order placed successfully!");
    if (state.currentUser) saveCart();
  } catch (e) {
    showToast("Failed to place order", "error");
    console.error(e);
  }
}

// ── Load orders list ─────────────────────

export async function loadOrders() {
  const list = document.getElementById("orders-list");

  if (!state.currentUser) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted)">Please login to view orders 👤</div>`;
    return;
  }

  list.innerHTML = '<div class="loader">⏳</div>';

  try {
    const q    = query(collection(db, "orders"), where("uid", "==", state.currentUser.uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = `
        <div style="text-align:center;padding:60px;color:var(--muted)">
          <div style="font-size:50px;margin-bottom:16px">📦</div>
          <p>No orders yet</p>
        </div>`;
      return;
    }

    list.innerHTML = snap.docs
      .map((d) => {
        const o          = { id: d.id, ...d.data() };
        const date       = o.createdAt?.toDate?.().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || "—";
        const statusClass = { Delivered: "status-delivered", Confirmed: "status-confirmed", Pending: "status-pending" }[o.deliveryStatus] || "status-pending";

        return `
          <div class="order-card">
            <div class="order-header">
              <div>
                <div class="order-id">Order #${o.id.slice(-8).toUpperCase()}</div>
                <div class="order-date">${date}</div>
              </div>
              <span class="order-status ${statusClass}">${o.deliveryStatus}</span>
            </div>
            <div class="order-items-list">
              ${(o.items || []).map((i) => `<span class="order-item-chip">${i.emoji} ${i.name} ×${i.qty}</span>`).join("")}
            </div>
            <div class="order-footer">
              <span style="font-size:13px;color:var(--muted)">${(o.items || []).length} item(s)</span>
              <span class="order-total">₹${o.totalAmount}</span>
            </div>
          </div>`;
      })
      .join("");
  } catch (e) {
    list.innerHTML = `<p style="color:var(--muted);padding:20px">Error loading orders. Make sure Firestore index is set up.</p>`;
    console.error(e);
  }
}
