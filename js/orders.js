// ─────────────────────────────────────────
// orders.js  —  Place & display orders
// ─────────────────────────────────────────

import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "./firebase.js";

import { state } from "./state.js";

import {
  showToast,
  showPage
} from "./ui.js";

import {
  refreshCartUI,
  saveCart
} from "./cart.js";

// ─────────────────────────────────────────
// Place Order
// ─────────────────────────────────────────

export async function placeOrder() {

  // Login required

  if (!state.currentUser) {

    window._openAuth();

    showToast(
      "Please login to order",
      "error"
    );

    return;
  }

  // Empty cart

  const entries =
    Object.entries(state.cart);

  if (!entries.length) {

    showToast(
      "Cart is empty",
      "error"
    );

    return;
  }

  // Build items

  const items = entries.map(([id, qty]) => {

    const p =
      state.products.find(
        (x) => x.id === id
      );

    return {

      productId: id,

      name: p.name,

      image:
        p.image ||
        "https://via.placeholder.com/80",

      qty,

      price: p.price,

      buyPrice:
        p.buyPrice || 0,

      profit:
        (p.price - (p.buyPrice || 0)) * qty

    };

  });

  // ───────────────────────────────────────
  // Totals
  // ───────────────────────────────────────

  const subtotal =
    items.reduce(
      (s, i) =>
        s + i.price * i.qty,
      0
    );

  const delivery =
    subtotal >= 499
      ? 0
      : 40;

  // Promo discount

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
          subtotal *
          (promo.discountPercent / 100)
        );

    }

    // Max cap

    if (
      promo.maxDiscount &&
      promoDisc > promo.maxDiscount
    ) {

      promoDisc =
        promo.maxDiscount;

    }
  }

  // Final total

  const totalAmount =
    subtotal +
    delivery -
    promoDisc;

  // Profit

  const totalProfit =
    items.reduce(
      (sum, item) =>
        sum + item.profit,
      0
    );

  // ───────────────────────────────────────
  // Save order
  // ───────────────────────────────────────

  try {

    await addDoc(

      collection(db, "orders"),

      {

        uid:
          state.currentUser.uid,

        email:
          state.currentUser.email,

        items,

        subtotal,

        delivery,

        promoCode:
          state.activePromo?.code || "",

        promoDiscount:
          promoDisc,

        totalAmount,

        profit:
          totalProfit,

        paymentMethod:
          "Cash on Delivery",

        paymentStatus:
          "Pending",

        deliveryStatus:
          "Confirmed",

        createdAt:
          serverTimestamp(),

      }

    );

    // Clear cart

    state.cart = {};

    state.activePromo = null;

    refreshCartUI();

    // Go orders page

    showPage("orders-page");

    await loadOrders();

    showToast(
      "🎉 Order placed successfully!"
    );

    // Save empty cart

    if (state.currentUser) {

      saveCart();

    }

  } catch (e) {

    console.error(e);

    showToast(
      "Failed to place order",
      "error"
    );

  }

}

// ─────────────────────────────────────────
// Load Orders
// ─────────────────────────────────────────

export async function loadOrders() {

  const list =
    document.getElementById(
      "orders-list"
    );

  // Login required

  if (!state.currentUser) {

    list.innerHTML = `

      <div style="
        text-align:center;
        padding:40px;
        color:var(--muted)
      ">

        Please login to view orders 👤

      </div>

    `;

    return;
  }

  // Loader

  list.innerHTML = `
    <div class="loader">⏳</div>
  `;

  try {

    // Query orders

    const q = query(

      collection(db, "orders"),

      where(
        "uid",
        "==",
        state.currentUser.uid
      )

    );

    const snap =
      await getDocs(q);

    // Local sorting

    const docs =
      snap.docs.sort((a, b) => {

        const ta =
          a.data().createdAt?.seconds || 0;

        const tb =
          b.data().createdAt?.seconds || 0;

        return tb - ta;

      });

    // No orders

    if (!docs.length) {

      list.innerHTML = `

        <div style="
          text-align:center;
          padding:60px;
          color:var(--muted)
        ">

          <div style="
            font-size:50px;
            margin-bottom:16px
          ">
            📦
          </div>

          <p>No orders yet</p>

        </div>

      `;

      return;
    }

    // Render orders

    list.innerHTML =
      docs.map((d) => {

        const o = {

          id: d.id,

          ...d.data()

        };

        // Date

        const date =
          o.createdAt
            ?.toDate?.()
            ?.toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric"
              }
            ) || "—";

        // Status styles

        const statusClass = {

          Delivered:
            "status-delivered",

          Confirmed:
            "status-confirmed",

          Pending:
            "status-pending",

          "Out for Delivery":
            "status-confirmed",

          Cancelled:
            "status-pending"

        }[
          o.deliveryStatus
        ] || "status-pending";

        // Payment styles

        const paymentClass = {

          Paid:
            "status-delivered",

          Pending:
            "status-pending",

          Failed:
            "status-pending"

        }[
          o.paymentStatus
        ] || "status-pending";

        return `

          <div class="order-card">

            <!-- Header -->

            <div class="order-header">

              <div>

                <div class="order-id">

                  Order #${o.id
                    .slice(-8)
                    .toUpperCase()}

                </div>

                <div class="order-date">

                  ${date}

                </div>

              </div>

              <span class="
                order-status
                ${statusClass}
              ">

                ${o.deliveryStatus}

              </span>

            </div>

            <!-- Products -->

            <div class="order-items-list">

              ${(o.items || [])
                .map((i) => `

                  <span class="
                    order-item-chip
                  ">

                    <img
                      src="${i.image}"
                      style="
                        width:24px;
                        height:24px;
                        object-fit:cover;
                        border-radius:50%;
                        vertical-align:middle;
                        margin-right:6px;
                      "
                    />

                    ${i.name}
                    ×${i.qty}

                  </span>

                `)
                .join("")}

            </div>

            <!-- Footer -->

            <div class="order-footer">

              <span style="
                font-size:13px;
                color:var(--muted)
              ">

                ${(o.items || []).length}
                item(s)

              </span>

              <span class="order-total">

                ₹${o.totalAmount}

              </span>

            </div>

            <!-- Summary -->

            <div style="
              margin-top:12px;
              font-size:13px;
              line-height:1.8;
              color:#555;
            ">

              🧾 Subtotal:
              ₹${o.subtotal || o.totalAmount}

              <br/>

              🚚 Delivery:
              ${
                o.delivery === 0
                  ? "FREE 🎉"
                  : `₹${o.delivery || 40}`
              }

              <br/>

              🎁 Promo:
              ${
                o.promoCode
                  ? `${o.promoCode} (-₹${o.promoDiscount || 0})`
                  : "No Promo"
              }

            </div>

            <!-- Payment -->

            <div style="
              margin-top:12px;
              display:flex;
              align-items:center;
              gap:10px;
              flex-wrap:wrap;
            ">

              <span style="
                font-size:13px;
                color:#666;
              ">

                💵
                ${o.paymentMethod || "COD"}

              </span>

              <span class="
                status-chip
                ${paymentClass}
              ">

                ${o.paymentStatus}

              </span>

            </div>

          </div>

        `;

      }).join("");

  } catch (e) {

    console.error(e);

    list.innerHTML = `

      <div style="
        text-align:center;
        padding:40px;
        color:red;
      ">

        Failed to load orders

      </div>

    `;

  }

}