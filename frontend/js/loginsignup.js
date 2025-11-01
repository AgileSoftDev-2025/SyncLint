// File: frontend/js/loginsignup.js (VERSI FINAL BARU)

document.addEventListener("DOMContentLoaded", () => {
    
    // =============================================
    // =========== KODE UNTUK HALAMAN LOGIN ==========
    // =============================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        const emailEl = document.getElementById("email");
        const rememberEl = document.getElementById("remember");
        
        // HAPUS event listener, kita pakai submit HTML biasa
        // loginForm.addEventListener("submit", handleLogin); 
        
        loadRememberedEmail();

        // FUNGSI INI TIDAK DIPAKAI LAGI
        // function handleLogin(e) {
        //     e.preventDefault(); // <-- INI YANG DIHAPUS
        //     ... (SEMUA KODE SIMULASI DIHAPUS) ...
        // }

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
        // HAPUS event listener, kita pakai submit HTML biasa
        // signupForm.addEventListener("submit", handleSignup);

        // FUNGSI INI TIDAK DIPAKAI LAGI
        // function handleSignup(e) {
        //     e.preventDefault(); // <-- INI YANG DIHAPUS
        //     ... (SEMUA KODE SIMULASI DIHAPUS) ...
        // }
    }
});