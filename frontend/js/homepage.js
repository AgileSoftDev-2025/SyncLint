// File: frontend/js/homepage.js (VERSI FINAL DENGAN MODAL KUSTOM)

document.addEventListener("DOMContentLoaded", () => {
    
    // =============================================
    // ===== SELEKSI ELEMEN DOM & VARIABEL BARU =====
    // =============================================
    const grid = document.querySelector(".grid");
    
    // Modal Create/Rename
    const createModal = document.getElementById("workspaceModal");
    const addBtn = document.querySelector(".add-btn");
    const closeCreateBtn = createModal.querySelector(".close-create");
    const createBtn = document.getElementById("createWorkspaceBtn");
    const renameBtn = document.getElementById("renameWorkspaceBtn"); // Baru
    const inputName = document.getElementById("workspaceName");
    const modalTitle = document.getElementById("modalTitle"); // Baru
    
    // Modal Delete (BARU)
    const deleteModal = document.getElementById("deleteModal");
    const closeDeleteBtn = deleteModal.querySelector(".close-delete");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const deleteWorkspaceNameSpan = document.getElementById("deleteWorkspaceName");

    const searchInput = document.getElementById("searchWorkspace");
    const sortSelect = document.getElementById("sortWorkspace");

    let currentWorkspaceCard = null; // Menyimpan kartu yang sedang dioperasikan

    // =============================================
    // ===== FUNGSI HELPER =====
    // =============================================
    
    function getCSRFToken() {
        const tokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
        return tokenInput ? tokenInput.value : null;
    }
    
    function searchWorkspaces(query) {
        const cards = document.querySelectorAll('.card');
        query = query.toLowerCase();
        
        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            if (title.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function sortWorkspaces(method) {
        const cards = Array.from(document.querySelectorAll('.card'));
        const container = document.querySelector('.grid');
        
        cards.sort((a, b) => {
            const titleA = a.querySelector('.card-title').textContent.toLowerCase();
            const titleB = b.querySelector('.card-title').textContent.toLowerCase();
            // Asumsi format tanggal adalah "d F Y" dan perlu penyesuaian untuk Date()
            const dateStrA = a.querySelector('span:last-of-type').textContent.replace('Terakhir dilihat: ', '');
            const dateStrB = b.querySelector('span:last-of-type').textContent.replace('Terakhir dilihat: ', '');
            
            // Perlu penanganan khusus untuk format tanggal Indonesia (d F Y)
            const dateA = new Date(dateStrA.replace(/(\d{1,2}) (.*) (\d{4})/g, '$2 $1, $3'));
            const dateB = new Date(dateStrB.replace(/(\d{1,2}) (.*) (\d{4})/g, '$2 $1, $3'));

            switch(method) {
                case 'name-asc':
                    return titleA.localeCompare(titleB);
                case 'name-desc':
                    return titleB.localeCompare(titleA);
                case 'date-asc':
                    return dateA - dateB;
                case 'date-desc':
                    return dateB - dateA;
                default:
                    return 0;
            }
        });
        
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        cards.forEach(card => container.appendChild(card));
    }
    
    // =============================================
    // =============== FUNGSI MODAL ===============
    // =============================================

    function closeModal() {
        createModal.style.display = "none";
        deleteModal.style.display = "none";
        currentWorkspaceCard = null; // Reset kartu aktif
    }

    function openCreateModal() {
        modalTitle.textContent = "Buat Workspace Baru";
        createBtn.style.display = 'block';
        renameBtn.style.display = 'none';
        currentWorkspaceCard = null;

        createModal.style.display = "flex";
        inputName.value = "";
        inputName.focus();
    }
    
    function openRenameModal(card) {
        const title = card.querySelector('.card-title').textContent.trim();
        modalTitle.textContent = "Ganti Nama Workspace";
        createBtn.style.display = 'none';
        renameBtn.style.display = 'block';
        
        currentWorkspaceCard = card;

        createModal.style.display = "flex";
        inputName.value = title;
        inputName.focus();
    }

    function openDeleteConfirmation(card) {
        const name = card.querySelector('.card-title').textContent.trim();
        currentWorkspaceCard = card;
        deleteWorkspaceNameSpan.textContent = name;
        deleteModal.style.display = "flex";
    }

    /**
     * Membuat elemen kartu workspace baru
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
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken() 
                },
                body: JSON.stringify({
                    name: name,
                    description: ''
                })
            });

            const data = await response.json(); 

            if (response.ok && data.status === 'success') {
                const newCard = document.createElement("div");
                newCard.className = "card";
                newCard.style.cursor = "pointer";
                newCard.dataset.workspaceId = data.workspace.id; 
                
                // Format tanggal untuk tampilan UI yang konsisten
                const createdDate = new Date(data.workspace.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                const updatedDate = new Date(data.workspace.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                
                newCard.innerHTML = `
                    <div class="card-top">
                        <img src="https://img.icons8.com/ios/50/000000/document.png" alt="Document Icon" class="document-icon">
                    </div>
                    <div class="menu-dot">⋮</div>
                    <div class="card-bottom">
                        <div class="card-title">${data.workspace.name}</div>
                        <span>Dibuat: ${createdDate}</span><br>
                        <span>Terakhir dilihat: ${updatedDate}</span>
                    </div>
                `;
                grid.appendChild(newCard);
                closeModal();
            } else {
                alert("Gagal membuat workspace: " + (data.errors ? JSON.stringify(data.errors) : "Unknown error"));
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Terjadi kesalahan saat membuat workspace");
        }
    }
    
    // =============================================
    // ============= FUNGSI AKSI KARTU =============
    // =============================================
    
    /**
     * Menangani klik tombol "Ganti Nama" di modal.
     */
    async function handleRenameAction(card) {
        if (!card) return;

        const workspaceId = card.dataset.workspaceId;
        const newName = inputName.value.trim();

        if (!newName) {
            alert("Nama workspace tidak boleh kosong!");
            return;
        }
        
        closeModal();

        try {
            const response = await fetch(`/api/workspace/${workspaceId}/update/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken() 
                },
                body: JSON.stringify({
                    name: newName,
                    description: '' 
                })
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                const cardTitle = card.querySelector('.card-title');
                cardTitle.textContent = data.workspace.name;
                
                // Format tanggal diperbarui
                const updatedDate = new Date(data.workspace.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                card.querySelector('span:last-of-type').textContent = `Terakhir dilihat: ${updatedDate}`;
            } else {
                alert("Gagal mengubah nama workspace: " + (data.errors ? JSON.stringify(data.errors) : "Unknown error"));
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Terjadi kesalahan saat mengubah nama workspace");
        }
    }

    /**
     * Menangani klik tombol "Hapus" di modal konfirmasi.
     */
    async function handleDeleteAction(card) {
        if (!card) return;
        const workspaceId = card.dataset.workspaceId;

        closeModal();

        try {
            const response = await fetch(`/api/workspace/${workspaceId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken() 
                }
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                card.remove();
            } else {
                alert("Gagal menghapus workspace: " + (data.errors ? JSON.stringify(data.errors) : "Unknown error"));
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Terjadi kesalahan saat menghapus workspace");
        }
    }
    
    /**
     * Menampilkan atau menyembunyikan menu pada kartu.
     */
    function toggleMenu(dot) {
        // Hapus semua menu yang ada
        document.querySelectorAll('.menu').forEach(menu => menu.remove());
        
        // Buat menu baru
        const menu = document.createElement('div');
        menu.className = 'menu';
        menu.innerHTML = `
            <div data-action="rename">Rename</div>
            <div data-action="delete">Delete</div>
        `;
        dot.parentElement.appendChild(menu);

        // Pasang event listener untuk menutup menu jika klik di luar
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(event) {
                // Jangan tutup jika klik terjadi di dalam menu atau menu-dot
                if (!menu.contains(event.target) && !dot.contains(event.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            }, { once: true });
        }, 0);
    }
    
    /**
     * Menangani semua klik di dalam area grid (kartu atau menu).
     */
    function handleGridClick(e) {
        const card = e.target.closest('.card');
        if (!card) return;

        const workspaceId = card.dataset.workspaceId;

        // 1. Klik pada Titik Tiga (⋮) -> Tampilkan Menu
        if (e.target.classList.contains('menu-dot')) {
            toggleMenu(e.target, workspaceId); 
        } 
        // 2. Klik pada Opsi di Dalam Menu -> Lakukan Aksi MODAL
        else if (e.target.closest('.menu div')) {
            const actionElement = e.target.closest('.menu div'); 
            const action = actionElement.dataset.action;
            
            const menu = e.target.closest('.menu');
            if (menu) menu.remove(); // Hapus menu setelah aksi dipilih

            if (action === 'rename') openRenameModal(card); // Ganti dengan fungsi modal baru
            if (action === 'delete') openDeleteConfirmation(card); // Ganti dengan fungsi modal baru
        }
        // 3. Klik pada Bagian Kartu Lain -> Masuk Workspace
        else {
            window.location.href = `/api/workspace/${workspaceId}/`; 
        }
    }

    // =============================================
    // =============== EVENT LISTENERS ===============
    // =============================================
    if (grid) grid.addEventListener("click", handleGridClick);
    if (addBtn) addBtn.addEventListener("click", openCreateModal);
    
    // Penutup Modal Create/Rename
    if (closeCreateBtn) closeCreateBtn.addEventListener("click", closeModal);
    if (createBtn) createBtn.addEventListener("click", createWorkspace);
    if (renameBtn) renameBtn.addEventListener("click", () => handleRenameAction(currentWorkspaceCard)); 
    
    // Penutup Modal Delete
    if (closeDeleteBtn) closeDeleteBtn.addEventListener("click", closeModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", () => handleDeleteAction(currentWorkspaceCard)); 

    // Penanganan input keyboard (Enter)
    if (inputName) inputName.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            if (createBtn.style.display !== 'none') createWorkspace();
            else if (renameBtn.style.display !== 'none') handleRenameAction(currentWorkspaceCard);
        }
    });
    
    // Penutup window yang diperbarui (klik di luar)
    window.addEventListener("click", (e) => {
        if (e.target === createModal || e.target === deleteModal) closeModal();
    });

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchWorkspaces(e.target.value);
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            sortWorkspaces(e.target.value);
        });
    }
    
    // Fungsi untuk memastikan kursor tampil di kartu
    function initializeCards() {
        document.querySelectorAll('.card').forEach(card => {
            card.style.cursor = 'pointer';
        });
    }
    initializeCards();
});