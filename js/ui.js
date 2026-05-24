// ─────────────────────────────────────────
// ui.js  —  Toast, navigation, helpers
// ─────────────────────────────────────────

// ── Page navigation ──────────────────────

export function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

// ── Toast notifications ──────────────────

export function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = type === "error" ? "error-toast show" : "show";
  setTimeout(() => (t.className = ""), 2600);
}

// ── Cart Drawer ──────────────────────────

export function openDrawer() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("drawer-overlay").classList.add("open");
}

export function closeDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("drawer-overlay").classList.remove("open");
}

// ── Category emoji map ───────────────────

export function getCatEmoji(cat) {
  return (
    {
      Vegetables: "🥦",
      Fruits:     "🍎",
      Dairy:      "🥛",
      Grains:     "🌾",
      Bakery:     "🍞",
      Snacks:     "🍿",
      Beverages:  "🧃",
      Spices:     "🌶️",
    }[cat] || "🛒"
  );
}
