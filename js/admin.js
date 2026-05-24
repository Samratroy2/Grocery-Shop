// ─────────────────────────────────────────
// admin.js  —  Admin dashboard & management
// ─────────────────────────────────────────

import {
  db, collection, doc,
  getDocs, addDoc, deleteDoc, updateDoc,
  query, orderBy, serverTimestamp,
} from "./firebase.js";
import { fetchProducts } from "./products.js";
import { showToast } from "./ui.js";

export async function loadAdmin() {
  adminSection("dashboard");
}

export async function adminSection(sec) {
  document.querySelectorAll(".admin-nav-btn").forEach((b) => b.classList.remove("active"));
  const main = document.getElementById("admin-main");

  // ── Dashboard ──
  if (sec === "dashboard") {
    const [prodSnap, orderSnap, userSnap] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "orders")),
      getDocs(collection(db, "users")),
    ]);
    const totalRev = orderSnap.docs.reduce((s, d) => s + (d.data().totalAmount || 0), 0);

    main.innerHTML = `
      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">📊 Dashboard Overview</h2>
      <div class="admin-cards">
        <div class="admin-card"><div class="label">Total Revenue</div><div class="value">₹${totalRev.toLocaleString("en-IN")}</div><div class="trend">↑ All time</div></div>
        <div class="admin-card"><div class="label">Orders</div><div class="value">${orderSnap.size}</div><div class="trend">Total orders</div></div>
        <div class="admin-card"><div class="label">Products</div><div class="value">${prodSnap.size}</div><div class="trend">In catalog</div></div>
        <div class="admin-card"><div class="label">Customers</div><div class="value">${userSnap.size}</div><div class="trend">Registered</div></div>
      </div>
      <div class="admin-table">
        <h3>Recent Orders</h3>
        <table>
          <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
          ${orderSnap.docs.slice(0, 10).map((d) => {
            const o = d.data();
            return `<tr>
              <td>#${d.id.slice(-8).toUpperCase()}</td>
              <td>${o.email || "—"}</td>
              <td>₹${o.totalAmount}</td>
              <td><span class="status-chip status-confirmed">${o.deliveryStatus}</span></td>
            </tr>`;
          }).join("")}
        </table>
      </div>`;

  // ── Add Product ──
  } else if (sec === "add-product") {
    main.innerHTML = `
      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">➕ Add Product</h2>
      <div class="admin-table">
        <div class="product-form-grid">
          <div class="form-group"><label class="form-label">Product Name</label><input class="form-input" id="ap-name" placeholder="e.g. Fresh Spinach"/></div>
          <div class="form-group"><label class="form-label">Category</label>
            <select class="form-input" id="ap-cat">
              <option>Vegetables</option><option>Fruits</option><option>Dairy</option>
              <option>Grains</option><option>Bakery</option><option>Snacks</option>
              <option>Beverages</option><option>Spices</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Price (₹)</label><input class="form-input" id="ap-price" type="number"/></div>
          <div class="form-group"><label class="form-label">MRP (₹)</label><input class="form-input" id="ap-mrp" type="number"/></div>
          <div class="form-group"><label class="form-label">Unit</label><input class="form-input" id="ap-unit" placeholder="e.g. 1kg, 500g"/></div>
          <div class="form-group"><label class="form-label">Emoji</label><input class="form-input" id="ap-emoji" placeholder="🥦"/></div>
          <div class="form-group"><label class="form-label">Stock</label><input class="form-input" id="ap-stock" type="number" value="100"/></div>
          <div class="form-group"><label class="form-label">Badge</label><input class="form-input" id="ap-badge" placeholder="Fresh / Offer / (blank)"/></div>
        </div>
        <button class="save-btn" style="margin-top:8px" onclick="window._adminAddProduct()">Add Product</button>
      </div>`;

  // ── Manage Products ──
  } else if (sec === "manage-products") {
    const snap = await getDocs(collection(db, "products"));
    main.innerHTML = `
      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">📦 Manage Products</h2>
      <div class="admin-table">
        <table>
          <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr>
          ${snap.docs.map((d) => {
            const p = d.data();
            return `<tr>
              <td style="font-size:22px">${p.emoji}</td>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>₹${p.price}</td>
              <td>${p.stock}</td>
              <td><button onclick="window._adminDeleteProduct('${d.id}')" style="background:none;border:none;cursor:pointer;color:var(--red);font-size:18px">🗑️</button></td>
            </tr>`;
          }).join("")}
        </table>
      </div>`;

  // ── Manage Orders ──
  } else if (sec === "manage-orders") {
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    main.innerHTML = `
      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">🛒 All Orders</h2>
      <div class="admin-table">
        <table>
          <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Update</th></tr>
          ${snap.docs.map((d) => {
            const o       = d.data();
            const sc      = { Delivered: "status-delivered", Confirmed: "status-confirmed", Pending: "status-pending" }[o.deliveryStatus] || "status-pending";
            return `<tr>
              <td>#${d.id.slice(-8).toUpperCase()}</td>
              <td style="font-size:12px">${o.email}</td>
              <td>₹${o.totalAmount}</td>
              <td><span class="status-chip status-confirmed">${o.paymentStatus}</span></td>
              <td><span class="status-chip ${sc}">${o.deliveryStatus}</span></td>
              <td>
                <select onchange="window._adminUpdateOrder('${d.id}',this.value)"
                  style="font-size:12px;padding:4px;border:1px solid var(--border);border-radius:4px">
                  <option>Confirmed</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                </select>
              </td>
            </tr>`;
          }).join("")}
        </table>
      </div>`;

  // ── Customers ──
  } else if (sec === "customers") {
    const snap = await getDocs(collection(db, "users"));
    main.innerHTML = `
      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">👥 Customers</h2>
      <div class="admin-table">
        <table>
          <tr><th>Name</th><th>Email</th><th>City</th><th>Role</th></tr>
          ${snap.docs.map((d) => {
            const u = d.data();
            return `<tr>
              <td>${u.name || "—"}</td>
              <td>${u.email}</td>
              <td>${u.city || "—"}</td>
              <td><span class="status-chip ${u.role === "admin" ? "status-confirmed" : "status-delivered"}">${u.role || "user"}</span></td>
            </tr>`;
          }).join("")}
        </table>
      </div>`;
  }
}

// ── Add product ──────────────────────────

export async function adminAddProduct() {
  const p = {
    name:      document.getElementById("ap-name").value,
    category:  document.getElementById("ap-cat").value,
    price:    +document.getElementById("ap-price").value,
    mrp:      +document.getElementById("ap-mrp").value,
    unit:      document.getElementById("ap-unit").value,
    emoji:     document.getElementById("ap-emoji").value,
    stock:    +document.getElementById("ap-stock").value,
    badge:     document.getElementById("ap-badge").value,
    createdAt: serverTimestamp(),
  };

  if (!p.name || !p.price) { showToast("Fill required fields", "error"); return; }

  await addDoc(collection(db, "products"), p);
  await fetchProducts();
  showToast("✅ Product added!");
  adminSection("manage-products");
}

// ── Delete product ───────────────────────

export async function adminDeleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await deleteDoc(doc(db, "products", id));
  await fetchProducts();
  showToast("🗑️ Product deleted");
  adminSection("manage-products");
}

// ── Update order status ──────────────────

export async function adminUpdateOrder(id, status) {
  await updateDoc(doc(db, "orders", id), { deliveryStatus: status });
  showToast(`✅ Order updated: ${status}`);
}
