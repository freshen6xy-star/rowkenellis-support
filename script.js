// Paste your published Google Form's EMBED URL below.
// Example format: https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true
const GOOGLE_FORM_EMBED_URL = "";

const formFrame = document.getElementById("supportForm");
const setupNotice = document.getElementById("formSetupNotice");

if (GOOGLE_FORM_EMBED_URL.trim()) {
  formFrame.src = GOOGLE_FORM_EMBED_URL.trim();
  formFrame.hidden = false;
  setupNotice.hidden = true;
}

document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".topbar nav");
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});
