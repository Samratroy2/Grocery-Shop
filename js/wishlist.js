// ─────────────────────────────────────────
// wishlist.js  —  Wishlist toggle & persist
// ─────────────────────────────────────────

import {
  db,
  doc,
  updateDoc
} from "./firebase.js";

import { state } from "./state.js";

import {
  showToast
} from "./ui.js";

import {
  openAuth
} from "./auth.js";

// ─────────────────────────────────────────
// Toggle Wishlist
// ─────────────────────────────────────────

export async function toggleWish(
  event,
  id
) {

  // Prevent card click

  event.stopPropagation();

  // Login required

  if (!state.currentUser) {

    openAuth();

    showToast(
      "Please login first",
      "error"
    );

    return;
  }

  // Product exists?

  const product =
    state.products.find(
      (p) => p.id === id
    );

  if (!product) {

    showToast(
      "Product not found",
      "error"
    );

    return;
  }

  // Already wishlisted

  const alreadyAdded =
    state.wishlist.includes(id);

  // Remove from wishlist

  if (alreadyAdded) {

    state.wishlist =
      state.wishlist.filter(
        (w) => w !== id
      );

    showToast(
      `${product.name} removed from wishlist`
    );

  }

  // Add to wishlist

  else {

    state.wishlist.push(id);

    showToast(
      `${product.name} added to wishlist`
    );

  }

  // Save in Firebase

  await saveWishlist();

  // Refresh visible product grids

  refreshWishlistUI();
}

// ─────────────────────────────────────────
// Save Wishlist
// ─────────────────────────────────────────

async function saveWishlist() {

  try {

    await updateDoc(

      doc(
        db,
        "users",
        state.currentUser.uid
      ),

      {
        wishlist: state.wishlist
      }

    );

  } catch (e) {

    console.error(
      "saveWishlist error:",
      e
    );

    showToast(
      "Failed to save wishlist",
      "error"
    );

  }
}

// ─────────────────────────────────────────
// Refresh Wishlist UI
// ─────────────────────────────────────────

function refreshWishlistUI() {

  const {
    renderProductGrid
  } = window._freshmart;

  // Home products

  const homeGrid =
    document.getElementById(
      "home-grid"
    );

  if (
    homeGrid &&
    homeGrid.innerHTML.includes("prod-body")
  ) {

    renderProductGrid(

      "home-grid",

      state.products.slice(0, 12)

    );

  }

  // Products page

  const productsGrid =
    document.getElementById(
      "products-grid"
    );

  if (
    productsGrid &&
    productsGrid.innerHTML.includes("prod-body")
  ) {

    renderProductGrid(

      "products-grid",

      state.products

    );

  }

  // Wishlist page (optional)

  const wishlistGrid =
    document.getElementById(
      "wishlist-grid"
    );

  if (wishlistGrid) {

    const wishlistProducts =
      state.products.filter(
        (p) =>
          state.wishlist.includes(p.id)
      );

    renderProductGrid(
      "wishlist-grid",
      wishlistProducts
    );

  }
}

// ─────────────────────────────────────────
// Get Wishlist Products
// ─────────────────────────────────────────

export function getWishlistProducts() {

  return state.products.filter(

    (p) =>
      state.wishlist.includes(p.id)

  );
}