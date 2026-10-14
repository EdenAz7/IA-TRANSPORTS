/* Page Avis clients : lecture/écriture via Google Apps Script (Google Sheets) */
(() => {
  // 1) Collez ici l'URL de déploiement de votre Apps Script (voir avis-apps-script.gs)
  const REVIEWS_URL = "";
  const PER_PAGE = 12;

  const grid = document.getElementById("reviews");
  if (!grid) return;
  const statusEl = document.getElementById("reviews-status");
  const pager = document.getElementById("pager");
  const summary = document.getElementById("rating-summary");
  let reviews = [], page = 1;

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stars = n => "★".repeat(n) + '<span class="off">' + "★".repeat(5 - n) + "</span>";
  const fmtDate = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ""); return m ? `${m[3]}/${m[2]}/${m[1]}` : esc(iso); };

  // Aperçu local uniquement : ajoutez ?demo=1 à l'URL. Ne s'affiche jamais en production par défaut.
  const DEMO = [
    { name: "Prénom N.", date: "2026-01-10", rating: 5, comment: "Exemple d'avis (aperçu de la mise en page uniquement)." },
    { name: "Prénom N.", date: "2026-01-08", rating: 4, comment: "Exemple d'avis (aperçu de la mise en page uniquement)." },
    { name: "Prénom N.", date: "2026-01-05", rating: 5, comment: "Exemple d'avis (aperçu de la mise en page uniquement)." }
  ];

  function render() {
    const start = (page - 1) * PER_PAGE;
    grid.innerHTML = reviews.slice(start, start + PER_PAGE).map(r => `
      <article class="review">
        <div class="stars" role="img" aria-label="${r.rating} sur 5">${stars(r.rating)}</div>
        <div><div class="review-name">${esc(r.name)}</div><div class="review-date">a déménagé le ${fmtDate(r.date)}</div></div>
        <blockquote>« ${esc(r.comment)} »</blockquote>
      </article>`).join("");

    const pages = Math.ceil(reviews.length / PER_PAGE);
    pager.innerHTML = "";
    if (pages > 1) {
      const btn = (label, p, opts = {}) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = label; b.disabled = !!opts.disabled;
        if (opts.current) b.setAttribute("aria-current", "page");
        b.addEventListener("click", () => { page = p; render(); grid.scrollIntoView({ behavior: "smooth", block: "start" }); });
        pager.appendChild(b);
      };
      btn("Précédent", page - 1, { disabled: page === 1 });
      for (let i = 1; i <= pages; i++) btn(String(i), i, { current: i === page });
      btn("Suivant", page + 1, { disabled: page === pages });
    }
  }

  function show(list) {
    reviews = list.filter(r => r && r.comment).map(r => ({ ...r, rating: Math.min(5, Math.max(1, Number(r.rating) || 5)) }));
    if (!reviews.length) { statusEl.textContent = "Aucun avis publié pour le moment. Soyez le premier à partager votre expérience !"; return; }
    statusEl.hidden = true;
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    document.getElementById("avg-score").textContent = avg.toFixed(1).replace(".", ",");
    document.getElementById("avg-stars").innerHTML = stars(Math.round(avg));
    document.getElementById("count-reviews").textContent = reviews.length;
    summary.hidden = false;
    render();
  }

  if (new URLSearchParams(location.search).has("demo")) show(DEMO);
  else if (!REVIEWS_URL) statusEl.textContent = "Aucun avis publié pour le moment. Soyez le premier à partager votre expérience !";
  else fetch(REVIEWS_URL).then(r => r.json()).then(d => show(d.reviews || []))
    .catch(() => { statusEl.textContent = "Les avis ne peuvent pas être affichés pour le moment."; });

  /* ----- Formulaire d'avis ----- */
  const form = document.getElementById("avis-form");
  const msg = document.getElementById("avis-message");
  const btn = document.getElementById("avis-submit");
  const d = document.getElementById("a-date");
  if (d) { const t = new Date(); d.max = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`; }

  form && form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!REVIEWS_URL) { msg.className = "form-status error"; msg.textContent = "L'envoi d'avis n'est pas encore activé."; return; }
    btn.disabled = true; msg.className = "form-status"; msg.textContent = "Envoi en cours…";
    try {
      await fetch(REVIEWS_URL, { method: "POST", body: new FormData(form) });
      form.reset();
      msg.className = "form-status ok";
      msg.textContent = "Merci ! Votre avis sera publié après vérification.";
    } catch (err) {
      msg.className = "form-status error";
      msg.textContent = "L'avis n'a pas pu être envoyé. Réessayez dans un instant.";
    }
    btn.disabled = false;
  });
})();
