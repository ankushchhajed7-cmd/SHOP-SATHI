/* ============================================================
   ShopSathi v1.0.0 — CONFIG (sirf yahi file badalni hai)
   ------------------------------------------------------------
   1) Firebase Console > Project settings > General > Your apps
      > Web app (</>) > "SDK setup and configuration" > Config
      Wahan ki values neeche "firebase" mein paste karein.
   2) adminMobile mein apna (Super Admin) mobile number daalein.
      firestore.rules file mein bhi yahi number daalna hai.
   ============================================================ */
window.SS_CONFIG = {
  firebase: {
    apiKey: "PASTE_API_KEY",
    authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_PROJECT_ID",
    storageBucket: "PASTE_PROJECT_ID.appspot.com",
    messagingSenderId: "PASTE_SENDER_ID",
    appId: "PASTE_APP_ID"
  },

  // Super Admin (sirf aap) — 10 digit mobile, bina +91
  adminMobile: "9999999999",

  // Paid plan / help ke liye aapka WhatsApp (91 + number)
  adminWhatsApp: "919999999999",

  // Paid plan payment ke liye UPI ID (khali chhod sakte hain)
  upiId: "",

  planPrice: 199,   // ₹ per mahina
  freeLimit: 50,    // free plan mein kitne customer (firestore.rules mein bhi 50 hai)

  // GitHub Pages ka link (QR code isi se banta hai)
  baseUrl: "https://ankushchhajed7-cmd.github.io/SHOP-SATHI/"
};
