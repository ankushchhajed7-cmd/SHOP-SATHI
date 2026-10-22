# STATE — ShopSathi (SHOP-SATHI)

Live: https://ankushchhajed7-cmd.github.io/SHOP-SATHI/ (customer/, business/, admin/)
Firebase project: shopsathi-25794 · Super Admin: 9765838383 · Backup repo (private): ankushchhajed7-cmd/SHOPSATHI-BACKUP

## Version history (short)
- v1.0.x — pehla release, Firebase config, install fixes, business icon, gift photo, QR scanner + gallery
- v1.0.8–1.0.9 — duplicate bill rok, approved bill cancel (points wapas), Hindi blinking chetavni
- v1.1.0–1.1.2 — free plan hataya, admin approval + activation codes, naye customer ki manzoori, Admin installable, fresh start (test data saaf)
- v1.2.0–1.2.2 — gift levels (blur, progress, badhai), "koi ek chunein", 1 April se ek baar gift, niyam line, customer ko bill ki sirf chhoti photo
- v1.3.0 — level naam Bronze → Kohinoor; kharidi levels Normal / VIP / Super VIP
- v1.4.0 (18 Oct 2026) — auto backup har Ravivar 8 PM (private repo) + Admin panel Backup tab
- v1.4.1 (18 Oct 2026) — Admin 🔑 PIN tab + backup repo ka "ShopSathi PIN Reset" workflow (naya PIN + purane phone logout)
- v1.4.2 (18 Oct 2026) — PIN badlein: Customer Profile + Business "Aur" (owner + staff); purana PIN zaroori, aasaan PIN mana
- v1.5.0 (22 Oct 2026) — Customers ko sandesh (ek / sabhi), app khulte hi ek baar popup, padha/nahi status, wapas lein; rules: msgs collection

## Settings / decisions
- Free plan nahi; har dukaan admin approve ya activation code se. Customer app hamesha free.
- Gift: scheme khatam (31 Mar) ke agle din se settlement (30 Apr) tak, ek scheme mein ek baar; sirf sabse oonche level ka ek gift.
- Badi bill photo sirf dukaandar/staff (rules).
- Har rules badlaav ke baad Firebase Console mein Publish zaroori.
- Sandesh: shops/{code}/msgs/{id} (text, to = mobile ya 'all', total, readBy[]) + har customer ke notifs/{same id} kind 'msg'. Popup sirf unread 'msg' notif par; padhne par notif read + msgs.readBy. Sabko bhejna sirf malik; wapas lena malik ya bhejne wala staff. Real SMS nahi (in-app).
- PR merge: Ankush kehte hain tab Claude merge karta hai.
- Backup setup poora (18 Oct 2026): repo private, secret set, pehla backup OK, rules v1.4.0 published.
- Phone badla: customer wahi mobile + PIN se **Login** kare (Register nahi) — data cloud mein hai. PIN bhoole to Admin → 🔑 PIN; PIN yaad ho to khud Profile/Aur → PIN badlein.

## Pending / ideas
- Security sujhaav baaki: App Lock (3), activity log (4), staff rok (5), shakki gatividhi (6), API key rok (9), App Check (10)
