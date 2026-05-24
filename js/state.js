// ─────────────────────────────────────────
// state.js  —  Shared application state
// ─────────────────────────────────────────

export const state = {
  currentUser:   null,   // Firebase User object | null
  cart:          {},     // { [productId]: quantity }
  products:      [],     // Array of product objects from Firestore
  wishlist:      [],     // Array of product IDs
  isLoginMode:   true,   // true = sign-in form, false = sign-up form
  promoApplied:  false,  // Whether FRESH20 promo is active
};
