// Menunggu hingga seluruh konten halaman siap sebelum menjalankan skrip.
document.addEventListener("DOMContentLoaded", () => {
    
    // =============================================
    // =========== KODE UNTUK HALAMAN LOGIN ==========
    // =============================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        // Seleksi elemen DOM khusus untuk login
        const emailEl = document.getElementById("email");
        const rememberEl = document.getElementById("remember");
        
        // Pasang event listener untuk form login
        loginForm.addEventListener("submit", handleLogin);
        
        // Muat email yang tersimpan jika ada
        loadRememberedEmail();

        /**
         * Menangani proses submit form login.
         * @param {Event} e - Objek event submit.
         */
        function handleLogin(e) {
            e.preventDefault();
            const email = emailEl.value.trim();

            if (!email) {
                alert("Email tidak boleh kosong.");
                return;
            }

            // Mengelola penyimpanan email untuk "Ingat Saya"
            if (rememberEl.checked) {
                localStorage.setItem("synclint_remember_email", email);
            } else {
                localStorage.removeItem("synclint_remember_email");
            }

            // Simulasikan sesi login
            sessionStorage.setItem("synclint_session", JSON.stringify({ email: email }));

            // Arahkan ke halaman utama
            window.location.href = "homepage.html";
        }

        /**
         * Memuat dan mengisi email dari localStorage jika opsi "Ingat Saya" aktif.
         */
        function loadRememberedEmail() {
            const savedEmail = localStorage.getItem("synclint_remember_email");
            if (savedEmail) {
                emailEl.value = savedEmail;
                rememberEl.checked = true;
            }
        }
    }

    // =============================================
    // ========= KODE UNTUK HALAMAN SIGN UP ==========
    // =============================================
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        // Seleksi elemen DOM khusus untuk signup
        const emailEl = document.getElementById("email");
        const userEl = document.getElementById("username");
        const passEl = document.getElementById("password");
        const confirmEl = document.getElementById("confirm");

        // Pasang event listener untuk form signup
        signupForm.addEventListener("submit", handleSignup);

        /**
         * Menangani proses submit form sign up.
         * @param {Event} e - Objek event submit.
         */
        function handleSignup(e) {
            e.preventDefault();
            
            // Mengambil nilai dari setiap input
            const email = emailEl.value.trim();
            const username = userEl.value.trim();
            const password = passEl.value;
            const confirmPassword = confirmEl.value;

            // Validasi input
            if (!email || !username || !password || !confirmPassword) {
                alert("Semua kolom wajib diisi.");
                return;
            }
            if (password !== confirmPassword) {
                alert("Konfirmasi password tidak cocok.");
                return;
            }
            if (password.length < 8) {
                alert("Password minimal harus 8 karakter.");
                return;
            }

            // Simulasikan penyimpanan data pengguna baru
            localStorage.setItem(
                "synclint_user",
                JSON.stringify({
                    email: email,
                    username: username,
                    password: password, // Dalam aplikasi nyata, password harus di-hash!
                })
            );
            
            alert("Registrasi berhasil! Silakan login.");
            // Arahkan ke halaman login
            window.location.href = "index.html";
        }
    }
});