// ─────────────────────────────────────────
// profile.js  —  Profile page & tabs
// ─────────────────────────────────────────

import { db, doc, getDoc, updateDoc } from "./firebase.js";
import { state } from "./state.js";
import { showToast, showPage } from "./ui.js";
import { openAuth } from "./auth.js";

export async function loadProfile() {
  if (!state.currentUser) { showPage("home-page"); openAuth(); return; }

  document.getElementById("profile-name").textContent  = state.currentUser.displayName || "—";
  document.getElementById("profile-email").textContent = state.currentUser.email;
  profileTab("info");
}

export async function profileTab(tab) {
  document.querySelectorAll(".profile-menu button").forEach((b) => b.classList.remove("active"));
  const content = document.getElementById("profile-content");

  if (tab === "info") {
    let userData = {};
    try {
      const s = await getDoc(doc(db, "users", state.currentUser.uid));
      if (s.exists()) userData = s.data();
    } catch (e) {}

    content.innerHTML = `
      <h3 style="font-family:'Playfair Display',serif;font-size:20px;margin-bottom:20px">Personal Information</h3>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-input" id="pf-name" value="${userData.name || state.currentUser.displayName || ""}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-input" id="pf-phone" value="${userData.phone || ""}"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" value="${state.currentUser.email}" disabled style="background:#f5f5f5"/>
      </div>
      <div class="form-group">
        <label class="form-label">Address</label>
        <input class="form-input" id="pf-addr" value="${userData.address || ""}"/>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">City</label>
          <input class="form-input" id="pf-city" value="${userData.city || ""}"/>
        </div>
        <div class="form-group">
          <label class="form-label">PIN Code</label>
          <input class="form-input" id="pf-pin" value="${userData.pin || ""}"/>
        </div>
      </div>
      <button class="save-btn" onclick="window._saveProfile()">Save Changes</button>`;

  } 
  
  else if (tab === "wishlist") {

  const wprods = state.products.filter(
    (p) => state.wishlist.includes(p.id)
  );

  content.innerHTML = `
    <h3 style="
      font-family:'Playfair Display',serif;
      font-size:20px;
      margin-bottom:20px
    ">
      Wishlist
    </h3>
  `;

  // Empty wishlist

  if (!wprods.length) {

    content.innerHTML += `
      <p style="color:var(--muted)">
        No items in wishlist yet.
      </p>
    `;

    return;
  }

  const grid = document.createElement("div");

  grid.className = "product-grid";

  content.appendChild(grid);

  grid.innerHTML = wprods.map((p) => {

    const disc =
      p.mrp > p.price
        ? Math.round(
            (1 - p.price / p.mrp) * 100
          )
        : 0;

    return `

      <div class="product-card">

        <div class="prod-img">

          ${p.badge ? `

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

          ` : ""}

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

        <div class="prod-body">

          <div class="prod-category">
            ${p.category || ""}
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

        </div>

      </div>

    `;

  }).join("");
}
  
  
  else if (tab === "address") {
    content.innerHTML = `
      <h3 style="font-family:'Playfair Display',serif;font-size:20px;margin-bottom:20px">📍 Saved Addresses</h3>
      <p style="color:var(--muted)">Address management coming soon.</p>`;
  }
}

export async function saveProfile() {
  try {
    await updateDoc(doc(db, "users", state.currentUser.uid), {
      name:    document.getElementById("pf-name").value,
      phone:   document.getElementById("pf-phone").value,
      address: document.getElementById("pf-addr").value,
      city:    document.getElementById("pf-city").value,
      pin:     document.getElementById("pf-pin").value,
    });
    showToast("✅ Profile saved!");
  } catch (e) {
    showToast("Error saving", "error");
  }
}
