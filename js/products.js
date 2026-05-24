// ─────────────────────────────────────────
// products.js  —  Fetch, render & filter
// ─────────────────────────────────────────

import { db, collection, getDocs, addDoc, serverTimestamp } from "./firebase.js";
import { SEED_PRODUCTS } from "./seed.js";
import { state } from "./state.js";
import { showPage, getCatEmoji } from "./ui.js";
import { addToCart, changeQty } from "./cart.js";
import { toggleWish } from "./wishlist.js";

// ── Seed on first run ────────────────────

export async function seedProducts() {
  const snap = await getDocs(collection(db, "products"));
  if (snap.size > 0) return;
  for (const p of SEED_PRODUCTS) {
    await addDoc(collection(db, "products"), { ...p, createdAt: serverTimestamp() });
  }
}

// ── Fetch from Firestore ─────────────────

export async function fetchProducts() {
  const snap = await getDocs(collection(db, "products"));
  state.products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Load all products page ───────────────

export async function loadProducts() {
  document.getElementById("products-grid").innerHTML = '<div class="loader">⏳</div>';
  await fetchProducts();
  document.getElementById("products-title").textContent = "🛒 All Products";
  renderProductGrid("products-grid", state.products);
}

// ── Load home page grid ──────────────────

export async function loadHomeProducts() {
  await fetchProducts();
  renderProductGrid("home-grid", state.products.slice(0, 8));
}

// ── Filter by category ───────────────────

export function filterCat(cat) {
  showPage("products-page");
  document.getElementById("products-title").textContent = `${getCatEmoji(cat)} ${cat}`;
  renderProductGrid(
    "products-grid",
    state.products.filter((p) => p.category === cat)
  );
}

// ── Sort products ────────────────────────

export function sortProducts() {
  const v = document.getElementById("sort-select").value;
  let sorted = [...state.products];
  if (v === "price-asc")  sorted.sort((a, b) => a.price - b.price);
  if (v === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (v === "name")       sorted.sort((a, b) => a.name.localeCompare(b.name));
  renderProductGrid("products-grid", sorted);
}

// ── Search ───────────────────────────────

export function doSearch() {
  const q = document.getElementById("search-input").value.toLowerCase().trim();
  if (!q) return;
  showPage("products-page");
  document.getElementById("products-title").textContent = `🔍 "${q}"`;
  renderProductGrid(
    "products-grid",
    state.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  );
}

// ── Render grid ──────────────────────────

export function renderProductGrid(gridId, prods) {
  const grid = document.getElementById(gridId);
  if (!prods.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">No products found 🔍</div>`;
    return;
  }

  grid.innerHTML = prods
    .map((p) => {
      const inCart = state.cart[p.id] || 0;
      const inWish = state.wishlist.includes(p.id);
      const disc   = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;

      return `
        <div class="product-card">
          <div class="prod-img">
            ${p.badge ? `<div class="prod-badge ${p.badge === "Fresh" ? "fresh" : p.badge === "Offer" ? "offer" : ""}">${p.badge}</div>` : ""}
            <button class="wishlist-icon ${inWish ? "liked" : ""}" onclick="window._toggleWish(event,'${p.id}')">
              ${inWish ? "❤️" : "🤍"}
            </button>
            <span>${p.emoji || "🛒"}</span>
          </div>
          <div class="prod-body">
            <div class="prod-category">${p.category}</div>
            <div class="prod-name">${p.name}</div>
            <div class="prod-unit">${p.unit}</div>
            <div class="prod-price-row">
              <span class="prod-price">₹${p.price}</span>
              ${p.mrp > p.price ? `<span class="prod-mrp">₹${p.mrp}</span><span class="prod-off">${disc}% off</span>` : ""}
            </div>
            ${
              inCart === 0
                ? `<button class="add-btn" onclick="window._addToCart('${p.id}')">+ Add to Cart</button>`
                : `<div class="qty-ctrl">
                    <button class="qty-btn" onclick="window._changeQty('${p.id}',-1)">−</button>
                    <span class="qty-num">${inCart}</span>
                    <button class="qty-btn" onclick="window._changeQty('${p.id}',1)">+</button>
                  </div>`
            }
          </div>
        </div>`;
    })
    .join("");
}
