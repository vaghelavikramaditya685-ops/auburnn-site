/* Auburnn · draft site behaviour (vanilla JS, no build step) */
(function () {
  "use strict";

  const WA_NUMBER = "916356601955";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const waLink = (text) => "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const nav = $("#nav"), toggle = $("#menuToggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  $$("a", nav).forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Ready-to-wear shop ---------- */
  const PRODUCTS = window.AUBURNN_PRODUCTS || [];
  const RATES = window.AUBURNN_CURRENCY || { INR: { rate: 1, symbol: "₹", locale: "en-IN" } };
  const SHIP = window.AUBURNN_SHIPPING || { customIn: 20, destinations: { IN: { label: "India", short: "India", currency: "INR", transit: [3, 6] } } };
  const DEST = SHIP.destinations;
  const CAT_LABEL = { lehenga: "Lehenga", chaniya: "Chaniya choli", saree: "Saree", anarkali: "Anarkali" };
  const CAT_OUTFIT = { lehenga: "Lehenga / Chaniya choli", chaniya: "Lehenga / Chaniya choli", saree: "Saree blouse", anarkali: "Anarkali / Gown" };
  const STATUS = {
    new: { label: "New in", cls: "badge-new" },
    few: { label: "Only 1 left", cls: "badge-few" },
    sold: { label: "Sold out", cls: "badge-sold" }
  };
  const qv = $("#quickview");
  let qvProduct = null, qvSize = null;
  let activeCat = "all";

  // "Ship to" decides both the delivery estimate and the display currency
  const OLD_CURRENCY = { INR: "IN", USD: "US", CAD: "CA" };
  let shipTo = store.get("auburnn-shipto") || OLD_CURRENCY[store.get("auburnn-currency")] || "IN";
  if (!DEST[shipTo]) shipTo = "IN";
  const currency = () => (RATES[DEST[shipTo].currency] ? DEST[shipTo].currency : "INR");

  const shipSelects = $$("[data-shipto]");
  shipSelects.forEach(sel => {
    sel.innerHTML = Object.entries(DEST).map(([k, d]) =>
      `<option value="${k}">${d.label} · ${(RATES[d.currency] || RATES.INR).symbol}</option>`).join("");
    sel.value = shipTo;
    sel.addEventListener("change", () => setShipTo(sel.value));
  });
  function setShipTo(v) {
    shipTo = DEST[v] ? v : "IN";
    store.set("auburnn-shipto", shipTo);
    shipSelects.forEach(s => (s.value = shipTo));
    renderProducts();
    if (qv.open && qvProduct) { $("#qvPrice").textContent = price(qvProduct.price); updateQuickView(); }
  }

  function price(inr) {
    const cur = currency(), c = RATES[cur] || RATES.INR;
    const s = c.symbol + new Intl.NumberFormat(c.locale, { maximumFractionDigits: 0 }).format(Math.round(inr * c.rate));
    return cur === "INR" ? s : "≈ " + s;
  }

  // Delivery estimates. Working days skip Sundays (studio and couriers run Monday to Saturday).
  function addWorkingDays(date, n) {
    const d = new Date(date);
    for (let added = 0; added < n;) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) added++; }
    return d;
  }
  const shortDate = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const dateRange = (a, b) => a.getMonth() === b.getMonth() ? `${a.getDate()}–${shortDate(b)}` : `${shortDate(a)} – ${shortDate(b)}`;
  function eta(p, custom) {
    const dest = DEST[shipTo];
    const make = custom ? (p.customIn || SHIP.customIn) : (p.shipsIn || 3);
    const dispatch = addWorkingDays(new Date(), make);
    return { make, dest, from: addWorkingDays(dispatch, dest.transit[0]), to: addWorkingDays(dispatch, dest.transit[1]) };
  }

  function renderFilters() {
    const cats = ["all", ...new Set(PRODUCTS.map(p => p.category))];
    $("#filters").innerHTML = cats.map(c =>
      `<button type="button" class="filter" data-cat="${c}" aria-pressed="${c === activeCat}">${c === "all" ? "All" : CAT_LABEL[c] || c}</button>`
    ).join("");
  }

  function renderProducts() {
    const list = PRODUCTS.filter(p => activeCat === "all" || p.category === activeCat);
    $("#productGrid").innerHTML = list.map(p => {
      const st = STATUS[p.status], sold = p.status === "sold";
      return `
      <article class="product${sold ? " is-sold" : ""}" data-id="${p.id}" tabindex="0" role="button" aria-label="View ${p.name}">
        <div class="product-media">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          ${st ? `<span class="badge ${st.cls}">${st.label}</span>` : ""}
        </div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <p class="product-meta">${CAT_LABEL[p.category] || ""} &middot; ${p.sizes.join(", ")} or custom</p>
          <p class="product-ship">${sold ? "Can be made again to order" : `Ships in ${p.shipsIn || 3} days`}</p>
          <div class="product-foot">
            <span class="price">${price(p.price)}</span>
            <span class="product-cta">${sold ? "Make to order" : "View"}</span>
          </div>
        </div>
      </article>`;
    }).join("");
    $("#currencyNote").textContent = (currency() === "INR"
      ? "All prices in Indian Rupees."
      : "Prices shown are approximate conversions; you'll be billed in INR.")
      + (shipTo === "ROW" ? " Shipping to your country is quoted on WhatsApp." : " Shipping is added at checkout.");
  }

  $("#filters").addEventListener("click", e => {
    const b = e.target.closest(".filter");
    if (!b) return;
    activeCat = b.dataset.cat;
    $$(".filter").forEach(f => f.setAttribute("aria-pressed", f === b));
    renderProducts();
  });

  /* ---------- Quick view ---------- */
  function updateQuickView() {
    const p = qvProduct, custom = qvSize === "custom", e = eta(p, custom);
    const making = custom ? `Made to your measurements in about ${Math.ceil(e.make / 6)} weeks` : `Ships in ${e.make} working days`;
    $("#qvEta").innerHTML = `<strong>${making}</strong><br>Arrives around ${dateRange(e.from, e.to)}`
      + (shipTo === "ROW" ? " · shipping quoted on WhatsApp" : "");
    const note = $("#qvCustomNote");
    note.hidden = !custom;
    note.textContent = p.status === "sold"
      ? "This one has sold, but we can make it again in your measurements. You'll fill the measurement form next."
      : "Stitched to the measurements you send in the form. You'll see a try-on video before it ships.";
    const btn = $("#qvReserve");
    if (custom) {
      btn.textContent = "Continue to measurements";
      btn.href = "#measure";
      btn.removeAttribute("target");
    } else {
      btn.textContent = "Reserve on WhatsApp";
      btn.target = "_blank";
      btn.href = waLink(`Hi Auburnn! I'd like to reserve the ${p.name} (${p.id})${qvSize ? ` in size ${qvSize}` : ""}, delivered to ${e.dest.label}. Is it available?`);
    }
    $("#qvAsk").href = waLink(`Hi Auburnn! I have a question about the ${p.name} (${p.id}).`);
  }

  function openQuickView(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    const sold = p.status === "sold";
    qvProduct = p;
    qvSize = sold ? "custom" : p.sizes.length === 1 ? p.sizes[0] : null;
    $("#qvImg").src = p.image; $("#qvImg").alt = p.name;
    $("#qvCat").textContent = (CAT_LABEL[p.category] || "") + (STATUS[p.status] ? " · " + STATUS[p.status].label : "");
    $("#qvName").textContent = p.name;
    $("#qvPrice").textContent = price(p.price);
    $("#qvDesc").textContent = p.description;
    $("#qvId").textContent = p.id;
    $("#qvSizes").innerHTML = p.sizes.map(s =>
      `<label class="chip${sold ? " is-off" : ""}"><input type="radio" name="qvsize" value="${s}"${s === qvSize ? " checked" : ""}${sold ? " disabled" : ""}>${s}</label>`
    ).join("") + `<label class="chip chip-custom"><input type="radio" name="qvsize" value="custom"${qvSize === "custom" ? " checked" : ""}>Custom fit</label>`;
    updateQuickView();
    qv.showModal();
  }

  $("#qvSizes").addEventListener("change", e => { qvSize = e.target.value; updateQuickView(); });
  $("#productGrid").addEventListener("click", e => {
    const card = e.target.closest(".product");
    if (card) openQuickView(card.dataset.id);
  });
  $("#productGrid").addEventListener("keydown", e => {
    const card = e.target.closest(".product");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openQuickView(card.dataset.id); }
  });
  $("#qvClose").addEventListener("click", () => qv.close());
  // "Custom fit": carry the piece into the measurement form
  $("#qvReserve").addEventListener("click", () => {
    if (qvSize !== "custom") return;
    setPiece(qvProduct.id);
    qv.close();
  });
  qv.addEventListener("click", e => { if (e.target === qv) qv.close(); });

  renderFilters();
  renderProducts();

  /* ---------- Measurement form ---------- */
  const form = $("#measureForm");
  const steps = $$(".step", form);
  const stepTabs = $$("#steps li");
  const DRAFT_KEY = "auburnn-measure-draft";
  let current = 0;

  const HINTS = {
    bust: "<strong>1 · Bust</strong> Wrap the tape around the fullest part, level all the way round.",
    underbust: "<strong>2 · Under-bust</strong> Directly under the bust, snug against the ribs.",
    waist: "<strong>3 · Waist</strong> The narrowest part, usually an inch above the navel.",
    shoulder: "<strong>4 · Shoulder</strong> Across the back, from one shoulder tip to the other.",
    armhole: "<strong>5 · Armhole</strong> Loop the tape around the arm where it meets the shoulder.",
    upperarm: "<strong>6 · Upper arm</strong> Around the fullest part, with the arm relaxed.",
    sleeve: "<strong>7 · Sleeve</strong> From the shoulder tip down to where the sleeve should end.",
    blouselen: "<strong>8 · Blouse length</strong> From the shoulder near the neck, over the bust, down to where the blouse ends.",
    neck: "<strong>9 · Front neck</strong> From the base of the neck down to how deep you'd like it.",
    backneck: "<strong>10 · Back neck</strong> From the nape down to how deep you'd like the back.",
    lowwaist: "<strong>11 · Lower waist</strong> Where the lehenga or skirt will sit, usually at or just below the navel.",
    hip: "<strong>12 · Hip</strong> Around the fullest part of the hips and seat.",
    thigh: "<strong>13 · Thigh</strong> Around the top of the thigh. Only needed for fitted bottoms.",
    fulllen: "<strong>14 · Full length</strong> From the lower waist to the floor, wearing your event heels.",
    kurtalen: "<strong>15 · Kurta length</strong> From the shoulder to where the kurta should end."
  };
  const defaultHint = $("#guideHint").innerHTML;

  // Highlight the matching line on the dress-form figure
  form.addEventListener("focusin", e => {
    const f = e.target.closest(".m-field");
    $$(".m-line").forEach(l => l.classList.remove("is-on"));
    if (!f) return;
    const key = f.dataset.m;
    const line = $(`.m-line[data-m="${key}"]`);
    if (line) line.classList.add("is-on");
    $("#guideHint").innerHTML = HINTS[key] || defaultHint;
  });

  function showStep(i) {
    current = i;
    steps.forEach((s, n) => s.classList.toggle("is-active", n === i));
    stepTabs.forEach((t, n) => {
      t.classList.toggle("is-active", n === i);
      t.classList.toggle("is-done", n < i);
    });
    if (i === 3) buildReview();
    const top = form.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  }

  function validateStep(i) {
    const step = steps[i];
    step.classList.add("was-checked");
    let ok = true;
    if (i === 1) {
      const chips = $("#outfitChips");
      const any = $$('input[name="outfit"]:checked').length > 0;
      chips.classList.toggle("is-invalid", !any);
      if (!any) ok = false;
    }
    const fields = $$("input, select, textarea", step).filter(el => !el.closest("[hidden]"));
    const bad = fields.find(el => !el.checkValidity());
    if (bad) { ok = false; bad.reportValidity(); bad.focus(); }
    else if (!ok) { $("#outfitChips").scrollIntoView({ block: "center", behavior: "smooth" }); }
    return ok;
  }

  form.addEventListener("click", e => {
    if (e.target.matches("[data-next]")) { if (validateStep(current)) showStep(current + 1); }
    if (e.target.matches("[data-prev]")) showStep(current - 1);
  });

  // Hide lower-body fields when only a saree blouse is being made
  function syncLowerGroup() {
    const picked = $$('input[name="outfit"]:checked');
    const needsLower = picked.length === 0 || picked.some(p => p.hasAttribute("data-lower"));
    $("#lowerGroup").hidden = !needsLower;
    if (picked.length) $("#outfitChips").classList.remove("is-invalid");
  }

  function syncUnits() {
    const unit = (form.querySelector('input[name="unit"]:checked') || {}).value || "in";
    $$(".unit", form).forEach(u => (u.textContent = unit));
  }

  form.addEventListener("change", e => {
    if (e.target.name === "outfit") syncLowerGroup();
    if (e.target.name === "unit") syncUnits();
  });

  // Reference image thumbnails (stay on this device in the draft)
  $("#refFiles").addEventListener("change", e => {
    const box = $("#thumbs");
    box.innerHTML = "";
    Array.from(e.target.files).slice(0, 8).forEach(file => {
      const img = document.createElement("img");
      img.alt = file.name;
      img.src = URL.createObjectURL(file);
      box.appendChild(img);
    });
  });

  // A ready-to-wear piece ordered in "Custom fit" rides along with the form
  function setPiece(id) {
    $("#pieceInput").value = id || "";
    const p = PRODUCTS.find(x => x.id === id);
    const want = p && CAT_OUTFIT[p.category];
    if (want) $$('input[name="outfit"]').forEach(c => { if (c.value === want) c.checked = true; });
    syncLowerGroup();
    syncPiece();
    saveDraft();
  }
  function syncPiece() {
    const p = PRODUCTS.find(x => x.id === $("#pieceInput").value);
    $("#pieceBanner").hidden = !p;
    if (!p) return;
    $("#pieceImg").src = p.image;
    $("#pieceName").textContent = `${p.name} (${p.id})`;
  }
  $("#pieceClear").addEventListener("click", () => setPiece(""));

  // Save progress so clients can finish later
  function collect() {
    const data = {};
    new FormData(form).forEach((v, k) => {
      if (v instanceof File) return;
      if (k === "outfit") { (data.outfit = data.outfit || []).push(v); }
      else data[k] = v;
    });
    return data;
  }
  function saveDraft() { store.set(DRAFT_KEY, collect()); }
  function restoreDraft() {
    const d = store.get(DRAFT_KEY);
    if (!d) return;
    Object.entries(d).forEach(([k, v]) => {
      if (k === "outfit") {
        $$('input[name="outfit"]').forEach(c => (c.checked = v.includes(c.value)));
      } else if (k === "unit") {
        const r = form.querySelector(`input[name="unit"][value="${v}"]`);
        if (r) r.checked = true;
      } else if (k !== "consent") {
        const el = form.elements[k];
        if (el && "value" in el) el.value = v;
      }
    });
  }
  form.addEventListener("input", saveDraft);
  form.addEventListener("change", saveDraft);

  const LABELS = {
    name: "Name", email: "Email", phone: "WhatsApp", country: "Country", city: "City", height: "Height",
    piece: "Custom fit of", neckline: "Neckline", sleeves: "Sleeves", backstyle: "Back style",
    occasion: "Occasion", eventDate: "Event date", budget: "Budget", usualSize: "Usual size", idea: "Idea",
    bust: "Bust", underbust: "Under-bust", waist: "Waist", shoulder: "Shoulder", armhole: "Armhole",
    upperarm: "Upper arm", sleeve: "Sleeve length", blouselen: "Blouse length", frontneck: "Front neck",
    backneck: "Back neck", lowwaist: "Lower waist", hip: "Hip", thigh: "Thigh", fulllen: "Full length",
    kurtalen: "Kurta length", fit: "Fit", padding: "Padding", closure: "Closure"
  };
  const GROUPS = {
    "About you": ["name", "email", "phone", "country", "city", "height"],
    "Your outfit": ["piece", "outfit", "neckline", "sleeves", "backstyle", "occasion", "eventDate", "budget", "usualSize", "idea"],
    "Measurements": ["bust", "underbust", "waist", "shoulder", "armhole", "upperarm", "sleeve", "blouselen", "frontneck", "backneck", "lowwaist", "hip", "thigh", "fulllen", "kurtalen"],
    "Fit preferences": ["fit", "padding", "closure"]
  };
  const isMeasure = k => GROUPS.Measurements.includes(k);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function fmtDate(v) {
    if (!v) return v;
    const d = new Date(v + "T00:00:00");
    return isNaN(d) ? v : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  function pieceText(id) {
    const p = PRODUCTS.find(x => x.id === id);
    return p ? `${p.name} (${p.id})` : id;
  }
  function rows(data) {
    const unit = data.unit || "in";
    const out = {};
    Object.entries(GROUPS).forEach(([g, keys]) => {
      out[g] = keys
        .filter(k => data[k] && (k !== "outfit" ? String(data[k]).trim() : data[k].length))
        .filter(k => !(isMeasure(k) && $("#lowerGroup").hidden && ["lowwaist", "hip", "thigh", "fulllen", "kurtalen"].includes(k)))
        .map(k => [k === "outfit" ? "Making" : LABELS[k],
          k === "outfit" ? data[k].join(", ") : k === "eventDate" ? fmtDate(data[k]) : k === "piece" ? pieceText(data[k])
            : isMeasure(k) ? data[k] + " " + unit : data[k]]);
    });
    return out;
  }

  function buildReview() {
    const r = rows(collect());
    $("#review").innerHTML = Object.entries(r).map(([g, list]) => `
      <section><h4>${g}</h4>
        ${list.length ? `<dl>${list.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : `<p class="empty">Nothing added</p>`}
      </section>`).join("");
  }

  $("#sendWhatsApp").addEventListener("click", () => {
    const r = rows(collect());
    let msg = "Hi Auburnn! Here are my details for a custom order:\n";
    Object.entries(r).forEach(([g, list]) => {
      if (!list.length) return;
      msg += `\n*${g}*\n` + list.map(([k, v]) => `${k}: ${v}`).join("\n") + "\n";
    });
    window.open(waLink(msg), "_blank", "noopener");
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!validateStep(3)) return;
    // PRODUCTION: send collect() + reference files to email / Google Sheet / CRM here
    // (e.g. Formspree, Google Apps Script, or the store's backend).
    steps.forEach(s => s.classList.remove("is-active"));
    $("#steps").hidden = true;
    $("#pieceBanner").hidden = true;
    $("#formDone").hidden = false;
    store.del(DRAFT_KEY);
  });

  $("#newForm").addEventListener("click", () => {
    form.reset();
    $("#pieceInput").value = "";   // hidden inputs keep their value through reset()
    syncPiece();
    $("#thumbs").innerHTML = "";
    $$(".step", form).forEach(s => s.classList.remove("was-checked"));
    $("#formDone").hidden = true;
    $("#steps").hidden = false;
    syncLowerGroup(); syncUnits();
    showStep(0);
  });

  restoreDraft();
  syncPiece();
  syncLowerGroup();
  syncUnits();

  /* ---------- Consultation booking ---------- */
  const booking = $("#booking"), bookForm = $("#bookForm"), tzSel = $("#bookTz");
  const IST = "Asia/Kolkata";
  // Slot start times in IST. Early and late ones are video only: they land in
  // the evening / morning for clients in North America and the UK.
  const STUDIO_SLOTS = ["11:00", "12:30", "14:30", "16:00", "17:30"];
  const VIDEO_SLOTS = ["08:00", "09:30", ...STUDIO_SLOTS, "19:30", "21:00", "22:00"];
  const ZONES = [
    [IST, "India (IST)"], ["America/Toronto", "Toronto / New York"], ["America/Chicago", "Chicago"],
    ["America/Vancouver", "Vancouver / Los Angeles"], ["Europe/London", "London"], ["Asia/Dubai", "Dubai"],
    ["Asia/Singapore", "Singapore"], ["Australia/Sydney", "Sydney"]
  ];
  let localTz = IST;
  try { localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || IST; } catch (e) { /* keep IST */ }
  if (localTz === "Asia/Calcutta") localTz = IST;   // older browsers report India's zone by its old name
  const zoneList = ZONES.some(z => z[0] === localTz) ? ZONES : [[localTz, localTz.split("/").pop().replace(/_/g, " ")], ...ZONES];
  tzSel.innerHTML = zoneList.map(([z, l]) => `<option value="${z}">${l}${z === localTz ? " · your time" : ""}</option>`).join("");
  tzSel.value = localTz;

  const ymdIn = (d, tz) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const timeIn = (d, tz) => d.toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  const dayIn = (d, tz) => d.toLocaleDateString("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" });
  const shiftDay = (ymd, n) => { const d = new Date(ymd + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const bookMode = () => (bookForm.querySelector('input[name="mode"]:checked') || {}).value || "video";
  const zoneName = () => tzSel.options[tzSel.selectedIndex].text.replace(" · your time", "");

  // Show the slots that fall on the chosen date in the client's own time zone
  function buildSlots() {
    const date = $("#bookDate").value, tz = tzSel.value, studio = bookMode() === "studio";
    const box = $("#bookSlots");
    const prev = (box.querySelector("input:checked") || {}).value;
    $("#slotNote").textContent = tz === IST ? "" : `Times in ${zoneName()}, with Indian time underneath.`;
    if (!date) { box.innerHTML = `<p class="fine-print">Pick a date to see times.</p>`; return; }
    const soon = Date.now() + 3 * 3600e3, list = [];
    [-1, 0, 1].forEach(offset => {
      const istDay = shiftDay(date, offset);
      if (new Date(istDay + "T12:00:00+05:30").getUTCDay() === 0) return;   // closed Sundays
      (studio ? STUDIO_SLOTS : VIDEO_SLOTS).forEach(t => {
        const at = new Date(`${istDay}T${t}:00+05:30`);
        if (ymdIn(at, tz) === date && at.getTime() > soon) list.push(at);
      });
    });
    list.sort((a, b) => a - b);
    box.innerHTML = list.length ? list.map(at => {
      const iso = at.toISOString();
      const ist = tz === IST ? "" : `<small>${timeIn(at, IST)} IST${ymdIn(at, IST) !== date ? ", " + dayIn(at, IST) : ""}</small>`;
      return `<label class="slot"><input type="radio" name="slot" value="${iso}"${iso === prev ? " checked" : ""}><strong>${timeIn(at, tz)}</strong>${ist}</label>`;
    }).join("") : `<p class="fine-print">No slots that day. The studio is closed on Sundays, so try another date.</p>`;
  }

  function openBooking(type, mode) {
    $("#bookDone").hidden = true;
    if (type) $$('input[name="type"]', bookForm).forEach(r => (r.checked = r.value === type));
    if (mode) { const m = bookForm.querySelector(`input[name="mode"][value="${mode}"]`); if (m) m.checked = true; }
    const today = ymdIn(new Date(), tzSel.value), dateEl = $("#bookDate");
    dateEl.min = today;
    if (!dateEl.value || dateEl.value < today) dateEl.value = shiftDay(today, 1);
    const d = collect();   // reuse anything already typed into the measurement form
    if (!bookForm.elements.name.value && d.name) bookForm.elements.name.value = d.name;
    if (!bookForm.elements.phone.value && d.phone) bookForm.elements.phone.value = d.phone;
    buildSlots();
    booking.showModal();
  }

  // Any link or button with data-book opens the form; its WhatsApp href is the no-JS fallback
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-book]");
    if (!t) return;
    e.preventDefault();
    openBooking(t.dataset.book, t.dataset.bookMode);
  });

  bookForm.addEventListener("change", e => {
    if (["mode", "date", "tz"].includes(e.target.name)) buildSlots();
    if (e.target.name === "type") $("#bookType").classList.remove("is-invalid");
    if (e.target.name === "slot") $("#bookSlots").classList.remove("is-invalid");
  });

  bookForm.addEventListener("submit", e => {
    e.preventDefault();
    const f = bookForm.elements;
    const type = (bookForm.querySelector('input[name="type"]:checked') || {}).value;
    const slot = (bookForm.querySelector('input[name="slot"]:checked') || {}).value;
    $("#bookType").classList.toggle("is-invalid", !type);
    $("#bookSlots").classList.toggle("is-invalid", !slot);
    if (!type) { $("#bookType").scrollIntoView({ block: "center", behavior: "smooth" }); return; }
    if (!f.date.checkValidity()) { f.date.reportValidity(); return; }
    if (!slot) { $("#bookSlots").scrollIntoView({ block: "center", behavior: "smooth" }); return; }
    const bad = [f.name, f.phone].find(el => !el.checkValidity());
    if (bad) { bad.reportValidity(); return; }

    const at = new Date(slot), tz = f.tz.value;
    const when = tz === IST
      ? `${dayIn(at, IST)}, ${timeIn(at, IST)} IST`
      : `${dayIn(at, tz)}, ${timeIn(at, tz)} (${zoneName()}) = ${dayIn(at, IST)}, ${timeIn(at, IST)} IST`;
    const notes = f.notes.value.trim();
    const msg = "Hi Auburnn! I'd like to book a consultation.\n"
      + `\n*For:* ${type}`
      + `\n*How:* ${bookMode() === "studio" ? "Studio visit, Prahladnagar" : "Video call on WhatsApp"}`
      + `\n*When:* ${when}`
      + `\n*Name:* ${f.name.value.trim()}`
      + `\n*WhatsApp:* ${f.phone.value.trim()}`
      + (notes ? `\n*Notes:* ${notes}` : "");
    window.open(waLink(msg), "_blank", "noopener");
    $("#bookDone").hidden = false;
  });

  $("#bookClose").addEventListener("click", () => booking.close());
  booking.addEventListener("click", e => { if (e.target === booking) booking.close(); });
})();
