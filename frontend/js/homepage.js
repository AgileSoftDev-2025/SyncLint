// Menunggu hingga seluruh konten halaman siap sebelum menjalankan skrip.
document.addEventListener("DOMContentLoaded", () => {
    
    // =============================================
    // ===== INISIALISASI & SELEKSI ELEMEN DOM =====
    // =============================================
    const grid = document.querySelector(".grid");
    const modal = document.getElementById("workspaceModal");
    const addBtn = document.querySelector(".add-btn");
    const closeBtn = modal.querySelector(".close");
    const createBtn = document.getElementById("createWorkspaceBtn");
    const inputName = document.getElementById("workspaceName");

    // =============================================
    // =============== EVENT LISTENERS ===============
    // =============================================

    // Listener utama pada grid untuk menangani klik pada kartu dan menu.
    if (grid) {
        grid.addEventListener("click", handleGridClick);
    }

    // Listener untuk membuka modal
    if (addBtn) {
        addBtn.addEventListener("click", openCreateModal);
    }

    // Listener untuk menutup modal
    if (closeBtn) {
        closeBtn.addEventListener("click", closeCreateModal);
    }
    
    // Listener untuk membuat workspace baru dari modal
    if (createBtn) {
        createBtn.addEventListener("click", createWorkspace);
    }

    // Listener untuk menutup modal jika klik di luar area konten
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeCreateModal();
        }
    });

    // Listener untuk submit dengan tombol ENTER di input
    if (inputName) {
        inputName.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                createWorkspace();
            }
        });
    }
    
    // Inisialisasi kartu yang sudah ada agar interaktif
    initializeCards();

    // =============================================
    // ================== FUNGSI ===================
    // =============================================

    /**
     * Menangani semua klik di dalam area grid (kartu atau menu).
     * @param {Event} e - Objek event klik.
     */
    function handleGridClick(e) {
        const card = e.target.closest('.card');
        if (!card) return; // Keluar jika klik tidak di dalam kartu

        // Jika yang diklik adalah menu titik tiga
        if (e.target.classList.contains('menu-dot')) {
            toggleMenu(e.target);
        } 
        // Jika yang diklik adalah opsi rename/delete di dalam menu
        else if (e.target.closest('.menu')) {
            const action = e.target.dataset.action;
            if (action === 'rename') renameWorkspace(e.target);
            if (action === 'delete') deleteWorkspace(e.target);
        }
        // Jika yang diklik adalah kartu itu sendiri
        else {
            window.location.href = 'workspace.html';
        }
    }

    /**
     * Menampilkan atau menyembunyikan menu pada kartu.
     * @param {HTMLElement} dot - Elemen menu-dot yang diklik.
     */
    function toggleMenu(dot) {
        // Hapus menu lain yang mungkin terbuka
        document.querySelectorAll('.menu').forEach(menu => menu.remove());

        const menu = document.createElement('div');
        menu.className = 'menu';
        menu.innerHTML = `
            <div data-action="rename">Rename</div>
            <div data-action="delete">Delete</div>
        `;
        dot.parentElement.appendChild(menu);

        // Menutup menu jika klik di luar
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(event) {
                if (!menu.contains(event.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            }, { once: true }); // Opsi 'once' agar listener otomatis terhapus
        }, 0);
    }
    
    /**
     * Mengganti nama workspace.
     * @param {HTMLElement} element - Elemen 'Rename' yang diklik.
     */
    function renameWorkspace(element) {
        const card = element.closest('.card');
        const cardTitle = card.querySelector('.card-title');
        const newName = prompt('Masukkan nama baru:', cardTitle.textContent.trim());
        if (newName && newName.trim() !== "") {
            cardTitle.textContent = newName.trim();
        }
    }

    /**
     * Menghapus workspace.
     * @param {HTMLElement} element - Elemen 'Delete' yang diklik.
     */
    function deleteWorkspace(element) {
        if (confirm('Apakah Anda yakin ingin menghapus workspace ini?')) {
            element.closest('.card').remove();
        }
    }

    /**
     * Membuka modal untuk membuat workspace baru.
     */
    function openCreateModal() {
        modal.style.display = "flex";
        inputName.value = "";
        inputName.focus();
    }
    
    /**
     * Menutup modal.
     */
    function closeCreateModal() {
        modal.style.display = "none";
    }

    /**
     * Membuat elemen kartu workspace baru dan menambahkannya ke grid.
     */
    function createWorkspace() {
        const name = inputName.value.trim();
        if (name) {
            const newCard = document.createElement("div");
            newCard.className = "card";
            newCard.style.cursor = "pointer"; // Langsung tambahkan style cursor
            newCard.innerHTML = `
                <div class="card-top">
                    <img src="https://img.icons8.com/ios/50/000000/document.png" alt="Document Icon" class="document-icon">
                </div>
                <div class="menu-dot">⋮</div>
                <div class="card-bottom">
                    <div class="card-title">${name}</div>
                    <span>Dibuat: ${new Date().toLocaleDateString('id-ID')}</span><br>
                    <span>Terakhir dilihat: Baru saja</span>
                </div>
            `;
            grid.appendChild(newCard);
            closeCreateModal();
        } else {
            alert("Nama workspace tidak boleh kosong!");
        }
    }
    
    /**
     * Memberi style cursor pada kartu yang sudah ada di HTML.
     */
    function initializeCards() {
        document.querySelectorAll('.card').forEach(card => {
            card.style.cursor = 'pointer';
        });
    }
});