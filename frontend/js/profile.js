// =========================
// PROFILE PAGE
// =========================
const profileForm = document.getElementById("profileForm");
const userNameDisplay = document.getElementById("userName");
const sidebarNameDisplay = document.getElementById("sidebarName");
const logoutBtn = document.getElementById("logoutBtn");

const headerPic = document.getElementById("headerPic");
const sidebarPic = document.getElementById("sidebarPic");
const uploadPicHeader = document.getElementById("uploadPicHeader");
const uploadPicSidebar = document.getElementById("uploadPicSidebar");

// Ambil session user
const sessionUser = JSON.parse(sessionStorage.getItem("synclint_session")) || {
  firstName: "Dezilva",
  lastName: "Zafiazka",
  email: "dezilva.azka@gmail.com",
  phone: "+62 812 - 4884",
  city: "Surabaya",
  country: "Indonesia",
  avatar: "assets/profile.png"
};

// Utility: bikin nama lengkap dengan fallback
function getFullName(user) {
  let fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || "User";
}

// Tampilkan nama user di header & sidebar
if (userNameDisplay) {
  userNameDisplay.textContent = getFullName(sessionUser);
}
if (sidebarNameDisplay) {
  sidebarNameDisplay.textContent = getFullName(sessionUser);
}

// Tampilkan avatar default / dari session
if (headerPic) headerPic.src = sessionUser.avatar || "assets/profile.png";
if (sidebarPic) sidebarPic.src = sessionUser.avatar || "assets/profile.png";

// =========================
// PRE-FILL FORM
// =========================
if (profileForm) {
  const inputs = profileForm.querySelectorAll("input");

  inputs[0].value = sessionUser.firstName || "";
  inputs[1].value = sessionUser.lastName || "";
  inputs[2].value = sessionUser.phone || "";
  inputs[3].value = sessionUser.email || "";
  inputs[4].value = sessionUser.city || "";
  inputs[5].value = sessionUser.country || "";

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedUser = {
      firstName: inputs[0].value,
      lastName: inputs[1].value,
      phone: inputs[2].value,
      email: inputs[3].value,
      city: inputs[4].value,
      country: inputs[5].value,
      avatar: sessionUser.avatar || "assets/profile.png"
    };

    // Simpan ke session
    sessionStorage.setItem("synclint_session", JSON.stringify(updatedUser));

    // Update nama di UI
    userNameDisplay.textContent = getFullName(updatedUser);
    sidebarNameDisplay.textContent = getFullName(updatedUser);

    alert("Profil berhasil diperbarui!");
    location.reload(); // refresh biar langsung kelihatan
  });
}

// =========================
// LOGOUT
// =========================
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const confirmLogout = confirm("Apakah kamu yakin ingin logout?");
    if (confirmLogout) {
      sessionStorage.removeItem("synclint_session");
      window.location.href = "login.html";
    }
  });
}

// =========================
// UPLOAD AVATAR
// =========================
function handleAvatarUpload(inputEl, targetEls) {
  inputEl.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        targetEls.forEach(el => el.src = event.target.result);

        let updatedSessionUser = JSON.parse(sessionStorage.getItem("synclint_session")) || {};
        updatedSessionUser.avatar = event.target.result;
        sessionStorage.setItem("synclint_session", JSON.stringify(updatedSessionUser));
      };
      reader.readAsDataURL(file);
    }
  });
}

// Klik foto → buka input file
if (headerPic && uploadPicHeader) {
  headerPic.addEventListener("click", () => uploadPicHeader.click());
  handleAvatarUpload(uploadPicHeader, [headerPic, sidebarPic]);
}
if (sidebarPic && uploadPicSidebar) {
  sidebarPic.addEventListener("click", () => uploadPicSidebar.click());
  handleAvatarUpload(uploadPicSidebar, [headerPic, sidebarPic]);
}