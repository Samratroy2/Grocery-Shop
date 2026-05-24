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

  document
    .querySelectorAll(".admin-nav-btn")
    .forEach((b) => b.classList.remove("active"));

  const main = document.getElementById("admin-main");

  // ───────────────── Dashboard ─────────────────

  if (sec === "dashboard") {

    const [prodSnap, orderSnap, userSnap] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "orders")),
      getDocs(collection(db, "users")),
    ]);

    const totalRev = orderSnap.docs.reduce(
      (s, d) => s + (d.data().totalAmount || 0),
      0
    );

    const totalProfit = orderSnap.docs.reduce(
      (s, d) => s + (d.data().profit || 0),
      0
    );

    main.innerHTML = `
      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">
        📊 Dashboard Overview
      </h2>

      <div class="admin-cards">

        <div class="admin-card">
          <div class="label">Total Revenue</div>
          <div class="value">
            ₹${totalRev.toLocaleString("en-IN")}
          </div>
          <div class="trend">↑ All time</div>
        </div>

        <div class="admin-card">
          <div class="label">Orders</div>
          <div class="value">${orderSnap.size}</div>
          <div class="trend">Total orders</div>
        </div>

        <div class="admin-card">
          <div class="label">Products</div>
          <div class="value">${prodSnap.size}</div>
          <div class="trend">In catalog</div>
        </div>

        <div class="admin-card">
          <div class="label">Customers</div>
          <div class="value">${userSnap.size}</div>
          <div class="trend">Registered</div>
        </div>

        <div class="admin-card">
          <div class="label">Total Profit</div>
          <div class="value">
            ₹${totalProfit.toLocaleString("en-IN")}
          </div>
          <div class="trend">Net earnings</div>
        </div>

      </div>

      <div class="admin-table">

        <h3>Recent Orders</h3>

        <table>

          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>

          ${orderSnap.docs.slice(0, 10).map((d) => {

            const o = d.data();

            return `
              <tr>
                <td>#${d.id.slice(-8).toUpperCase()}</td>
                <td>${o.email || "—"}</td>
                <td>₹${o.totalAmount}</td>

                <td>
                  <span class="status-chip status-confirmed">
                    ${o.deliveryStatus}
                  </span>
                </td>
              </tr>
            `;
          }).join("")}

        </table>

      </div>
    `;

  }

  // ───────────────── Add Product ─────────────────

  else if (sec === "add-product") {

    main.innerHTML = `

      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">
        ➕ Add Product
      </h2>

      <div class="admin-table">

        <div class="product-form-grid">

          <div class="form-group">
            <label class="form-label">Product Name</label>
            <input class="form-input" id="ap-name" placeholder="e.g. Fresh Spinach"/>
          </div>

          <div class="form-group">
            <label class="form-label">Category</label>

            <select class="form-input" id="ap-cat">
              <option>Vegetables</option>
              <option>Fruits</option>
              <option>Dairy</option>
              <option>Grains</option>
              <option>Bakery</option>
              <option>Snacks</option>
              <option>Beverages</option>
              <option>Spices</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Selling Price (₹)</label>
            <input class="form-input" id="ap-price" type="number"/>
          </div>

          <div class="form-group">
            <label class="form-label">Buy Price (₹)</label>
            <input class="form-input" id="ap-buy-price" type="number"/>
          </div>

          <div class="form-group">
            <label class="form-label">MRP (₹)</label>
            <input class="form-input" id="ap-mrp" type="number"/>
          </div>

          <div class="form-group">
            <label class="form-label">Unit</label>
            <input class="form-input" id="ap-unit" placeholder="e.g. 1kg, 500g"/>
          </div>

          <div class="form-group">
            <label class="form-label">Product Image URL</label>
            <input
              class="form-input"
              id="ap-image"
              placeholder="https://example.com/image.png"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Stock</label>
            <input class="form-input" id="ap-stock" type="number" value="100"/>
          </div>

          <div class="form-group">
            <label class="form-label">Badge</label>
            <input class="form-input" id="ap-badge" placeholder="Fresh / Offer"/>
          </div>

        </div>

        <button
          class="save-btn"
          style="margin-top:8px"
          onclick="window._adminAddProduct()"
        >
          Add Product
        </button>

      </div>
    `;
  }

  // ───────────────── Manage Products ─────────────────

  else if (sec === "manage-products") {

    const snap = await getDocs(collection(db, "products"));

    main.innerHTML = `

      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">
        📦 Manage Products
      </h2>

      <div class="admin-table">

        <table>

          <tr>
            <th></th>
            <th>Name</th>
            <th>Category</th>
            <th>Sell Price</th>
            <th>MRP</th>
            <th>Buy Price</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>

          ${snap.docs.map((d) => {

            const p = d.data();

            return `

              <tr>

                <td>
                  <img
                    src="${p.image || 'https://via.placeholder.com/50'}"
                    style="
                      width:50px;
                      height:50px;
                      object-fit:cover;
                      border-radius:10px;
                    "
                  />
                </td>

                <td>${p.name}</td>

                <td>${p.category}</td>

                <td>
                  <input
                    type="number"
                    value="${p.price}"
                    id="price-${d.id}"
                    style="width:90px"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value="${p.mrp || p.price}"
                    id="mrp-${d.id}"
                    style="width:90px"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value="${p.buyPrice || 0}"
                    id="buy-${d.id}"
                    style="width:90px"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value="${p.stock}"
                    id="stock-${d.id}"
                    style="width:80px"
                  />
                </td>

                <td style="display:flex;gap:8px">

                  <button
                    onclick="window._adminUpdateProduct('${d.id}')"
                    style="padding:6px 10px;border:none;border-radius:6px;background:#111;color:#fff;cursor:pointer"
                  >
                    Save
                  </button>

                  <button
                    onclick="window._adminDeleteProduct('${d.id}')"
                    style="padding:6px 10px;border:none;border-radius:6px;background:red;color:#fff;cursor:pointer"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            `;
          }).join("")}

        </table>

      </div>
    `;
  }

  // ───────────────── Manage Orders ─────────────────

  else if (sec === "manage-orders") {

    const snap = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc"))
    );

    main.innerHTML = `

      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">
        🛒 All Orders
      </h2>

      <div class="admin-table">

        <table>

          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Profit</th>
            <th>Payment</th>
            <th>Payment Status</th>
            <th>Status</th>
            <th>Update</th>
          </tr>

          ${snap.docs.map((d) => {

            const o = d.data();

            const sc = {
              Delivered: "status-delivered",
              Confirmed: "status-confirmed",
              Pending: "status-pending"
            }[o.deliveryStatus] || "status-pending";

            return `
              <tr>

                <td>#${d.id.slice(-8).toUpperCase()}</td>

                <td style="font-size:12px">
                  ${o.email}
                </td>

                <td>
                  ₹${o.totalAmount}
                </td>

                <td style="color:green;font-weight:600">
                  ₹${o.profit || 0}
                </td>

                <td>
  <span class="status-chip status-confirmed">
    ${o.paymentStatus}
  </span>
</td>

<td>

  <select
    onchange="
      window._adminUpdatePayment(
        '${d.id}',
        this.value
      )
    "
    style="
      font-size:12px;
      padding:4px;
      border:1px solid var(--border);
      border-radius:4px
    "
  >

    <option value="Pending"
      ${o.paymentStatus === "Pending" ? "selected" : ""}
    >
      Pending
    </option>

    <option value="Paid"
      ${o.paymentStatus === "Paid" ? "selected" : ""}
    >
      Paid
    </option>

    <option value="Failed"
      ${o.paymentStatus === "Failed" ? "selected" : ""}
    >
      Failed
    </option>

  </select>

</td>

<td>
  <span class="status-chip ${sc}">
    ${o.deliveryStatus}
  </span>
</td>

<td>

  <select
    onchange="
      window._adminUpdateOrder(
        '${d.id}',
        this.value
      )
    "
    style="
      font-size:12px;
      padding:4px;
      border:1px solid var(--border);
      border-radius:4px
    "
  >

    <option
      ${o.deliveryStatus === "Confirmed" ? "selected" : ""}
    >
      Confirmed
    </option>

    <option
      ${o.deliveryStatus === "Out for Delivery" ? "selected" : ""}
    >
      Out for Delivery
    </option>

    <option
      ${o.deliveryStatus === "Delivered" ? "selected" : ""}
    >
      Delivered
    </option>

    <option
      ${o.deliveryStatus === "Cancelled" ? "selected" : ""}
    >
      Cancelled
    </option>

  </select>

</td>
              </tr>
            `;
          }).join("")}

        </table>

      </div>
    `;
  }

  // ───────────────── Customers ─────────────────

  else if (sec === "customers") {

    const snap = await getDocs(collection(db, "users"));

    main.innerHTML = `

      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:20px">
        👥 Customers
      </h2>

      <div class="admin-table">

        <table>

          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>City</th>
            <th>Role</th>
          </tr>

          ${snap.docs.map((d) => {

            const u = d.data();

            return `
              <tr>

                <td>${u.name || "—"}</td>

                <td>${u.email}</td>

                <td>${u.city || "—"}</td>

                <td>
                  <span class="status-chip ${
                    u.role === "admin"
                      ? "status-confirmed"
                      : "status-delivered"
                  }">
                    ${u.role || "user"}
                  </span>
                </td>

              </tr>
            `;
          }).join("")}

        </table>

      </div>
    `;
  }
}

// ───────────────── Add Product ─────────────────

export async function adminAddProduct() {

  const p = {

    name: document.getElementById("ap-name").value,

    category: document.getElementById("ap-cat").value,

    price: +document.getElementById("ap-price").value,

    buyPrice: +document.getElementById("ap-buy-price").value,

    mrp: +document.getElementById("ap-mrp").value,

    unit: document.getElementById("ap-unit").value,

    image: document.getElementById("ap-image").value,

    stock: +document.getElementById("ap-stock").value,

    badge: document.getElementById("ap-badge").value,

    createdAt: serverTimestamp(),
  };

  if (!p.name || !p.price) {
    showToast("Fill required fields", "error");
    return;
  }

  await addDoc(collection(db, "products"), p);

  await fetchProducts();

  showToast("✅ Product added!");

  adminSection("manage-products");
}

// ───────────────── Update Product ─────────────────

export async function adminUpdateProduct(id) {

  const price = +document.getElementById(`price-${id}`).value;

  const mrp = +document.getElementById(`mrp-${id}`).value;

  const buyPrice = +document.getElementById(`buy-${id}`).value;

  const stock = +document.getElementById(`stock-${id}`).value;

  await updateDoc(doc(db, "products", id), {
    price,
    mrp,
    buyPrice,
    stock
  });

  await fetchProducts();

  showToast("✅ Product updated");

  adminSection("manage-products");
}

// ───────────────── Delete Product ─────────────────

export async function adminDeleteProduct(id) {

  if (!confirm("Delete this product?")) return;

  await deleteDoc(doc(db, "products", id));

  await fetchProducts();

  showToast("🗑️ Product deleted");

  adminSection("manage-products");
}

// ───────────────── Update Order ─────────────────

export async function adminUpdateOrder(id, status) {

  await updateDoc(doc(db, "orders", id), {
    deliveryStatus: status
  });

  showToast(`✅ Order updated: ${status}`);
}


// ───────────────── Update Payment ─────────────────

export async function adminUpdatePayment(id, status) {

  await updateDoc(
    doc(db, "orders", id),
    {
      paymentStatus: status
    }
  );

  showToast(
    `💵 Payment updated: ${status}`
  );

}