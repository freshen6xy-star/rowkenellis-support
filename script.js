
// Rowkenellis Support Centre - Supabase connection

const SUPABASE_URL = "https://rmnubfzuehypgsuziufm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NSU-LKZSh9kfdD4lUbgbEA_NX7OckI8";

const form = document.getElementById("supportForm");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitRequest");

document.getElementById("year").textContent = new Date().getFullYear();

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".topbar nav");

if (menuToggle && nav) {
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
}

// Connect to Supabase
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Submit support request
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const contact_email = document.getElementById("contactEmail").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!contact_email || !subject || !message) {
    formMessage.textContent = "Please complete all fields.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  formMessage.textContent = "";

  try {
    const { error } = await supabaseClient
      .from("support_requests")
      .insert([{ contact_email, subject, message }]);

    if (error) throw error;

    form.reset();
    formMessage.textContent = "Your support request was sent successfully.";
  } catch (error) {
    console.error(error);
    formMessage.textContent = "Request could not be sent. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send support request";
  }
});
