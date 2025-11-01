// File: frontend/js/homepage.js (VERSI FINAL BARU)

document.addEventListener("DOMContentLoaded", () => {
    
    // =============================================
    // ===== SELEKSI ELEMEN DOM =====
    // =============================================
    const grid = document.querySelector(".grid");
    const modal = document.getElementById("workspaceModal");
    const addBtn = document.querySelector(".add-btn");
    const closeBtn = modal.querySelector(".close");
    const createBtn = document.getElementById("createWorkspaceBtn");
    const inputName = document.getElementById("workspaceName");

    // =============================================
    // ===== FUNGSI HELPER (BARU) =====
    // =============================================
    
    /**
     * Mengambil CSRF token dari template HTML
     */
    function getCSRFToken() {
        const tokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
        return tokenInput ? tokenInput.value : null;
    }

    // =============================================
    // =============== EVENT LISTENERS ===============
    // =============================================
    if (grid) grid.addEventListener("click", handleGridClick);
    if (addBtn) addBtn.addEventListener("click", openCreateModal);
    if (closeBtn) closeBtn.addEventListener("click", closeCreateModal);
    if (createBtn) createBtn.addEventListener("click", createWorkspace);
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeCreateModal();
    });
    if (inputName) inputName.addEventListener("keypress", (e) => {
        if (e.key === "Enter") createWorkspace();
    });
    
    initializeCards();

    // =============================================
    // ================== FUNGSI (DIPERBAIKI) ===================
    // =============================================

    /**
     * Menangani semua klik di dalam area grid (kartu atau menu).
     */
    function handleGridClick(e) {
        const card = e.target.closest('.card');
        if (!card) return;

        const workspaceId = card.dataset.workspaceId;

        if (e.target.classList.contains('menu-dot')) {
            toggleMenu(e.target, workspaceId); // Beri ID ke menu
        } 
        else if (e.target.closest('.menu')) {
            const action = e.target.dataset.action;
            if (action === 'rename') renameWorkspace(card); // Kirim seluruh kartu
            if (action === 'delete') deleteWorkspace(card); // Kirim seluruh kartu
        }
        else {
            // PERBAIKAN ERROR 404: Arahkan ke URL view baru
            window.location.href = `/api/workspace/${workspaceId}/`; 
        }
    }

    /**
     * Menampilkan atau menyembunyikan menu pada kartu.
     */
    function toggleMenu(dot, workspaceId) {
        document.querySelectorAll('.menu').forEach(menu => menu.remove());

        const menu = document.createElement('div');
        menu.className = 'menu';
        // Simpan ID di menu untuk referensi
        menu.innerHTML = `
            <div data-action="rename">Rename</div>
            <div data-action="delete">Delete</div>
        `;
        dot.parentElement.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', function closeMenu(event) {
                if (!menu.contains(event.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            }, { once: true });
        }, 0);
    }
    
    /**
     * Mengganti nama workspace (DIPERBAIKI)
     */
    async function renameWorkspace(card) {
        const cardTitle = card.querySelector('.card-title');
        const workspaceId = card.dataset.workspaceId; // Ambil ID dari kartu
        const newName = prompt('Masukkan nama baru:', cardTitle.textContent.trim());
        
        if (newName && newName.trim() !== "") {
            try {
                const response = await fetch(`/api/workspace/${workspaceId}/update/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken() // TAMBAHKAN CSRF TOKEN
                    },
                    body: JSON.stringify({
                        name: newName.trim(),
                        description: '' // Kirim deskripsi kosong atau ambil dari data lama
                    })
                });

                const data = await response.json();
                if (response.ok && data.status === 'success') {
                    cardTitle.textContent = data.workspace.name;
                    // Perbarui timestamp
                    card.querySelector('span:last-of-type').textContent = `Terakhir dilihat: ${data.workspace.updated_at}`;
                } else {
                    alert("Gagal mengubah nama workspace: " + (data.errors ? JSON.stringify(data.errors) : "Unknown error"));
                }
            } catch (error) {
                console.error('Error:', error);
                alert("Terjadi kesalahan saat mengubah nama workspace");
            }
        }
    }

    /**
     * Menghapus workspace (DIPERBAIKI)
     */
    async function deleteWorkspace(card) {
        const workspaceId = card.dataset.workspaceId; // Ambil ID dari kartu
        
        if (confirm('Apakah Anda yakin ingin menghapus workspace ini?')) {
            try {
                const response = await fetch(`/api/workspace/${workspaceId}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken() // TAMBAHKAN CSRF TOKEN
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
    }

    function openCreateModal() {
        modal.style.display = "flex";
        inputName.value = "";
        inputName.focus();
    }
    
    function closeCreateModal() {
        modal.style.display = "none";
    }

    /**
     * Membuat elemen kartu workspace baru (DIPERBAIKI)
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
                    'X-CSRFToken': getCSRFToken() // TAMBAHKAN CSRF TOKEN
                },
                body: JSON.stringify({
                    name: name,
                    description: ''
                })
            });

            const data = await response.json(); // Baca JSON bahkan jika error 400

            if (response.ok && data.status === 'success') {
                const newCard = document.createElement("div");
                newCard.className = "card";
                newCard.style.cursor = "pointer";
                newCard.dataset.workspaceId = data.workspace.id; // Gunakan .id
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
                // Tampilkan pesan error dari server
                alert("Gagal membuat workspace: " + (data.errors ? JSON.stringify(data.errors) : "Unknown error"));
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Terjadi kesalahan saat membuat workspace");
        }
    }
    
    function initializeCards() {
        document.querySelectorAll('.card').forEach(card => {
            card.style.cursor = 'pointer';
        });
    }
});