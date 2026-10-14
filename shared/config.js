/* ============================================================
   ShopSathi v1.3.0 — CONFIG (sirf yahi file badalni hai)
   ------------------------------------------------------------
   1) Firebase Console > Project settings > General > Your apps
      > Web app (</>) > "SDK setup and configuration" > Config
      Wahan ki values neeche "firebase" mein paste karein.
   2) adminMobile mein apna (Super Admin) mobile number daalein.
      firestore.rules file mein bhi yahi number daalna hai.
   ============================================================ */
window.SS_CONFIG = {
  firebase: {
    apiKey: "AIzaSyB5y0FDpukxMB9DKLxDGHqFFO0xghgAAEw",
    authDomain: "shopsathi-25794.firebaseapp.com",
    projectId: "shopsathi-25794",
    storageBucket: "shopsathi-25794.firebasestorage.app",
    messagingSenderId: "1086395739587",
    appId: "1:1086395739587:web:91d41c0f246eb181962176"
  },

  // Super Admin (sirf aap) — 10 digit mobile, bina +91
  adminMobile: "9765838383",

  // Paid plan / help ke liye aapka WhatsApp (91 + number)
  adminWhatsApp: "919765838383",

  // Paid plan payment ke liye UPI ID (khali chhod sakte hain)
  upiId: "",

  planPrice: 199,   // ₹ per mahina (free plan nahi hai — har nayi dukaan admin approve ya activation code se chalu)

  // GitHub Pages ka link (QR code isi se banta hai)
  baseUrl: "https://ankushchhajed7-cmd.github.io/SHOP-SATHI/"
};
