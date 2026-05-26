// ─────────────────────────────────────────
// ui.js  —  Toast, navigation, helpers
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// Page navigation
// ─────────────────────────────────────────

export function showPage(id) {

  document
    .querySelectorAll(".page")
    .forEach((p) =>
      p.classList.remove("active")
    );

  const page =
    document.getElementById(id);

  if (page) {

    page.classList.add("active");

  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ─────────────────────────────────────────
// Toast notifications
// ─────────────────────────────────────────

export function showToast(
  msg,
  type = ""
) {

  const t =
    document.getElementById("toast");

  if (!t) return;

  t.textContent = msg;

  t.className =
    type === "error"
      ? "error-toast show"
      : "show";

  setTimeout(() => {

    t.className = "";

  }, 2600);
}

// ─────────────────────────────────────────
// Cart Drawer
// ─────────────────────────────────────────

export function openDrawer() {

  document
    .getElementById("cart-drawer")
    ?.classList.add("open");

  document
    .getElementById("drawer-overlay")
    ?.classList.add("open");
}

export function closeDrawer() {

  document
    .getElementById("cart-drawer")
    ?.classList.remove("open");

  document
    .getElementById("drawer-overlay")
    ?.classList.remove("open");
}

// ─────────────────────────────────────────
// Category label (no emoji)
// ─────────────────────────────────────────

export function getCatLabel(cat) {
  return cat || "General";
}