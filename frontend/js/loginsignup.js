// Regex validasi email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// LOGIN PAGE
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const rememberEl = document.getElementById("remember");
  const loginBtn = document.getElementById("loginBtn");

  // restore email kalau remember
  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("synclint_remember_email");
    if (saved) {
      emailEl.value = saved;
      rememberEl.checked = true;
    }
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (rememberEl.checked) {
      localStorage.setItem("synclint_remember_email", emailEl.value.trim());
    } else {
      localStorage.removeItem("synclint_remember_email");
    }

    // simpan data user ke session
    sessionStorage.setItem(
      "synclint_session",
      JSON.stringify({ email: emailEl.value })
    );

    // redirect ke home
    window.location.href = "home.html";
  });
}

// SIGNUP PAGE
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  const emailEl = document.getElementById("email");
  const userEl = document.getElementById("username");
  const passEl = document.getElementById("password");
  const confirmEl = document.getElementById("confirm");
  const signupBtn = document.getElementById("signupBtn");

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (
      emailEl.value.trim() === "" ||
      userEl.value.trim() === "" ||
      passEl.value.trim() === "" ||
      confirmEl.value.trim() === "" ||
      passEl.value !== confirmEl.value
    ) {
      alert("Mohon isi semua data dengan benar.");
      return;
    }

    // simpan user ke localStorage (contoh sederhana)
    localStorage.setItem(
      "synclint_user",
      JSON.stringify({
        email: emailEl.value,
        username: userEl.value,
        password: passEl.value,
      })
    );

    // redirect ke login setelah registrasi
    window.location.href = "login.html";
  });
}

// HOME PAGE
let workspaces = [
  {
    name: "Workspace 1",
    created: "20 Juli 2025",
    lastSeen: "100 hari yang lalu",
  },
  {
    name: "Workspace 2",
    created: "22 Juli 2025",
    lastSeen: "5 hari yang lalu",
  },
];

// Render grid
function renderWorkspaces() {
  const grid = document.getElementById("workspaceGrid");
  if (!grid) return;
  grid.innerHTML = "";
  workspaces.forEach((ws) => {
    const card = document.createElement("div");
    card.className = "workspace-card";
    card.innerHTML = `
      <div>
        <h4>${ws.name}</h4>
        <p>Dibuat: ${ws.created}</p>
        <p>Terakhir dilihat: ${ws.lastSeen}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}
renderWorkspaces();

// Modal logic
const openModalBtn = document.getElementById("openModalBtn");
const workspaceModal = document.getElementById("workspaceModal");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const createWorkspaceBtn = document.getElementById("createWorkspaceBtn");
const workspaceNameInput = document.getElementById("workspaceName");

if (openModalBtn) {
  openModalBtn.addEventListener("click", () => {
    workspaceModal.style.display = "flex";
  });
}
if (cancelModalBtn) {
  cancelModalBtn.addEventListener("click", () => {
    workspaceModal.style.display = "none";
    workspaceNameInput.value = "";
  });
}
if (createWorkspaceBtn) {
  createWorkspaceBtn.addEventListener("click", () => {
    const name = workspaceNameInput.value.trim();
    if (!name) {
      alert("Nama workspace tidak boleh kosong!");
      return;
    }
    workspaces.push({
      name,
      created: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      lastSeen: "Baru saja",
    });
    renderWorkspaces();
    workspaceModal.style.display = "none";
    workspaceNameInput.value = "";
  });
}
