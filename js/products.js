// ─────────────────────────────────────────
// products.js
// ─────────────────────────────────────────

import {
  db,
  collection,
  getDocs
} from "./firebase.js";

import { state } from "./state.js";

import {
  showPage,
  getCatLabel
} from "./ui.js";

// ─────────────────────────────────────────
// Fetch Products
// ─────────────────────────────────────────

export async function fetchProducts() {

  const snap = await getDocs(
    collection(db, "products")
  );

  state.products = snap.docs.map(
    (d) => ({

      id: d.id,

      ...d.data()

    })
  );

}

// ─────────────────────────────────────────
// Load All Products
// ─────────────────────────────────────────

export function loadProducts() {

  showPage(
    "products-page"
  );

  // REMOVE saved category

  localStorage.removeItem(
    "activeCategory"
  );

  document.getElementById(
    "products-title"
  ).textContent =
    "All Products";

  renderProductGrid(
    "products-grid",
    state.products
  );

}

// ─────────────────────────────────────────
// Home Products
// ─────────────────────────────────────────

export function loadHomeProducts() {

  renderProductGrid(
    "home-grid",
    state.products.slice(0, 12)
  );

}

// ─────────────────────────────────────────
// Filter Category
// ─────────────────────────────────────────

export function filterCat(cat) {

  // OPEN products page

  showPage(
    "products-page"
  );

  // Set title

  document.getElementById(
    "products-title"
  ).textContent = cat;

  // Filter products

  const filtered =

    state.products.filter(
      (p) =>

        p.category &&
        p.category.toLowerCase() ===
        cat.toLowerCase()

    );

  // Render filtered

  renderProductGrid(
    "products-grid",
    filtered
  );

}

// ─────────────────────────────────────────
// Sort Products
// ─────────────────────────────────────────

export function sortProducts() {

  const v =

    document.getElementById(
      "sort-select"
    )?.value;

  // IMPORTANT

  let products = [...state.products];

  // GET ACTIVE CATEGORY

  const activeCategory =

    localStorage.getItem(
      "activeCategory"
    );

  // FILTER FIRST

  if (activeCategory) {

    products = products.filter(
      (p) =>

        p.category &&
        p.category.toLowerCase() ===
        activeCategory.toLowerCase()

    );

  }

  // SORT

  if (v === "price-asc") {

    products.sort(
      (a, b) =>
        a.price - b.price
    );

  }

  else if (
    v === "price-desc"
  ) {

    products.sort(
      (a, b) =>
        b.price - a.price
    );

  }

  else if (v === "name") {

    products.sort(
      (a, b) =>

        a.name.localeCompare(
          b.name
        )

    );

  }

  renderProductGrid(
    "products-grid",
    products
  );

}

// ─────────────────────────────────────────
// Search
// ─────────────────────────────────────────

export function doSearch() {

  const q = document
    .getElementById(
      "search-input"
    )
    ?.value
    .toLowerCase()
    .trim();

  if (!q) {

    loadProducts();

    return;

  }

  showPage(
    "products-page"
  );

  document.getElementById(
    "products-title"
  ).textContent =
    `Search: "${q}"`;

  const filtered =

    state.products.filter(

      (p) =>

        p.name
          ?.toLowerCase()
          .includes(q)

        ||

        p.category
          ?.toLowerCase()
          .includes(q)

        ||

        p.unit
          ?.toLowerCase()
          .includes(q)

    );

  renderProductGrid(
    "products-grid",
    filtered
  );

}

// ─────────────────────────────────────────
// Render Product Grid
// ─────────────────────────────────────────

export function renderProductGrid(
  gridId,
  prods
) {

  const grid =

    document.getElementById(
      gridId
    );

  if (!grid) return;

  // EMPTY

  if (!prods.length) {

    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:60px 20px;
        color:var(--muted);
      ">
        <h3>No products found</h3>
      </div>
    `;

    return;

  }

  // PRODUCTS

  grid.innerHTML = prods.map(
    (p) => {

      const inCart =
        state.cart[p.id] || 0;

      const inWish =
        state.wishlist.includes(
          p.id
        );

      const stock =
        p.stock ?? 0;

      const disc =
        p.mrp > p.price

          ? Math.round(
              (
                1 -
                p.price / p.mrp
              ) * 100
            )

          : 0;

      return `

      <div class="product-card">

        <div class="prod-img">

          ${
            p.badge

              ? `
                <div class="prod-badge">
                  ${p.badge}
                </div>
              `

              : ""
          }

          <button
            class="wishlist-icon ${
              inWish
                ? "liked"
                : ""
            }"
            onclick="window._toggleWish(event,'${p.id}')"
          >

            ${
              inWish
                ? "♥"
                : "♡"
            }

          </button>

          <img
            src="${
              p.image
            }"
            alt="${p.name}"
          />

        </div>

        <div class="prod-body">

          <div class="prod-category">
            ${getCatLabel(
              p.category
            )}
          </div>

          <div class="prod-name">
            ${p.name}
          </div>

          <div class="prod-unit">
            ${p.unit || ""}
          </div>

          <div class="prod-price-row">

            <span class="prod-price">
              ₹${p.price}
            </span>

            ${
              p.mrp > p.price

                ? `
                  <span class="prod-mrp">
                    ₹${p.mrp}
                  </span>

                  <span class="prod-off">
                    ${disc}% OFF
                  </span>
                `

                : ""
            }

          </div>

          ${
            inCart === 0

              ? `
                <button
                  class="add-btn"
                  onclick="window._addToCart('${p.id}')"
                >
                  + Add to Cart
                </button>
              `

              : `
                <div class="qty-ctrl">

                  <button
                    class="qty-btn"
                    onclick="window._changeQty('${p.id}', -1)"
                  >
                    −
                  </button>

                  <span class="qty-num">
                    ${inCart}
                  </span>

                  <button
                    class="qty-btn"
                    onclick="window._changeQty('${p.id}', 1)"
                  >
                    +
                  </button>

                </div>
              `
          }

        </div>

      </div>

      `;

    }

  ).join("");

}