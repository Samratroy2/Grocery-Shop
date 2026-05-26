// ─────────────────────────────────────────
// auth.js  —  Sign-in / sign-up / sign-out
// ─────────────────────────────────────────

import {
  auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  updateProfile,
  doc, setDoc, getDoc, updateDoc,
  serverTimestamp,
} from "./firebase.js";
import { state } from "./state.js";
import { showToast, showPage } from "./ui.js";
import { refreshCartUI, saveCart } from "./cart.js";

// ── Modal helpers ────────────────────────

export function openAuth() {
  document.getElementById("modal-bg").classList.add("open");
}
export function closeAuth() {
  document.getElementById("modal-bg").classList.remove("open");
}

export function toggleAuthMode() {
  state.isLoginMode = !state.isLoginMode;

  document.getElementById("auth-title").textContent      = state.isLoginMode ? "Sign In" : "Create Account";
  document.getElementById("auth-sub").textContent        = state.isLoginMode ? "Welcome back! Please sign in." : "Join FreshMart today!";
  document.getElementById("auth-submit-btn").textContent = state.isLoginMode ? "Sign In" : "Create Account";
  document.getElementById("auth-name").style.display     = state.isLoginMode ? "none" : "block";
  document.getElementById("auth-switch").innerHTML       = state.isLoginMode
    ? 'New user? <a onclick="window._toggleAuthMode()">Create account</a>'
    : 'Have account? <a onclick="window._toggleAuthMode()">Sign in</a>';

  showAuthMsg("", "");
}

function showAuthMsg(msg, type) {
  const el     = document.getElementById("auth-msg");
  el.textContent = msg;
  el.className   = "auth-msg" + (type ? " " + type : "");
  el.style.display = msg ? "block" : "none";
}

// ── Handle login / register ──────────────

export async function handleAuth() {
  const email = document.getElementById("auth-email").value.trim();
  const pass  = document.getElementById("auth-pass").value;
  const name  = document.getElementById("auth-name").value.trim();

  showAuthMsg("", "");
  if (!email || !pass) { showAuthMsg("Please fill all fields.", "error"); return; }

  try {
    if (state.isLoginMode) {
      await signInWithEmailAndPassword(auth, email, pass);
      showAuthMsg("Login successful! 🎉", "success");
      setTimeout(closeAuth, 900);
    } else {
      if (!name) { showAuthMsg("Please enter your name.", "error"); return; }
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name, email, phone: "", address: "", city: "",
        createdAt: serverTimestamp(),
        cart: {}, wishlist: [], role: "user",
      });
      showAuthMsg("Account created! 🎉", "success");
      setTimeout(closeAuth, 900);
    }
  } catch (e) {
    const msgs = {
      "auth/email-already-in-use": "Email already registered.",
      "auth/invalid-email":        "Invalid email.",
      "auth/weak-password":        "Password must be 6+ characters.",
      "auth/invalid-credential":   "Invalid email or password.",
      "auth/user-not-found":       "No account found.",
      "auth/wrong-password":       "Incorrect password.",
    };
    showAuthMsg(msgs[e.code] || "Something went wrong.", "error");
  }
}

// ── Sign out ─────────────────────────────

export async function signOut() {
  await fbSignOut(auth);
  state.cart     = {};
  state.wishlist = [];
  refreshCartUI();
  showPage("home-page");
  showToast("Logged out successfully");
}

// ── Auth state listener ──────────────────

export function initAuthListener() {
  onAuthStateChanged(auth, async (user) => {
    state.currentUser = user;
    const label     = document.getElementById("auth-nav-label");
    const adminLink = document.getElementById("admin-nav-link");

    if (user) {
      label.textContent = user.displayName?.split(" ")[0] || "Account";
      document.getElementById("auth-nav-btn").onclick = () => {
        showPage("profile-page");
        window._loadProfile();
      };

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();

          state.cart =
            d.cart || {};

          state.wishlist =
            d.wishlist || {};

          if (d.role === "admin") {

            adminLink.style.display =
              "block";

          }

          // Refresh cart

          refreshCartUI();

          // Re-render cart page
          // after cart restore

          const activePage =
            localStorage.getItem(
              "activePage"
            );

          if (
            activePage ===
            "cart-page"
          ) {

            window._renderCartPage();

          }
        }
      } catch (e) {
        console.error("Auth state load error:", e);
      }
    } else {
      label.textContent = "Login";
      document.getElementById("auth-nav-btn").onclick = openAuth;
      adminLink.style.display = "none";
    }
  });
}
