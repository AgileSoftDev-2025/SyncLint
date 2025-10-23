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
    async function renameWorkspace(element) {
        const card = element.closest('.card');
        const cardTitle = card.querySelector('.card-title');
        const workspaceId = card.dataset.workspaceId;
        const newName = prompt('Masukkan nama baru:', cardTitle.textContent.trim());
        
        if (newName && newName.trim() !== "") {
            try {
                const response = await fetch(`/api/workspace/${workspaceId}/update/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: newName.trim(),
                        description: ''
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success') {
                        cardTitle.textContent = data.workspace.name;
                        card.querySelector('span:last-child').textContent = `Terakhir dilihat: ${data.workspace.updated_at}`;
                    } else {
                        alert("Gagal mengubah nama workspace: " + (data.errors || "Unknown error"));
                    }
                } else {
                    alert("Gagal mengubah nama workspace: Server error");
                }
            } catch (error) {
                console.error('Error:', error);
                alert("Terjadi kesalahan saat mengubah nama workspace");
            }
        }
    }

    /**
     * Menghapus workspace.
     * @param {HTMLElement} element - Elemen 'Delete' yang diklik.
     */
    async function deleteWorkspace(element) {
        const card = element.closest('.card');
        const workspaceId = card.dataset.workspaceId;
        
        if (confirm('Apakah Anda yakin ingin menghapus workspace ini?')) {
            try {
                const response = await fetch(`/api/workspace/${workspaceId}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success') {
                        card.remove();
                    } else {
                        alert("Gagal menghapus workspace: " + (data.errors || "Unknown error"));
                    }
                } else {
                    alert("Gagal menghapus workspace: Server error");
                }
            } catch (error) {
                console.error('Error:', error);
                alert("Terjadi kesalahan saat menghapus workspace");
            }
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
    async function createWorkspace() {
        const name = inputName.value.trim();
        if (!name) {
            alert("Nama workspace tidak boleh kosong!");
            return;
        }

        try {
            const response = await fetch('/api/workspace/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: ''
                }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    const newCard = document.createElement("div");
                    newCard.className = "card";
                    newCard.style.cursor = "pointer";
                    newCard.dataset.workspaceId = data.workspace.id;
                    newCard.innerHTML = `
                        <div class="card-top">
                            <img src="https://img.icons8.com/ios/50/000000/document.png" alt="Document Icon" class="document-icon">
                        </div>
                        <div class="menu-dot">⋮</div>
                        <div class="card-bottom">
                            <div class="card-title">${data.workspace.name}</div>
                            <span>Dibuat: ${data.workspace.created_at}</span><br>
                            <span>Terakhir dilihat: ${data.workspace.updated_at}</span>
                        </div>
                    `;
                    grid.appendChild(newCard);
                    closeCreateModal();
                } else {
                    alert("Gagal membuat workspace: " + (data.errors || "Unknown error"));
                }
            } else {
                alert("Gagal membuat workspace: Server error");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Terjadi kesalahan saat membuat workspace");
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