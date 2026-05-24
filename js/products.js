// ─────────────────────────────────────────
// products.js  —  Fetch, render & filter
// ─────────────────────────────────────────

import {
  db,
  collection,
  getDocs
} from "./firebase.js";

import { state } from "./state.js";

import {
  showPage,
  getCatEmoji
} from "./ui.js";

// ─────────────────────────────────────────
// Fetch products from Firestore
// ─────────────────────────────────────────

export async function fetchProducts() {

  const snap = await getDocs(
    collection(db, "products")
  );

  state.products = snap.docs.map((d) => ({

    id: d.id,

    ...d.data()

  }));
}

// ─────────────────────────────────────────
// Load all products
// ─────────────────────────────────────────

export async function loadProducts() {

  document.getElementById(
    "products-grid"
  ).innerHTML = `
    <div class="loader">⏳</div>
  `;

  await fetchProducts();

  document.getElementById(
    "products-title"
  ).textContent = "🛒 All Products";

  renderProductGrid(
    "products-grid",
    state.products
  );
}

// ─────────────────────────────────────────
// Home products
// ─────────────────────────────────────────

export async function loadHomeProducts() {

  await fetchProducts();

  renderProductGrid(
    "home-grid",
    state.products.slice(0, 12)
  );
}

// ─────────────────────────────────────────
// Filter category
// ─────────────────────────────────────────

export function filterCat(cat) {

  showPage("products-page");

  document.getElementById(
    "products-title"
  ).textContent =
    `${getCatEmoji(cat)} ${cat}`;

  const filtered = state.products.filter(

    (p) =>

      p.category &&
      p.category.toLowerCase() ===
      cat.toLowerCase()

  );

  renderProductGrid(
    "products-grid",
    filtered
  );
}

// ─────────────────────────────────────────
// Sort products
// ─────────────────────────────────────────

export function sortProducts() {

  const v = document.getElementById(
    "sort-select"
  ).value;

  let sorted = [...state.products];

  // Price low → high

  if (v === "price-asc") {

    sorted.sort(
      (a, b) => a.price - b.price
    );

  }

  // Price high → low

  if (v === "price-desc") {

    sorted.sort(
      (a, b) => b.price - a.price
    );

  }

  // Name A-Z

  if (v === "name") {

    sorted.sort(

      (a, b) =>

        a.name.localeCompare(b.name)

    );

  }

  // Stock high → low

  if (v === "stock") {

    sorted.sort(
      (a, b) => b.stock - a.stock
    );

  }

  renderProductGrid(
    "products-grid",
    sorted
  );
}

// ─────────────────────────────────────────
// Search
// ─────────────────────────────────────────

export function doSearch() {

  const q = document
    .getElementById("search-input")
    .value
    .toLowerCase()
    .trim();

  if (!q) {

    loadProducts();

    return;
  }

  showPage("products-page");

  document.getElementById(
    "products-title"
  ).textContent = `🔍 "${q}"`;

  const filtered = state.products.filter(

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
// Render product grid
// ─────────────────────────────────────────

export function renderProductGrid(
  gridId,
  prods
) {

  const grid =
    document.getElementById(gridId);

  if (!grid) return;

  // Empty state

  if (!prods.length) {

    grid.innerHTML = `

      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:60px 20px;
        color:var(--muted);
      ">

        <div style="
          font-size:55px;
          margin-bottom:12px;
        ">
          🔍
        </div>

        <h3>No products found</h3>

        <p>
          Try another category or keyword
        </p>

      </div>

    `;

    return;
  }

  // Render cards

  grid.innerHTML = prods.map((p) => {

    const inCart =
      state.cart[p.id] || 0;

    const inWish =
      state.wishlist.includes(p.id);

    const disc =
      p.mrp > p.price

        ? Math.round(
            (1 - p.price / p.mrp) * 100
          )

        : 0;

    return `

      <div class="product-card">

        <!-- Product Image -->

        <div class="prod-img">

          ${
            p.badge

              ? `

                <div class="
                  prod-badge
                  ${
                    p.badge === "Fresh"
                      ? "fresh"
                      : p.badge === "Offer"
                      ? "offer"
                      : ""
                  }
                ">

                  ${p.badge}

                </div>

              `

              : ""
          }

          <!-- Wishlist -->

          <button
            class="wishlist-icon ${
              inWish ? "liked" : ""
            }"
            onclick="
              window._toggleWish(
                event,
                '${p.id}'
              )
            "
          >

            ${
              inWish
                ? "❤️"
                : "🤍"
            }

          </button>

          <!-- Product Photo -->

          <img

            src="${
              p.image ||
              'https://via.placeholder.com/300'
            }"

            alt="${p.name}"

            loading="lazy"

            style="
              width:120px;
              height:120px;
              object-fit:cover;
              border-radius:16px;
              display:block;
              margin:auto;
            "
          />

        </div>

        <!-- Product Body -->

        <div class="prod-body">

          <!-- Category -->

          <div class="prod-category">
            ${p.category || "General"}
          </div>

          <!-- Product Name -->

          <div class="prod-name">
            ${p.name}
          </div>

          <!-- Unit -->

          <div class="prod-unit">
            ${p.unit || ""}
          </div>

          <!-- Stock -->

          <div style="
            font-size:12px;
            color:${
              p.stock > 0
                ? '#16a34a'
                : '#dc2626'
            };
            margin-top:4px;
            font-weight:600;
          ">

            ${
              p.stock > 0
                ? `In Stock (${p.stock})`
                : `Out of Stock`
            }

          </div>

          <!-- Price Row -->

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

          <!-- Buttons -->

          ${
            p.stock <= 0

              ? `

                <button
                  class="add-btn"
                  style="
                    background:#ddd;
                    cursor:not-allowed;
                  "
                  disabled
                >
                  Out of Stock
                </button>

              `

              : inCart === 0

              ? `

                <button
                  class="add-btn"
                  onclick="
                    window._addToCart(
                      '${p.id}'
                    )
                  "
                >
                  + Add to Cart
                </button>

              `

              : `

                <div class="qty-ctrl">

                  <button
                    class="qty-btn"
                    onclick="
                      window._changeQty(
                        '${p.id}',
                        -1
                      )
                    "
                  >
                    −
                  </button>

                  <span class="qty-num">
                    ${inCart}
                  </span>

                  <button
                    class="qty-btn"
                    onclick="
                      window._changeQty(
                        '${p.id}',
                        1
                      )
                    "
                  >
                    +
                  </button>

                </div>

              `
          }

        </div>

      </div>

    `;

  }).join("");
}