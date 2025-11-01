// File: frontend/js/profile.js (VERSI FINAL BARU)

document.addEventListener("DOMContentLoaded", () => {
    
    // =============================================
    // ===== SELEKSI ELEMEN DOM =====
    // =============================================
    const profileForm = document.getElementById("profileForm");
    
    const userNameDisplay = document.getElementById("userName");
    const sidebarNameDisplay = document.getElementById("sidebarName");
    const headerPic = document.getElementById("headerPic");
    const sidebarPic = document.getElementById("sidebarPic");

    const uploadPicHeader = document.getElementById("uploadPicHeader");
    const uploadPicSidebar = document.getElementById("uploadPicSidebar");
    
    // Input Form
    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const cityInput = document.getElementById("city");
    const countryInput = document.getElementById("country");
    // PASTIKAN DUA BARIS INI ADA:
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    // === TAMBAHKAN INI ===
    const coverDiv = document.getElementById("coverDiv");
    const changeCoverBtn = document.getElementById("changeCoverBtn");
    const uploadCoverInput = document.getElementById("uploadCoverInput");
    // =======================

    // =============================================
    // ===== FUNGSI HELPER =====
    // =============================================

    /**
     * Mengambil CSRF token dari form di HTML
     */
    function getCSRFToken() {
        const tokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
        return tokenInput ? tokenInput.value : null;
    }

    // =============================================
    // ===== FUNGSI UTAMA (PENGAMBILAN & UPDATE DATA) =====
    // =============================================
    
    /**
     * Mengambil data profil dari API backend dan mengisi form.
     */
    async function initializeUserProfile() {
        try {
        const response = await fetch('/api/profile/');

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                window.location.href = "/api/login/"; // <-- Diperbaiki
            }
            throw new Error(`Gagal mengambil data: ${response.statusText}`);
        }

        const data = await response.json();

        const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User";
        if (userNameDisplay) userNameDisplay.textContent = fullName;
        if (sidebarNameDisplay) sidebarNameDisplay.textContent = fullName;

        // Hanya ganti gambar JIKA 'data.photo' ada (tidak null)
        if (data.photo) {
            if (headerPic) headerPic.src = data.photo;
            if (sidebarPic) sidebarPic.src = data.photo;
        }

        // === TAMBAHKAN INI (untuk load cover) ===
        // Ganti background cover jika ada di database
        if (data.cover_photo) {
            if (coverDiv) coverDiv.style.backgroundImage = `url(${data.cover_photo})`;
        }
        // =======================================
        
        if (profileForm) {
            firstNameInput.value = data.first_name || "";
            lastNameInput.value = data.last_name || "";
            phoneInput.value = data.no_telp || "";
            emailInput.value = data.email || "";
            cityInput.value = data.kota || "";
            countryInput.value = data.negara || "";
        }

        } catch (error) {
        console.error("Gagal inisialisasi profil:", error);
        }
    }

    async function handleCoverUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Tampilkan gambar di UI secara instan
        const reader = new FileReader();
        reader.onload = (event) => {
            const newCoverSrc = event.target.result;
            if (coverDiv) coverDiv.style.backgroundImage = `url(${newCoverSrc})`;
        };
        reader.readAsDataURL(file);

        // 2. Siapkan FormData untuk dikirim ke API
        const formData = new FormData();
        formData.append('cover_photo', file); // <-- Ganti menjadi 'cover_photo'

        try {
            // 3. Kirim file ke API
            const response = await fetch('/api/profile/', {
                method: 'PATCH',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gagal upload cover: ${JSON.stringify(errorData)}`);
            }

            alert("Foto cover berhasil di-upload!");

        } catch (error) {
            console.error("Gagal upload cover:", error);
            alert("Gagal meng-upload foto cover.");
            // Jika gagal, muat ulang profil untuk mengembalikan foto lama dari DB
            initializeUserProfile(); 
        }
    }

    /**
     * Mengirim data form (TEKS SAJA) yang diperbarui ke API backend.
     */
    async function handleProfileUpdate(e) {
        e.preventDefault();
        
        const updatedData = {
            no_telp: phoneInput.value,
            kota: cityInput.value,
            negara: countryInput.value,
            bio: "", // Anda bisa tambahkan field bio di HTML jika mau
            location: "" // Anda bisa tambahkan field location di HTML jika mau
            // (Kita tidak mengirim foto di sini, itu ditangani oleh handleAvatarUpload)
        };

        // Ambil data PASSWORD
        const password = passwordInput.value;
        const password2 = confirmPasswordInput.value;

        // HANYA tambahkan password ke request JIKA diisi
        if (password && password2) {
            if (password !== password2) {
                alert("Password dan konfirmasi password tidak cocok!");
                return; // Hentikan proses
            }
            // Tambahkan ke obyek yang akan dikirim
            updatedData.password = password;
            updatedData.password2 = password2;
        } else if (password || password2) {
            // Jika hanya salah satu yang diisi
            alert("Untuk mengganti password, Anda harus mengisi kedua field password.");
            return; // Hentikan proses
        }

        try {
        const response = await fetch('/api/profile/', {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() // <-- PENTING: Tambahkan CSRF Token
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gagal update: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        alert("Profil berhasil diperbarui!");

        } catch (error) {
        console.error("Gagal update profil:", error);
        alert("Gagal memperbarui profil. Silakan coba lagi.");
        }
    }

    /**
     * Menangani unggahan file avatar, mengubah gambar, dan MENGIRIM ke API.
     */
    async function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Tampilkan gambar di UI secara instan (Optimistic Update)
        const reader = new FileReader();
        reader.onload = (event) => {
        const newAvatarSrc = event.target.result;
        if (headerPic) headerPic.src = newAvatarSrc;
        if (sidebarPic) sidebarPic.src = newAvatarSrc;
        };
        reader.readAsDataURL(file);

        // 2. Siapkan FormData untuk dikirim ke API
        const formData = new FormData();
        formData.append('photo', file); // 'photo' harus cocok dengan nama field di models.py

        try {
        // 3. Kirim file ke API
        const response = await fetch('/api/profile/', {
            method: 'PATCH',
            headers: {
            'X-CSRFToken': getCSRFToken() // <-- PENTING: CSRF Token juga
            // 'Content-Type' JANGAN DI-SET, biarkan browser
            // yang mengaturnya ke 'multipart/form-data'
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gagal upload foto: ${JSON.stringify(errorData)}`);
        }

        alert("Foto profil berhasil di-upload!");

        } catch (error) {
        console.error("Gagal upload foto:", error);
        alert("Gagal meng-upload foto profil.");
        // Jika gagal, muat ulang profil untuk mengembalikan foto lama dari DB
        initializeUserProfile(); 
        }
    }

    // =============================================
    // =============== EVENT LISTENERS ===============
    // =============================================

    if (profileForm) {
        profileForm.addEventListener("submit", handleProfileUpdate);
    }

    // Pasang listener ke KEDUA tombol upload foto
    if (headerPic && uploadPicHeader) {
        headerPic.addEventListener("click", () => uploadPicHeader.click());
        uploadPicHeader.addEventListener("change", handleAvatarUpload);
    }
    if (sidebarPic && uploadPicSidebar) {
        sidebarPic.addEventListener("click", () => uploadPicSidebar.click());
        uploadPicSidebar.addEventListener("change", handleAvatarUpload);
    }

    // === TAMBAHKAN INI ===
    if (changeCoverBtn && uploadCoverInput) {
        changeCoverBtn.addEventListener("click", () => uploadCoverInput.click());
        uploadCoverInput.addEventListener("change", handleCoverUpload);
    }
    // =======================
    
    // =============================================
    // ===== JALANKAN FUNGSI INISIALISASI =====
    // =============================================
    
    initializeUserProfile(); // Panggil fungsi utama kita

});