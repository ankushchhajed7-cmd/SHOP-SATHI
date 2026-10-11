/* ============================================================
   ShopSathi — shared helpers (business + customer + admin)
   v1.1.1 (2026-10-11) — scanner: camera error ka naam dikhe, dusra camera try, play-icon hataya
   v1.0.5 (2026-10-11) — naya QR scanner (BarcodeDetector + photo se scan), janamdin customer se nahi
   v1.0.4 (2026-10-11) — gift photo setup mein; points % chhupa
   v1.0.3 (2026-10-11) — Business app ka alag icon
   v1.0.2 (2026-10-11) — PWA install fix (unique manifest id)
   v1.0.1 (2026-10-11) — Firebase project shopsathi-25794 config
   v1.0.0 (2026-10-10) — pehla release
   ============================================================ */
(function () {
  'use strict';
  const SS = (window.SS = window.SS || {});
  SS.VERSION = '1.1.1';
  const CFG = window.SS_CONFIG || {};
  SS.CFG = CFG;

  /* ---------------- Firebase ---------------- */
  SS.configured = function () {
    const f = CFG.firebase || {};
    return !!(f.apiKey && f.projectId && !/PASTE/.test(f.apiKey + f.projectId));
  };

  SS.initFirebase = function () {
    if (SS.db) return true;
    if (!window.firebase || !SS.configured()) return false;
    if (!firebase.apps.length) firebase.initializeApp(CFG.firebase);
    SS.auth = firebase.auth();
    SS.db = firebase.firestore();
    try {
      SS.db.enablePersistence({ synchronizeTabs: true }).catch(function () {});
    } catch (e) {}
    SS.FV = firebase.firestore.FieldValue;
    return true;
  };

  SS.emailFor = (m) => String(m).trim() + '@shopsathi.app';
  SS.mobileOf = (user) => (user && user.email ? user.email.split('@')[0] : '');
  SS.validMobile = (m) => /^[6-9]\d{9}$/.test(String(m || '').trim());
  SS.validPin = (p) => /^\d{6}$/.test(String(p || '').trim());

  SS.signup = (mobile, pin) => SS.auth.createUserWithEmailAndPassword(SS.emailFor(mobile), pin);
  SS.login = (mobile, pin) => SS.auth.signInWithEmailAndPassword(SS.emailFor(mobile), pin);
  SS.logout = () => SS.auth.signOut();
  SS.reauth = (pin) => {
    const u = SS.auth.currentUser;
    const cred = firebase.auth.EmailAuthProvider.credential(u.email, pin);
    return u.reauthenticateWithCredential(cred);
  };

  SS.authErr = function (e) {
    const c = (e && e.code) || '';
    if (c === 'auth/email-already-in-use') return SS.t('err_exists');
    if (/wrong-password|user-not-found|invalid-credential|invalid-login-credentials|invalid-email/.test(c)) return SS.t('err_login');
    if (c === 'auth/too-many-requests') return SS.t('err_many');
    if (c === 'auth/network-request-failed') return SS.t('err_net');
    if (c === 'auth/weak-password') return SS.t('err_pin');
    if (c === 'auth/requires-recent-login') return SS.t('err_relogin');
    if (c === 'permission-denied' || /permission/i.test(e && e.message)) return SS.t('err_perm');
    if (c === 'unavailable') return SS.t('err_net');
    return (e && e.message) || String(e);
  };

  /* ---------------- Formatting / dates ---------------- */
  SS.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  SS.num = (v) => { const n = parseFloat(String(v).replace(/,/g, '')); return isFinite(n) ? n : 0; };
  SS.fmtPts = (n) => (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
  SS.fmtRs = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  SS.locale = () => ({ hi: 'hi-IN', mr: 'mr-IN', en: 'en-IN', hing: 'en-IN' }[SS.lang()] || 'en-IN');
  SS.fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-');
  SS.fmtDateFull = (ms) => (ms ? new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
  SS.fmtDT = (ms) => (ms ? new Date(ms).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-');
  SS.dayStart = (ms) => { const d = new Date(ms == null ? Date.now() : ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  SS.dayEnd = (ms) => { const d = new Date(ms == null ? Date.now() : ms); d.setHours(23, 59, 59, 999); return d.getTime(); };
  SS.isoDate = (ms) => { const d = new Date(ms == null ? Date.now() : ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  SS.fromIso = (s) => { if (!s) return 0; const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]).getTime(); };
  /* dukaan chalu hai? (admin ne band nahi ki + plan ki tareekh baaki) — free plan nahi hai */
  SS.shopOk = (sh) => !!(sh && sh.active === true && (Number(sh.paidUntil) || 0) > Date.now());
  SS.LIFETIME_DAYS = 36500;
  /* activation code: 8 akshar, XXXX-XXXX (I, O, 0, 1 nahi — galti na ho) */
  SS.LIC_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  SS.newLicCode = function () {
    const a = new Uint8Array(8); crypto.getRandomValues(a);
    let c = ''; for (let i = 0; i < 8; i++) { c += SS.LIC_CHARS[a[i] % 32]; if (i === 3) c += '-'; }
    return c;
  };
  SS.normLic = function (raw) {
    const x = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return x.length === 8 ? x.slice(0, 4) + '-' + x.slice(4) : '';
  };
  SS.daysLeft = (endMs) => Math.max(0, Math.ceil((SS.dayEnd(endMs) - Date.now()) / 86400000));
  SS.monthStart = (y, m) => new Date(y, m, 1).getTime();
  SS.pad = (n, w) => String(n).padStart(w || 4, '0');
  SS.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* Default scheme: aaj se 31 March tak, settlement 30 April */
  SS.defaultScheme = function () {
    const now = new Date();
    let y = now.getFullYear();
    const mar31 = new Date(y, 2, 31);
    if (now > mar31) y += 1;
    return { start: SS.dayStart(), end: SS.dayStart(new Date(y, 2, 31).getTime()), settle: SS.dayStart(new Date(y, 3, 30).getTime()) };
  };

  /* ---------------- Points engine ---------------- */
  SS.LEVELS = ['silver', 'gold', 'platinum'];
  SS.levelFor = function (shop, totalSpend) {
    const g = Number(shop.goldSpend) || 0, p = Number(shop.platSpend) || 0;
    if (p > 0 && totalSpend >= p) return 'platinum';
    if (g > 0 && totalSpend >= g) return 'gold';
    return 'silver';
  };
  SS.levelMult = function (shop, level) {
    if (level === 'platinum') return Number(shop.platMult) || 1;
    if (level === 'gold') return Number(shop.goldMult) || 1;
    return 1;
  };
  /* amount par kitne points: % ya fixed, level bonus, birthday/festival 2x (dono mila ke bhi max 2x) */
  SS.calcPoints = function (shop, amount, member, nowMs) {
    amount = Number(amount) || 0;
    const out = { base: 0, mult: 1, points: 0, notes: [], belowMin: false };
    if (amount <= 0) return out;
    if (amount < (Number(shop.minBill) || 0)) { out.belowMin = true; return out; }
    if (shop.pointsMode === 'fixed') {
      const r = Number(shop.rupeesPerPoint) || 0;
      out.base = r > 0 ? amount / r : 0;
    } else {
      out.base = (amount * (Number(shop.percent) || 0)) / 100;
    }
    const lvl = (member && member.level) || 'silver';
    const lm = SS.levelMult(shop, lvl);
    if (lm !== 1) out.notes.push(SS.t('lvl_' + lvl) + ' ×' + lm);
    let bonus = 1;
    const now = new Date(nowMs || Date.now());
    if (shop.festival2x) { bonus = 2; out.notes.push(SS.t('festival') + ' ×2'); }
    if (shop.birthdayDouble && member && Number(member.dobMonth) === now.getMonth() + 1) {
      if (bonus < 2) out.notes.push(SS.t('birthday') + ' ×2');
      bonus = 2;
    }
    out.mult = lm * bonus;
    out.points = Math.round(out.base * out.mult * 10000) / 10000;
    return out;
  };
  SS.ruleText = function (shop) {
    if (!shop) return '';
    return shop.pointsMode === 'fixed'
      ? SS.t('rule_fixed', { r: shop.rupeesPerPoint })
      : SS.t('rule_pct', { p: shop.percent });
  };
  SS.nextGift = function (gifts, points) {
    const list = (gifts || []).filter((g) => g.active !== false).sort((a, b) => a.points - b.points);
    const next = list.find((g) => g.points > points) || null;
    const reach = list.filter((g) => g.points <= points);
    return { next, best: reach.length ? reach[reach.length - 1] : null, reachCount: reach.length };
  };

  /* ---------------- Images ---------------- */
  SS.fileToImage = function (file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { res(img); setTimeout(() => URL.revokeObjectURL(url), 1000); };
      img.onerror = () => rej(new Error('image'));
      img.src = url;
    });
  };
  SS.srcToImage = function (src) {
    return new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src; });
  };
  /* photo ko chhota karke ~maxKB tak JPEG dataURL banata hai */
  SS.compress = async function (fileOrSrc, maxDim, maxKB) {
    const img = typeof fileOrSrc === 'string' ? await SS.srcToImage(fileOrSrc) : await SS.fileToImage(fileOrSrc);
    let dim = maxDim || 1100;
    let q = 0.72;
    for (let i = 0; i < 8; i++) {
      const s = Math.min(1, dim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      const w = Math.max(1, Math.round((img.naturalWidth || img.width) * s));
      const h = Math.max(1, Math.round((img.naturalHeight || img.height) * s));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
      x.drawImage(img, 0, 0, w, h);
      const data = c.toDataURL('image/jpeg', q);
      if (data.length * 0.75 <= (maxKB || 100) * 1024 || i === 7) return data;
      if (q > 0.45) q -= 0.12; else dim = Math.round(dim * 0.8);
    }
  };
  /* ---------------- Duplicate bill ----------------
     nb = naya bill, ob = purana bill. Return:
     'photo'  = wahi photo        'billno' = wahi bill number
     'day'    = same customer + same tareekh + same amount (bill no. alag nahi)
     'daysoft'= same customer + same tareekh + same amount, par naye bill ka number alag hai
     ''       = duplicate nahi. Rejected bill ko ginte nahi. */
  SS.dupKind = function (nb, ob) {
    if (!nb || !ob || (nb.id && ob.id === nb.id) || ob.status === 'rejected') return '';
    if (nb.photoHash && ob.photoHash && nb.photoHash === ob.photoHash) return 'photo';
    const bn1 = String(nb.billNo || '').trim().toUpperCase(), bn2 = String(ob.billNo || '').trim().toUpperCase();
    if (bn1 && bn2 && bn1 === bn2) return 'billno';
    if (nb.memberId && nb.memberId === ob.memberId && nb.billDate && ob.billDate && SS.dayStart(nb.billDate) === SS.dayStart(ob.billDate)) {
      const a = [nb.amount, nb.finalAmount].map(Number).filter((x) => x > 0);
      const b = [ob.amount, ob.finalAmount].map(Number).filter((x) => x > 0);
      if (a.some((x) => b.some((y) => Math.abs(x - y) < 1))) return bn1 && bn1 !== bn2 ? 'daysoft' : 'day';
    }
    return '';
  };
  SS.dupHard = (k) => k === 'photo' || k === 'billno' || k === 'day';
  /* o bill b se "pehle" ka hai? (approved > pending, phir jo pehle upload hua) */
  SS.dupBefore = function (o, b) {
    const r = (x) => (x.status === 'approved' ? 2 : 1);
    if (r(o) !== r(b)) return r(o) > r(b);
    const ou = o.uploadedAt || 0, bu = b.uploadedAt || 0;
    return ou !== bu ? ou < bu : String(o.id || '') < String(b.id || '');
  };
  SS.hash = async function (str) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return (h >>> 0).toString(16);
    }
  };

  /* ---------------- UI helpers ---------------- */
  SS.$ = (sel, root) => (root || document).querySelector(sel);
  SS.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  let toastTimer;
  SS.toast = function (msg, type) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.className = type || '';
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
  };
  let loadCount = 0;
  SS.busy = function (on) {
    loadCount = Math.max(0, loadCount + (on ? 1 : -1));
    let el = document.getElementById('loader');
    if (!el) { el = document.createElement('div'); el.id = 'loader'; el.className = 'loader hidden'; el.innerHTML = '<div class="spin" role="progressbar" aria-label="Loading"></div>'; document.body.appendChild(el); }
    el.classList.toggle('hidden', loadCount === 0);
  };
  SS.run = async function (fn, okMsg) {
    SS.busy(true);
    try { const r = await fn(); if (okMsg) SS.toast(okMsg, 'ok'); return r; }
    catch (e) { console.error(e); SS.toast(SS.authErr(e), 'err'); throw e; }
    finally { SS.busy(false); }
  };
  /* bottom sheet modal; returns {el, close} */
  SS.sheet = function (title, html, opts) {
    opts = opts || {};
    const ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + SS.esc(title) + '"><div class="sh"><h3>' + SS.esc(title) + '</h3><button class="iconbtn" data-x aria-label="' + SS.t('close') + '">' + SS.ic('x') + '</button></div>' + html + '</div>';
    document.body.appendChild(ov);
    const close = () => { ov.remove(); opts.onClose && opts.onClose(); };
    ov.addEventListener('click', (e) => { if (e.target === ov && !opts.sticky) close(); });
    ov.querySelector('[data-x]').onclick = close;
    return { el: ov.querySelector('.sheet'), close };
  };
  SS.confirm = function (msg, okText, danger) {
    return new Promise((res) => {
      const m = SS.sheet(SS.t('confirm'), '<p style="margin:0;font-size:16px">' + SS.esc(msg) + '</p><div class="btnrow"><button class="btn light" data-n>' + SS.t('no') + '</button><button class="btn ' + (danger ? 'danger' : 'dark') + '" data-y>' + SS.esc(okText || SS.t('yes')) + '</button></div>', { onClose: () => res(false) });
      m.el.querySelector('[data-n]').onclick = () => m.close();
      m.el.querySelector('[data-y]').onclick = () => { res(true); m.el.parentNode.remove(); };
    });
  };
  SS.askPin = function (msg) {
    return new Promise((res) => {
      const m = SS.sheet(SS.t('confirm'), '<p style="margin:0">' + SS.esc(msg) + '</p><label class="f">' + SS.t('pin') + '<input class="inp" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password" data-p></label><button class="btn dark full" data-y>' + SS.t('confirm') + '</button>', { onClose: () => res(null) });
      m.el.querySelector('[data-y]').onclick = () => { const v = m.el.querySelector('[data-p]').value.trim(); res(v); m.el.parentNode.remove(); };
    });
  };
  SS.zoom = function (src) {
    const z = document.createElement('div');
    z.className = 'zoom';
    z.innerHTML = '<img alt="Bill photo" src="' + src + '"><button class="iconbtn" aria-label="' + SS.t('close') + '">' + SS.ic('x') + '</button>';
    z.onclick = () => z.remove();
    document.body.appendChild(z);
  };
  SS.download = function (name, blobOrUrl) {
    const a = document.createElement('a');
    a.href = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  };
  SS.wa = (mobile, text) => 'https://wa.me/' + (mobile ? '91' + mobile : '') + '?text=' + encodeURIComponent(text || '');
  SS.share = async function (text, url) {
    if (navigator.share) { try { await navigator.share({ text, url }); return; } catch (e) { return; } }
    window.open(SS.wa('', text + (url ? '\n' + url : '')), '_blank');
  };
  SS.copy = async function (text) {
    try { await navigator.clipboard.writeText(text); SS.toast(SS.t('copied'), 'ok'); } catch (e) { SS.toast(text); }
  };

  /* ---------------- QR ---------------- */
  SS.qr = function (el, text) {
    el.innerHTML = '';
    if (window.QRCode) {
      try { new QRCode(el, { text: text, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M }); return; } catch (e) {}
    }
    el.textContent = text;
  };
  /* camera se QR scan. 1) BarcodeDetector + live camera  2) html5-qrcode  3) photo khinch kar scan */
  SS.scan = function (onText) {
    const m = SS.sheet(SS.t('scan_qr'),
      '<div id="scanbox"><video id="scanvid" playsinline muted autoplay style="visibility:hidden"></video><div class="scanframe"></div></div>' +
      '<p class="small muted center" id="scanmsg" style="margin:0">' + SS.t('scan_hint') + '</p>' +
      '<input type="file" accept="image/*" capture="environment" id="scanfile" class="hidden">' +
      '<input type="file" accept="image/*" id="scanfile2" class="hidden">' +
      '<button class="btn gold full" id="scangal">' + SS.ic('image') + SS.t('scan_gallery') + '</button>' +
      '<button class="btn light full" id="scanphoto">' + SS.ic('camera') + SS.t('scan_photo') + '</button>', { onClose: stop });
    const el = m.el;
    let stream = null, timer = 0, done = false, h5 = null;
    const det = ('BarcodeDetector' in window) ? (function () { try { return new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { return null; } })() : null;
    function stop() {
      done = true; clearTimeout(timer);
      if (stream) { stream.getTracks().forEach((tr) => tr.stop()); stream = null; }
      if (h5) { try { h5.stop().then(() => h5.clear()).catch(() => {}); } catch (e) {} h5 = null; }
    }
    function finish(txt) {
      if (done) return;
      stop();
      if (el.parentNode) el.parentNode.remove();
      onText(String(txt || '').trim());
    }
    function msg(t2, bad) { const x = el.querySelector('#scanmsg'); if (x) { x.textContent = t2; x.style.color = bad ? '#9B2C2C' : ''; x.style.fontWeight = bad ? '600' : ''; } }
    // photo se scan (camera ya gallery — har jagah chalta hai)
    async function h5File(f) {
      if (!window.Html5Qrcode) return null;
      const tmp = document.createElement('div'); tmp.id = 'scantmp' + Date.now(); tmp.style.display = 'none'; document.body.appendChild(tmp);
      try { return await new Html5Qrcode(tmp.id).scanFile(f, false); } catch (er) { return null; } finally { tmp.remove(); }
    }
    async function detFile(f) {
      if (!det) return null;
      try {
        let bmp = await createImageBitmap(f);
        let codes = await det.detect(bmp);
        if (!codes.length && Math.max(bmp.width, bmp.height) > 1400) {
          // badi photo ko chhota karke dobara try
          const k = 1200 / Math.max(bmp.width, bmp.height), c = document.createElement('canvas');
          c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
          c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
          codes = await det.detect(c);
        }
        return codes.length ? codes[0].rawValue : null;
      } catch (er) { return null; }
    }
    async function fromFile(e) {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      msg(SS.t('scan_reading'));
      const r = (await detFile(f)) || (await h5File(f));
      e.target.value = '';
      if (r) return finish(r);
      msg(SS.t('err_qr_nf'), true);
    }
    el.querySelector('#scanphoto').onclick = () => el.querySelector('#scanfile').click();
    el.querySelector('#scangal').onclick = () => el.querySelector('#scanfile2').click();
    el.querySelector('#scanfile').onchange = fromFile;
    el.querySelector('#scanfile2').onchange = fromFile;
    // live camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg(SS.t('err_cam_perm'), true); return; }
    const camErr = (er) => msg(SS.t('err_cam_perm') + ' [' + ((er && er.name) || 'error') + ']', true);
    const getCam = () => navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .catch((er) => (er && (er.name === 'OverconstrainedError' || er.name === 'NotReadableError')) ? navigator.mediaDevices.getUserMedia({ video: true, audio: false }) : Promise.reject(er));
    if (det) {
      getCam().then((st) => {
        if (done) { st.getTracks().forEach((tr) => tr.stop()); return; }
        stream = st;
        const v = el.querySelector('#scanvid');
        v.srcObject = st; v.style.visibility = 'visible'; v.play().catch(() => {});
        const tick = () => {
          if (done) return;
          if (v.readyState >= 2) {
            det.detect(v).then((codes) => { if (codes.length) finish(codes[0].rawValue); else timer = setTimeout(tick, 250); }).catch(() => { timer = setTimeout(tick, 400); });
          } else timer = setTimeout(tick, 200);
        };
        tick();
      }).catch(camErr);
    } else if (window.Html5Qrcode) {
      const box = el.querySelector('#scanbox');
      box.innerHTML = '<div id="scanh5"></div>';
      h5 = new Html5Qrcode('scanh5');
      h5.start({ facingMode: 'environment' }, { fps: 10, qrbox: 200 }, (txt) => finish(txt), () => {}).catch(camErr);
    } else msg(SS.t('err_cam'), true);
  };

  /* ---------------- Notifications / SW ---------------- */
  SS.registerSW = function () {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  };
  SS.askNotify = function () {
    try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
  };
  SS.notify = async function (title, body) {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
      if (reg) reg.showNotification(title, { body, icon: '../icons/icon-192.png', badge: '../icons/icon-192.png' });
      else new Notification(title, { body });
    } catch (e) {}
  };

  /* ---------------- Firestore helpers ---------------- */
  SS.now = () => Date.now();
  SS.docs = (snap) => snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
  /* query ke saare docs batch mein delete */
  SS.deleteQuery = async function (query) {
    for (let i = 0; i < 50; i++) {
      const snap = await query.limit(400).get();
      if (snap.empty) return;
      const b = SS.db.batch();
      snap.docs.forEach((d) => b.delete(d.ref));
      await b.commit();
      if (snap.size < 400) return;
    }
  };
  SS.loadScript = function (src) {
    return new Promise((res, rej) => {
      if (document.querySelector('script[src="' + src + '"]')) return res();
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  };
  SS.LIBS = {
    xlsx: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    jszip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
  };

  /* ---------------- Icons (stroke SVG) ---------------- */
  const P = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8c-2-4-6-4-6-1.5S12 8 12 8zm0 0c2-4 6-4 6-1.5S12 8 12 8z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.8 3 2.6 3.5 5.2"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1-1.2 2 .8-.5 1.6c-3 .5-7.5-4-7-7l1.6-.5.8 2z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/>',
    shop: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lang: '<path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 6 5.5 7.5M11 5c-.8 3.5-3 6.5-6.5 8M13 21l4-9 4 9M14.5 18h5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>'
  };
  SS.ic = function (name, size) {
    const s = size || 22;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };

  /* ShopSathi logo (3B) — size px */
  let logoN = 0;
  SS.logo = function (size) {
    const n = 'lg' + (++logoN);
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 512 512" aria-hidden="true"><defs>' +
      '<linearGradient id="' + n + 's" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="512" y2="512"><stop offset="0" stop-color="#8E9399"/><stop offset=".25" stop-color="#E3E6E9"/><stop offset=".4" stop-color="#fff"/><stop offset=".5" stop-color="#C2C7CC"/><stop offset=".66" stop-color="#8A9096"/><stop offset=".82" stop-color="#E6E9EC"/><stop offset="1" stop-color="#FAFBFC"/></linearGradient>' +
      '<linearGradient id="' + n + 'g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="512" y2="512"><stop offset="0" stop-color="#8A6516"/><stop offset=".22" stop-color="#E8C25A"/><stop offset=".38" stop-color="#FFF4C2"/><stop offset=".46" stop-color="#D9A833"/><stop offset=".62" stop-color="#7E5A12"/><stop offset=".8" stop-color="#E6BF55"/><stop offset="1" stop-color="#FFF0B0"/></linearGradient>' +
      '<linearGradient id="' + n + 'k" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="512" y2="512"><stop offset="0" stop-color="#50555B"/><stop offset=".4" stop-color="#2A2D31"/><stop offset=".5" stop-color="#6B7177"/><stop offset="1" stop-color="#1F2226"/></linearGradient></defs>' +
      '<rect width="512" height="512" rx="112" fill="url(#' + n + 's)"/><rect x="10" y="10" width="492" height="492" rx="104" fill="none" stroke="url(#' + n + 'g)" stroke-width="' + (size < 80 ? 16 : 8) + '"/>' +
      '<path d="M96 112h64v70a32 32 0 0 1-64 0zM224 112h64v70a32 32 0 0 1-64 0zM352 112h64v70a32 32 0 0 1-64 0z" fill="url(#' + n + 'g)"/>' +
      '<path d="M160 112h64v70a32 32 0 0 1-64 0zM288 112h64v70a32 32 0 0 1-64 0z" fill="url(#' + n + 'k)"/>' +
      '<rect x="196" y="292" width="120" height="104" rx="6" fill="url(#' + n + 'g)"/><rect x="184" y="268" width="144" height="32" rx="6" fill="url(#' + n + 'g)"/>' +
      '<rect x="248" y="268" width="16" height="128" fill="url(#' + n + 'k)"/>' +
      '<path d="M256 266c-22-40-66-32-52-8 9 13 52 8 52 8zm0 0c22-40 66-32 52-8-9 13-52 8-52 8z" fill="url(#' + n + 'k)"/>' +
      '<rect x="112" y="404" width="288" height="18" rx="9" fill="url(#' + n + 'k)"/></svg>';
  };
  SS.wordmark = (size) => '<span class="wordmark" style="font-size:' + (size || 34) + 'px"><span>Shop</span>Sathi</span>';

  /* config na bhara ho to setup screen */
  SS.notConfiguredHTML = function () {
    return '<div class="authwrap"><div class="authhdr">' + SS.logo(88) + SS.wordmark(32) + '</div><main class="page"><div class="err">' + SS.t('not_configured') + '</div><p class="muted">shared/config.js</p></main></div>';
  };
  SS.offlineLibHTML = function () {
    return '<div class="authwrap"><div class="authhdr">' + SS.logo(88) + SS.wordmark(32) + '</div><main class="page"><div class="err">' + SS.t('err_lib') + '</div><button class="btn dark big" onclick="location.reload()">' + SS.ic('refresh') + SS.t('retry') + '</button></main></div>';
  };

  /* Language picker HTML (select) */
  SS.langSelect = function (id) {
    const L = SS.LANGS;
    return '<select class="inp" id="' + id + '" aria-label="Language">' + Object.keys(L).map((k) => '<option value="' + k + '"' + (k === SS.lang() ? ' selected' : '') + '>' + L[k] + '</option>').join('') + '</select>';
  };

  SS.MONTH_OPTIONS = function (sel) {
    let h = '<option value="0">' + SS.t('not_set') + '</option>';
    for (let i = 1; i <= 12; i++) h += '<option value="' + i + '"' + (Number(sel) === i ? ' selected' : '') + '>' + SS.MONTHS[i - 1] + '</option>';
    return h;
  };
})();
