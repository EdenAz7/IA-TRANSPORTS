document.addEventListener("DOMContentLoaded", () => {

  /* ===== Lien actif dans la navigation ===== */
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a => {
    if (a.getAttribute("href") === page) a.setAttribute("aria-current", "page");
  });

  /* ===== Menu mobile ===== */
  const burger = document.querySelector("[data-burger]");
  const drawer = document.querySelector("[data-drawer]");
  const closeBtn = document.querySelector("[data-close]");

  const openDrawer = () => {
    drawer.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    closeBtn && closeBtn.focus();
  };
  const closeDrawer = () => {
    drawer.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  };

  if (burger && drawer) {
    burger.addEventListener("click", openDrawer);
    closeBtn && closeBtn.addEventListener("click", closeDrawer);
    drawer.addEventListener("click", e => { if (e.target === drawer) closeDrawer(); });
    drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", closeDrawer));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  }

  /* ===== Formulaire → Google Sheets ===== */
  const form = document.getElementById("form");
  const status = document.getElementById("message");
  const submitBtn = document.getElementById("submit-button");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4hvoOO8m9F0zn4RN5TTEBgr9u0qWV2R-EqpzPj57I7rj_0r542x9Fnr89d_5a357o/exec";

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      submitBtn.disabled = true;
      status.className = "form-status";
      status.textContent = "Envoi de votre demande…";

      try {
        await fetch(SCRIPT_URL, { method: "POST", body: new FormData(form) });
        window.location.href = "merci.html";
      } catch (err) {
        console.error(err);
        status.className = "form-status error";
        status.textContent = "La demande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez, ou appelez-nous.";
        submitBtn.disabled = false;
      }
    });
  }

  /* ===== Date minimum = aujourd'hui ===== */
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const t = new Date();
    dateInput.min = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }

  /* ===== Année du copyright ===== */
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
});
