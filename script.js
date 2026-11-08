const names = new Intl.DisplayNames(["en"], { type: "region" });
const categories = [
  { id: "free", title: "Visa free access", color: "var(--free)", codes: ["AO", "BB", "BJ", "BS", "BW", "BZ", "CD", "DM", "EC", "FJ", "FM", "GH", "GM", "HK", "HT", "IR", "KN", "LS", "MU", "MW", "MY", "MZ", "NA", "PH", "PS", "RW", "SC", "SG", "SZ", "TT", "TZ", "UG", "VC", "VU", "ZA", "ZM"] },
  { id: "voa", title: "Visa on arrival", color: "var(--voa)", codes: ["BD", "BI", "BO", "CV", "DJ", "ET", "GW", "JO", "KH", "KM", "LC", "LK", "MG", "MO", "MR", "MV", "NG", "NI", "PW", "SN", "TL", "TV", "WS"] },
  { id: "eta", title: "eTA", color: "var(--eta)", codes: ["CI", "KE"] },
  { id: "evisa", title: "Visa online (eVisa)", color: "var(--evisa)", codes: ["AE", "AG", "AL", "AU", "BF", "BH", "BT", "CM", "CO", "CU", "GA", "GE", "GN", "GQ", "ID", "IN", "IQ", "KG", "KR", "KZ", "LY", "MN", "OM", "PG", "PK", "QA", "RU", "SL", "SO", "SS", "ST", "SV", "SY", "TG", "TH", "TJ", "VN"] },
  { id: "req", title: "Visa required", color: "var(--req)", codes: ["AD", "AF", "AM", "AR", "AT", "AZ", "BA", "BE", "BG", "BN", "BR", "BY", "CA", "CF", "CG", "CH", "CL", "CN", "CR", "CY", "CZ", "DE", "DK", "DO", "DZ", "EE", "EG", "ER", "ES", "FI", "FR", "GB", "GD", "GR", "GT", "GY", "HN", "HR", "HU", "IE", "IL", "IS", "IT", "JM", "JP", "KI", "KP", "KW", "LA", "LB", "LI", "LR", "LT", "LU", "LV", "MA", "MC", "MD", "ME", "MH", "MK", "ML", "MM", "MT", "MX", "NE", "NL", "NO", "NP", "NR", "NZ", "PA", "PE", "PL", "PT", "PY", "RO", "RS", "SA", "SB", "SD", "SE", "SI", "SK", "SM", "SR", "TD", "TM", "TN", "TO", "TR", "TW", "UA", "US", "UY", "UZ", "VA", "VE", "XK", "YE"] },
].map(c => ({
  ...c,
  countries: c.codes.map(code => {
    let name = code;
    try { name = names.of(code); } catch (e) {}
    return [code.toLowerCase(), name];
  }).sort((a, b) => a[1].localeCompare(b[1]))
}));

const SHORT = {
  free: "Visa free", voa: "Visa on arrival", eta: "eTA", evisa: "Apply online (eVisa)", req: "Visa required"
};
const meterEl = document.getElementById("meter");
const legendEl = document.getElementById("legend");
const gridEl = document.getElementById("grid");
const showingEl = document.getElementById("showing");
const searchEl = document.getElementById("search");
const typeEl = document.getElementById("type");
let active = "all";

// one flat list of every destination with its category
const all = categories
  .flatMap(c => c.countries.map(([code, name]) => ({ code, name, cat: c })))
  .sort((a, b) => a.name.localeCompare(b.name));

function renderHeader() {
  meterEl.innerHTML = categories.map(c =>
    `<button class="seg ${active === c.id ? "on" : ""}" data-id="${c.id}" style="--c:${c.color};--n:${c.countries.length}" title="${c.title}: ${c.countries.length}">${c.countries.length > 12 ? c.countries.length : ""}</button>`).join("");
  meterEl.classList.toggle("filtered", active !== "all");
  const pills = [{ id: "all", title: "All destinations", n: all.length }, ...categories.map(c => ({ id: c.id, title: c.title, n: c.countries.length, color: c.color }))];
  renderSelect();
  legendEl.innerHTML = pills.map(p =>
    `<button class="pill ${active === p.id ? "on" : ""}" data-id="${p.id}" ${p.color ? `style="--c:${p.color}"` : ""}>${p.color ? "<i></i>" : ""}${p.title} <b>${p.n}</b></button>`).join("");
}

function renderSelect() {
  if (!typeEl.options.length) {
    typeEl.innerHTML = [`<option value="all">All visa types (${all.length})</option>`,
      ...categories.map(c => `<option value="${c.id}">${c.title} (${c.countries.length})</option>`)].join("");
  }
  typeEl.value = active;
}

function renderGrid() {
  const q = searchEl.value.trim().toLowerCase();
  const list = all.filter(d => (active === "all" || d.cat.id === active) && d.name.toLowerCase().includes(q));
  gridEl.innerHTML = list.length
    ? list.map(d => `<li class="tile" style="--c:${d.cat.color}">
        <img src="https://flagcdn.com/w40/${d.code}.png" alt="" loading="lazy">
        <div><strong>${d.name}</strong><span>${SHORT[d.cat.id]}</span></div></li>`).join("")
    : `<li class="empty">No country matches that search.</li>`;
  showingEl.textContent = `Showing ${list.length} of ${all.length} destinations`;
}

function setActive(id) {
  active = active === id ? "all" : id;
  renderHeader();
  renderGrid();
}
meterEl.addEventListener("click", e => { const b = e.target.closest(".seg"); if (b) setActive(b.dataset.id); });
legendEl.addEventListener("click", e => {
  const b = e.target.closest(".pill");
  if (!b) return;
  active = b.dataset.id;
  renderHeader();
  renderGrid();
});
typeEl.addEventListener("change", () => {
  active = typeEl.value;
  renderHeader();
  renderGrid();
});
searchEl.addEventListener("input", renderGrid);

// light / dark theme (light is the default, choice saved in localStorage)
const themeBtn = document.getElementById("themeToggle");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toDark = theme === "light";
  themeBtn.querySelector(".icon").textContent = toDark ? "🌙" : "☀️";
  themeBtn.querySelector(".label").textContent = toDark ? "Dark" : "Light";
  const text = toDark ? "Switch to dark mode" : "Switch to light mode";
  themeBtn.setAttribute("aria-label", text);
  themeBtn.title = text;
}
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});
applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

renderHeader();
renderGrid();
