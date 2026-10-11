# ShopSathi v1.1.2 — har bill par reward points

Kisi bhi dukaan (kirana, medical, kapde…) ke liye reward points app:
customer bill ki photo upload karta hai → dukaandar check karke approve karta hai → points judte hain → points se gift.

| App | Link (GitHub Pages ke baad) |
|---|---|
| Customer app | `https://ankushchhajed7-cmd.github.io/SHOP-SATHI/customer/` |
| Business app (dukaandar + staff) | `https://ankushchhajed7-cmd.github.io/SHOP-SATHI/business/` |
| Super Admin (sirf aap, install ho sakta hai) | `https://ankushchhajed7-cmd.github.io/SHOP-SATHI/admin/` |
| Landing page | `https://ankushchhajed7-cmd.github.io/SHOP-SATHI/` |

---

## Setup (sirf phone se, ek baar — lagbhag 15 minute)

### 1. Firebase project banayein
1. Chrome mein `console.firebase.google.com` kholein → **Add project** → naam `shopsathi` → Google Analytics **band** → Create.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
   (App mobile + 6 ank PIN ko andar hi email/password bana leta hai — SMS ka kharcha nahi.)
3. **Build → Firestore Database → Create database → Production mode → Location `asia-south1 (Mumbai)` → Create.**

### 2. Security rules lagayein
1. Is repo ki `firestore.rules` file kholein, poora text copy karein.
2. Firestore → **Rules** tab → purana text hata kar paste karein.
3. Upar `adminMobiles()` mein `9999999999` ki jagah **apna mobile number** likhein → **Publish**.

### 3. Config daalein
1. Firebase → ⚙️ **Project settings → General → Your apps → Web (`</>`)** → naam `ShopSathi` → Register.
2. Jo `firebaseConfig` dikhe, uski values GitHub web editor mein **`shared/config.js`** mein paste karein.
3. Usi file mein `adminMobile` (aapka number) aur `adminWhatsApp` (`91` + number) bharein. `upiId` daalenge to paid plan ke liye UPI button aayega.
4. Commit karein.

### 4. GitHub Pages chalu karein
Repo → **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.** 1–2 minute mein link chalu.

### 5. Shuru karein
- **Dukaan:** Business app → *Nayi dukaan* → mobile + PIN → 5 step setup → dukaan **"Approval baaki"** mein rahegi. Chalu karne ke 2 tareeke: (a) dukaandar activation code daale, ya (b) aap `/admin/` mein us dukaan par **+30 din / +1 saal / Lifetime** dabayein. Phir dukaan ka QR (Aur → Dukaan ka QR → Print).
- **Customer:** QR scan kare (ya dukaan code daale) → Naya account → bill upload.
- **Admin:** Customer app mein apne admin mobile se *Naya account* banayein, phir `/admin/` kholein — saari dukaanein, approval (+30 din / +1 saal / Lifetime / Mana), chalu/band, **Activation codes** tab (code banayein → WhatsApp par bhejein).

### 6. APK (apk-factory se)
`apk-factory` workflow mein URL daalein:
- Customer: `.../SHOP-SATHI/customer/` → package `com.ankushnewvision.shopsathi`
- Business: `.../SHOP-SATHI/business/` → package `com.ankushnewvision.shopsathibiz`

> APK ke andar camera se photo lene ke liye WebView mein file chooser + camera permission chahiye. Agar APK mein "Camera" button kuch na kare to Gallery button use karein, ya browser (PWA) version install karein.

---

## Features (v1.0.0)

**Customer app** — mobile + PIN login · QR / code se dukaan jodna (ek customer kai dukaanein) · refer code · welcome bonus · bill photo + amount upload (offline ho to line mein, net aate hi upload) · minimum bill, time limit, duplicate check · bills (Pending / Approved / Rejected + kaaran) · gift list (photo, points, progress, ✅) · gift request / cancel · points hisaab · apna QR + code · refer & earn (WhatsApp) · birthday month · suchnayein · 4 bhasha · account delete.

**Business app** — 5 step setup (dukaan, logo + short code, points % ya ₹ par 1 point, minimum bill, upload din, scheme + settlement tareekh, welcome / refer / birthday 2x / festival 2x, Silver-Gold-Platinum level) · pending bills: photo zoom, **final amount edit**, points preview, duplicate warning, approve / reject (kaaran) · customers: search, QR scan, detail (points, gift, bills, hisaab, call, WhatsApp, block), bina smartphone wale customer jodna + manual bill · gifts (photo, points, stock) + gift requests (Gift diya → points auto kate) · reports (mahina, top customers, settlement list) · Excel backup · purani photos ZIP + cloud khali · nayi scheme (points reset) · staff login (sirf approve, settings nahi) · plan / upgrade · dukaan delete.

**Super Admin** — saari dukaanein, customers, plan free/paid (+30 din, +1 saal), expired list, chalu/band, owner ko WhatsApp.

**Points ka hisaab:** `%` mode: amount × % ÷ 100 · `₹` mode: amount ÷ ₹. Phir level ×multiplier, aur festival ya birthday ho to ×2 (dono ek saath bhi max ×2). Points 2 decimal tak dikhte hain (₹785 × 0.25% = 1.96), andar poora number judta hai.

---

## Free limit aur kharcha
- Firebase **Spark (free)**: 1 GB data, roz 50,000 reads / 20,000 writes. Ek bill photo ~100 KB → lagbhag 10,000 photos. Settlement ke baad **Settings → Purani photos download (ZIP) aur cloud khali** karein.
- **Free plan nahi hai.** Har nayi dukaan pehle "Approval baaki" — admin approve kare ya activation code se chalu ho. Plan ki tareekh nikal jaaye to naye bill / naye customer band (data safe), code ya renew se phir chalu. Customers ki koi limit nahi.

## Abhi ki seemayein (v1.0.0)
- **PIN bhoolna:** Firebase Console → Authentication → us user ko delete karein → wo usi mobile se naya account banaye. Customer ka data mobile number par hai, isliye points safe rehte hain. *Dukaandar* ke liye admin ko Firestore mein `shops/<code>.ownerUid` aur `users/<naya uid>.ownShop` badalna padega.
- **Notification** tab aati hai jab app khula / haal hi mein khula ho. App band ho tab bhi push ke liye Firebase Blaze plan + Cloud Functions chahiye (agla version).
- Offline upload ke liye app pehle ek baar net ke saath khula hona chahiye.

## Files
```
index.html            landing page
customer/             customer app (index.html, manifest.json, sw.js)
business/             dukaandar + staff app
admin/                super admin
shared/config.js      ← sirf ye file badalni hai
shared/common.js      Firebase, points engine, photo compress, QR, icons
shared/i18n.js        Hinglish / हिंदी / मराठी / English
shared/theme.css      Silver Mirror + Gold theme
icons/                logo 3B (customer) + biz-* (business, gunmetal + briefcase)
firestore.rules       security rules
LICENSE               © Ankush New Vision — bina ijazat copy/bechna mana
```

## Data (Firestore)
`users/{uid}` · `shops/{code}` · `shops/{code}/members/{mobile}` (+ `notifs`) · `bills` · `photos` · `gifts` · `redemptions` · `ledger`

## Changelog
- **v1.1.2 (11 Oct 2026)** — Business Settings → "Customer data saaf karein (fresh start)": test ke saare customers, bills, photos, points hatao; dukaan, settings, gifts aur QR code wahi. Customer number phir 0001 se (naye rules Publish karein).
- **v1.1.1 (11 Oct 2026)** — Super Admin ab install ho sakta hai (apna maroon + shield icon, "SS Admin").
- **v1.1.0 (11 Oct 2026)** — free plan hataya; nayi dukaan admin ki manzoori ya **activation code** se hi chalu (Firebase rules mein pakka); Super Admin: Approve +30 din / +1 saal / Lifetime / Mana, Activation codes banana-bhejna; plan khatam hone se 7 din pehle chetavni; Settings mein "Naye customer ko pehle main approve karunga"; LICENSE file + © Ankush New Vision. **Update ke baad `firestore.rules` dobara Publish karein aur apni dukaan ko admin se Lifetime dein.**
- **v1.0.9 (11 Oct 2026)** — duplicate chetavni ab Devanagari Hindi mein (Hinglish chuna ho tab bhi), laal/naarangi square border ke saath blink karti hai; "डुप्लिकेट?" nishaan bhi blink karta hai.
- **v1.0.8 (11 Oct 2026)** — duplicate bill rok: customer wahi photo / wahi bill no. / same din + same amount dobara nahi bhej sakta; dukaandar ko duplicate par Approve ki jagah sirf "Duplicate — Reject" milta hai; pending list mein "Duplicate?" nishaan; approved bill ko malik cancel karke points wapas le sakta hai.
- **v1.0.7 (11 Oct 2026)** — QR scanner mein "Gallery se QR photo upload karein" button (screenshot / WhatsApp wali QR photo se bhi dukaan judti hai); badi photo mein QR na mile to chhota karke dobara dhoondhta hai.
- **v1.0.6 (11 Oct 2026)** — QR scanner: camera na khule to error ka kaaran dikhata hai, doosra camera try karta hai; khaali video ka play-icon hataya.
- **v1.0.5 (11 Oct 2026)** — customer signup/profile se janamdin ka mahina hataya (dukaandar customer page par set kar sakta hai); naya QR scanner: Chrome ka built-in scanner + "photo khinch kar scan" (camera permission na ho to bhi).
- **v1.0.4 (11 Oct 2026)** — setup Step 5 mein gift ki photo (optional); points ka % / niyam customer app, QR poster aur home par nahi dikhta; login error message saaf.
- **v1.0.3 (11 Oct 2026)** — Business app ka alag icon: gunmetal background + sone ka briefcase badge (customer app silver hi rahega).
- **v1.0.2 (11 Oct 2026)** — install fix: dono apps ko alag manifest id, taaki Chrome "already installed / Could not open app" na dikhaye.
- **v1.0.1 (11 Oct 2026)** — Firebase project `shopsathi-25794` ka config aur admin number (9765838383) jod diya.
- **v1.0.0 (10 Oct 2026)** — pehla release.
