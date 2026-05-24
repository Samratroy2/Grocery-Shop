// ─────────────────────────────────────────
// wishlist.js  —  Wishlist toggle & persist
// ─────────────────────────────────────────

import { db, doc, updateDoc } from "./firebase.js";
import { state } from "./state.js";
import { showToast } from "./ui.js";
import { openAuth } from "./auth.js";

export function toggleWish(event, id) {
  event.stopPropagation();

  if (!state.currentUser) { openAuth(); return; }

  if (state.wishlist.includes(id)) {
    state.wishlist = state.wishlist.filter((w) => w !== id);
  } else {
    state.wishlist.push(id);
  }

  saveWishlist();

  // Re-render visible grids
  const { renderProductGrid } = window._freshmart;
  renderProductGrid("home-grid", state.products.slice(0, 8));
  const pp = document.getElementById("products-grid");
  if (pp && pp.innerHTML.includes("prod-body"))
    renderProductGrid("products-grid", state.products);

  showToast(state.wishlist.includes(id) ? "❤️ Added to wishlist" : "💔 Removed from wishlist");
}

async function saveWishlist() {
  try {
    await updateDoc(doc(db, "users", state.currentUser.uid), { wishlist: state.wishlist });
  } catch (e) {
    console.error("saveWishlist error:", e);
  }
}
