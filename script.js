// Rowkenellis Support Centre - Supabase authentication and support tickets
const SUPABASE_URL = "https://rmnubfzuehypgsuziufm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NSU-LKZSh9kfdD4lUbgbEA_NX7OckI8";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const authScreen = document.getElementById("authScreen");
const appContent = document.getElementById("appContent");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authDescription = document.getElementById("authDescription");
const authSubmit = document.getElementById("authSubmit");
const authMessage = document.getElementById("authMessage");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const forgotPassword = document.getElementById("forgotPassword");
let authMode = "login";

document.getElementById("year").textContent = new Date().getFullYear();

function setAuthMode(mode) {
  authMode = mode;
  authMessage.textContent = "";
  const password = document.getElementById("authPassword");
  if (mode === "signup") {
    authTitle.textContent = "Create your account";
    authDescription.textContent = "Sign up with your email address to access your Rowkenellis support dashboard.";
    authSubmit.textContent = "Create account";
    password.autocomplete = "new-password";
    showSignup.hidden = true;
    showLogin.hidden = false;
    forgotPassword.hidden = true;
  } else {
    authTitle.textContent = "Welcome back";
    authDescription.textContent = "Log in to view your support dashboard and manage your requests.";
    authSubmit.textContent = "Log in";
    password.autocomplete = "current-password";
    showSignup.hidden = false;
    showLogin.hidden = true;
    forgotPassword.hidden = false;
  }
}
showSignup.addEventListener("click", () => setAuthMode("signup"));
showLogin.addEventListener("click", () => setAuthMode("login"));

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  authSubmit.disabled = true;
  authMessage.textContent = "";

  try {
    if (authMode === "signup") {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) {
        authMessage.textContent = "Account created. Opening your dashboard...";
        await showApp(data.session.user);
      } else {
        authMessage.textContent = "Account created. Check your email to confirm your account, then log in.";
      }
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await showApp(data.user);
    }
  } catch (error) {
    authMessage.textContent = error.message || "Authentication failed. Please try again.";
  } finally {
    authSubmit.disabled = false;
  }
});

forgotPassword.addEventListener("click", async () => {
  const email = document.getElementById("authEmail").value.trim();
  if (!email) {
    authMessage.textContent = "Enter your email address first, then choose Forgot password.";
    return;
  }
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) throw error;
    authMessage.textContent = "If an account exists for this email, a password reset link will be sent.";
  } catch (error) {
    authMessage.textContent = error.message || "Could not request a password reset.";
  }
});

async function showApp(user) {
  authScreen.hidden = true;
  appContent.hidden = false;
  document.getElementById("signedInEmail").textContent = user.email || "your account";
  document.getElementById("contactEmail").value = user.email || "";
  await loadTickets(user.id);
}

async function showLoginScreen() {
  appContent.hidden = true;
  authScreen.hidden = false;
  setAuthMode("login");
}

async function loadTickets(userId) {
  const ticketList = document.getElementById("ticketList");
  ticketList.textContent = "Loading your requests...";
  const { data, error } = await supabaseClient
    .from("support_requests")
    .select("id, subject, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    ticketList.textContent = "Could not load requests. Please refresh the page.";
    console.error(error);
    return;
  }
  if (!data.length) {
    ticketList.textContent = "You haven't submitted any support requests yet.";
    return;
  }

  ticketList.replaceChildren();
  data.forEach(ticket => {
    const item = document.createElement("article");
    item.className = "ticket-item";
    const title = document.createElement("strong");
    title.textContent = ticket.subject;
    const status = document.createElement("div");
    status.textContent = "Status: " + ticket.status;
    const date = document.createElement("div");
    date.className = "ticket-meta";
    date.textContent = "Submitted: " + new Date(ticket.created_at).toLocaleString();
    item.append(title, status, date);
    ticketList.appendChild(item);
  });
}

document.getElementById("supportForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData.session && sessionData.session.user;
  if (!user) {
    await showLoginScreen();
    return;
  }

  const contact_email = document.getElementById("contactEmail").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();
  const formMessage = document.getElementById("formMessage");
  const submitButton = document.getElementById("submitRequest");

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  formMessage.textContent = "";

  try {
    const { error } = await supabaseClient.from("support_requests").insert([{
      user_id: user.id,
      contact_email,
      subject,
      message
    }]);
    if (error) throw error;
    document.getElementById("supportForm").reset();
    document.getElementById("contactEmail").value = user.email || "";
    formMessage.textContent = "Your support request was sent successfully.";
    await loadTickets(user.id);
  } catch (error) {
    console.error(error);
    formMessage.textContent = "Request could not be sent. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send support request";
  }
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  await showLoginScreen();
});

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

// Restore an existing login after a refresh.
supabaseClient.auth.getSession().then(({ data, error }) => {
  if (error) console.error(error);
  if (data.session) showApp(data.session.user);
  else showLoginScreen();
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (session) showApp(session.user);
  else showLoginScreen();
});
