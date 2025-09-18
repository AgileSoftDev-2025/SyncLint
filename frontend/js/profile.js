// Menunggu hingga seluruh konten halaman siap sebelum menjalankan skrip.
document.addEventListener("DOMContentLoaded", () => {
    
    // =============================================
    // ===== INISIALISASI & SELEKSI ELEMEN DOM =====
    // =============================================
    const profileForm = document.getElementById("profileForm");
    
    // Elemen untuk menampilkan nama & avatar
    const userNameDisplay = document.getElementById("userName");
    const sidebarNameDisplay = document.getElementById("sidebarName");
    const headerPic = document.getElementById("headerPic");
    const sidebarPic = document.getElementById("sidebarPic");

    // Elemen input file yang tersembunyi
    const uploadPicHeader = document.getElementById("uploadPicHeader");
    const uploadPicSidebar = document.getElementById("uploadPicSidebar");
    
    // Tombol Logout
    const logoutBtn = document.getElementById("logoutBtn");

    // Ambil data sesi pengguna atau gunakan data default
    const sessionUser = JSON.parse(sessionStorage.getItem("synclint_session")) || {
        firstName: "Dezilva",
        lastName: "Zafiazka",
        email: "dezilva.azka@gmail.com",
        phone: "+62 812 - 4884",
        city: "Surabaya",
        country: "Indonesia",
        avatar: "assets/profile.png"
    };

    // =============================================
    // =============== EVENT LISTENERS ===============
    // =============================================

    if (profileForm) {
        profileForm.addEventListener("submit", handleProfileUpdate);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }
    if (headerPic && uploadPicHeader) {
        headerPic.addEventListener("click", () => uploadPicHeader.click());
        uploadPicHeader.addEventListener("change", handleAvatarUpload);
    }
    if (sidebarPic && uploadPicSidebar) {
        sidebarPic.addEventListener("click", () => uploadPicSidebar.click());
        uploadPicSidebar.addEventListener("change", handleAvatarUpload);
    }

    // =============================================
    // ================== FUNGSI ===================
    // =============================================
    
    /**
     * Mengisi data pengguna ke dalam UI saat halaman dimuat.
     */
    function initializeUserProfile() {
        const fullName = getFullName(sessionUser);
        const avatarSrc = sessionUser.avatar || "assets/profile.png";

        if (userNameDisplay) userNameDisplay.textContent = fullName;
        if (sidebarNameDisplay) sidebarNameDisplay.textContent = fullName;
        if (headerPic) headerPic.src = avatarSrc;
        if (sidebarPic) sidebarPic.src = avatarSrc;
        
        // Isi form jika ada
        if (profileForm) {
            const inputs = profileForm.querySelectorAll("input");
            inputs[0].value = sessionUser.firstName || "";
            inputs[1].value = sessionUser.lastName || "";
            inputs[2].value = sessionUser.phone || "";
            inputs[3].value = sessionUser.email || "";
            inputs[4].value = sessionUser.city || "";
            inputs[5].value = sessionUser.country || "";
        }
    }

    /**
     * Menangani pembaruan data profil dari form.
     * @param {Event} e - Objek event submit.
     */
    function handleProfileUpdate(e) {
        e.preventDefault();
        const inputs = profileForm.querySelectorAll("input");

        const updatedUser = {
            ...sessionUser, // Salin data lama untuk jaga-jaga
            firstName: inputs[0].value,
            lastName: inputs[1].value,
            phone: inputs[2].value,
            email: inputs[3].value,
            city: inputs[4].value,
            country: inputs[5].value,
        };

        sessionStorage.setItem("synclint_session", JSON.stringify(updatedUser));

        // Perbarui tampilan nama secara langsung
        const newFullName = getFullName(updatedUser);
        if (userNameDisplay) userNameDisplay.textContent = newFullName;
        if (sidebarNameDisplay) sidebarNameDisplay.textContent = newFullName;

        alert("Profil berhasil diperbarui!");
        // Opsional: location.reload() bisa dihapus jika semua update UI sudah ditangani JS
    }

    /**
     * Menangani proses logout pengguna.
     */
    function handleLogout() {
        if (confirm("Apakah Anda yakin ingin logout?")) {
            sessionStorage.removeItem("synclint_session");
            window.location.href = "index.html";
        }
    }

    /**
     * Menangani unggahan file avatar, mengubah gambar, dan menyimpan ke session.
     * @param {Event} e - Objek event change dari input file.
     */
    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAvatarSrc = event.target.result;
                
                // Perbarui kedua gambar di UI
                if (headerPic) headerPic.src = newAvatarSrc;
                if (sidebarPic) sidebarPic.src = newAvatarSrc;
                
                // Perbarui data di session storage
                sessionUser.avatar = newAvatarSrc;
                sessionStorage.setItem("synclint_session", JSON.stringify(sessionUser));
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * Fungsi utilitas untuk mendapatkan nama lengkap.
     * @param {object} user - Objek pengguna.
     * @returns {string} Nama lengkap pengguna.
     */
    function getFullName(user) {
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return fullName || "User";
    }

    // =============================================
    // ===== JALANKAN FUNGSI INISIALISASI =====
    // =============================================
    initializeUserProfile();
});