// File: frontend/js/workspace.js (VERSI FINAL - TERHUBUNG KE API)

document.addEventListener("DOMContentLoaded", () => {

    // =============================================
    // ================ STATE & DATA ===============
    // =============================================
    
    // State untuk mengontrol mode seleksi artefak
    let isSelectingArtifacts = false;
    
    // HAPUS data dummy 'artifactsData' dan 'historyData'
    // Data akan diambil langsung dari API

    // State untuk modal
    let currentFile = null;
    let currentArtifactType = null;
    const workspaceId = document.body.dataset.workspaceId; // Ambil ID dari body

    // =============================================
    // ===== INISIALISASI & SELEKSI ELEMEN DOM =====
    // =============================================
    
    // Panel Utama
    const artifactsGrid = document.getElementById('artifacts-grid');
    const historyList = document.getElementById('history-list');
    
    // Tombol Aksi
    const selectBtn = document.querySelector('.select-btn');
    const compareBtn = document.querySelector('.compare-btn');

    // Elemen Modal
    const modal = document.getElementById('uploadModal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const uploadTriggerGrid = document.getElementById('upload-triggers') || document.querySelector('.upload-section');
    const submitUploadBtn = modal.querySelector('.upload-btn');
    
    // Elemen Form Modal
    const modalTitle = modal.querySelector('#modalTitle');
    const fileDropArea = modal.querySelector('.file-drop-area');
    const fileInput = modal.querySelector('.file-input');
    const fileSelectLink = modal.querySelector('.file-select-link');
    const textInput = modal.querySelector('#artifactText');
    const artifactNameInput = modal.querySelector('#artifactNameInput');

    // =============================================
    // =============== EVENT LISTENERS ===============
    // =============================================
    // Event listener yang diperbarui untuk menangani SEMUA klik di grid artefak
    artifactsGrid.addEventListener('click', (e) => {
        const menuBtn = e.target.closest('.artifact-menu-btn');
        const actionBtn = e.target.closest('.artifact-action-btn');

        // KASUS 1: Pengguna mengklik tombol tiga titik
        if (menuBtn) {
            e.stopPropagation(); // Hentikan event agar tidak ditangkap 'window'
            const dropdown = menuBtn.nextElementSibling;
            
            // Cek apakah dropdown ini sudah terbuka
            const isAlreadyOpen = dropdown.style.display === 'block';

            // Tutup semua dropdown lain
            document.querySelectorAll('.artifact-menu-dropdown').forEach(d => {
                d.style.display = 'none';
            });
            
            // Buka dropdown yang ini (jika tadinya tertutup)
            if (!isAlreadyOpen) {
                dropdown.style.display = 'block';
            }
            return; 
        }

        // KASUS 2: Pengguna mengklik aksi (Rename, Delete, Download)
        if (actionBtn) {
            e.preventDefault(); // Hentikan <a href="#">
            
            const action = actionBtn.dataset.action;
            const card = actionBtn.closest('.artifact-card');
            const artefakId = card.dataset.id;
            const artefakName = card.dataset.name;

            if (action === 'rename') {
                handleRename(artefakId, artefakName);
            } else if (action === 'delete') {
                handleDelete(artefakId, artefakName);
            }
            // 'download' sudah ditangani oleh tag <a> HTML
        }
    });

    // Menutup menu jika mengklik di luar
    window.addEventListener('click', (e) => {
        // Jika yang diklik bukan tombol menu, tutup semua menu
        if (!e.target.closest('.artifact-menu-btn')) {
            document.querySelectorAll('.artifact-menu-dropdown').forEach(d => {
                d.style.display = 'none';
            });
        }
    });
    
    if (selectBtn) {
        selectBtn.addEventListener('click', toggleArtifactSelection);
    }
    
    if (uploadTriggerGrid) {
        uploadTriggerGrid.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.type) {
                openUploadModal(e);
            }
        });
    }

    if (modal) {
        closeModalBtn.addEventListener('click', closeUploadModal);
        submitUploadBtn.addEventListener('click', handleSubmitUpload);

        window.addEventListener('click', (event) => {
            if (event.target === modal) closeUploadModal();
        });
        
        fileSelectLink.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
        fileInput.addEventListener('change', handleFileSelect);
        
        fileDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileDropArea.classList.add('active');
        });
        fileDropArea.addEventListener('dragleave', () => fileDropArea.classList.remove('active'));
        fileDropArea.addEventListener('drop', handleFileDrop);

        textInput.addEventListener('input', () => {
             if (textInput.value.trim() !== '') {
                currentFile = null;
                fileInput.value = null;
                if (artifactNameInput.value.trim() === '') {
                    artifactNameInput.value = 'artefak-teks.txt';
                }
            }
        });
    }

    // =============================================
    // ================== FUNGSI ===================
    // =============================================
    
    function toggleArtifactSelection() {
        isSelectingArtifacts = !isSelectingArtifacts;
        // Kita perlu fetch ulang data untuk render checkbox
        fetchArtifacts(); 
    }

    /**
     * (DIPERBARUI) Menampilkan daftar artefak di UI.
     * Sekarang menerima 'artifacts' sebagai parameter.
     */
    function renderArtifacts(artifacts = []) {
        if (!artifactsGrid) return;
        artifactsGrid.innerHTML = ''; // Kosongkan grid sebelum mengisi ulang

        artifacts.forEach((artifact, index) => {
            const card = document.createElement('div');
            card.className = 'artifact-card';
            // Simpan data di kartu untuk digunakan oleh event listener
            card.dataset.id = artifact.id;
            card.dataset.name = artifact.name;

            const icon = getIconForType(artifact.type);
            const checkboxHTML = isSelectingArtifacts ? `<input type="checkbox" class="artifact-checkbox" data-id="${artifact.id}">` : '';

            // Struktur HTML baru untuk kartu
            card.innerHTML = `
                ${checkboxHTML}

                <button class="artifact-menu-btn">
                    <i class="fas fa-ellipsis-v"></i>
                </button>

                <div class="artifact-menu-dropdown" style="display: none;">
                    <a href="${artifact.file_url}" download="${artifact.name}" class="artifact-action-btn">
                        <i class="fas fa-download"></i> Download
                    </a>
                    <a href="#" class="artifact-action-btn" data-action="rename">
                        <i class="fas fa-edit"></i> Rename
                    </a>
                    <a href="#" class="artifact-action-btn" data-action="delete">
                        <i class="fas fa-trash"></i> Delete
                    </a>
                </div>

                <div class="icon-wrapper">
                    <div class="icon-placeholder">${icon}</div>
                </div>
                <p>${artifact.name}</p>
            `;
            artifactsGrid.appendChild(card);
        });
    }

    /**
     * (FUNGSI BARU) Mengambil daftar artefak dari backend
     */
    async function fetchArtifacts() {
        if (!workspaceId) return; // Berhenti jika ID workspace tidak ada

        try {
            // Panggil endpoint API baru yang kita buat di views.py
            const response = await fetch(`/api/workspace/${workspaceId}/artefaks/`);
            if (!response.ok) {
                throw new Error('Gagal mengambil data artefak dari server.');
            }
            const data = await response.json();
            
            if (data.status === 'success') {
                renderArtifacts(data.artefaks); // Panggil render dengan data API
            } else {
                console.error('Error dari API:', data.errors);
            }
        } catch (error) {
            console.error('Gagal fetch artefak:', error);
            artifactsGrid.innerHTML = '<p class="error">Gagal memuat artefak.</p>';
        }
    }

    // (Fungsi renderHistory tetap sama, tapi tidak kita panggil lagi)
    function renderHistory() {
        // ... (data dummy histori) ...
    }
    
    function openUploadModal(e) {
        currentArtifactType = e.target.dataset.type;
        modalTitle.textContent = `Unggah ${e.target.textContent} Baru`;
        
        resetModalForm();
        modal.style.display = 'flex';
    }

    function closeUploadModal() {
        modal.style.display = 'none';
        resetModalForm();
    }

    function resetModalForm() {
        currentFile = null;
        textInput.value = '';
        artifactNameInput.value = '';
        fileInput.value = null;
    }
    
    function handleFile(file) {
        if (file) {
            currentFile = file;
            artifactNameInput.value = file.name;
            textInput.value = '';
            console.log('File dipilih:', currentFile);
        }
    }

    function handleFileSelect() {
        handleFile(this.files[0]);
    }
    
    function handleFileDrop(e) {
        e.preventDefault();
        fileDropArea.classList.remove('active');
        handleFile(e.dataTransfer.files[0]);
    }

    /**
     * (DIPERBARUI) Fungsi INTI: Mengirim data ke backend API.
     */
    async function handleSubmitUpload() {
        const name = artifactNameInput.value.trim();
        const textContent = textInput.value.trim();
        
        // 1. Validasi
        if (!name) {
            alert('Nama artefak harus diisi.');
            return;
        }
        if (!currentFile && !textContent) {
            alert('Silakan pilih file atau isi kolom teks.');
            return;
        }

        // 2. Siapkan FormData
        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', currentArtifactType);
        formData.append('workspace_id', workspaceId);

        // 3. Tentukan file atau teks
        if (currentFile) {
            formData.append('file', currentFile, name);
        } else if (textContent) {
            const textBlob = new Blob([textContent], { type: 'text/plain' });
            formData.append('file', textBlob, name);
        }

        // 4. Kirim ke Backend
        submitUploadBtn.textContent = 'Mengunggah...';
        submitUploadBtn.disabled = true;

        try {
            const response = await fetch('/api/artefak/upload/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: formData,
            });

            const data = await response.json();

            // (DIPERBARUI) Logika setelah sukses
            if (response.ok) { // Status 201 CREATED
                alert('Unggah berhasil!');
                
                // Panggil fetchArtifacts() untuk mengambil daftar terbaru
                // dari database, alih-alih push ke array dummy.
                fetchArtifacts(); 
                
                closeUploadModal();
            } else {
                alert(`Error: ${data.errors || 'Unggah gagal.'}`);
            }

        } catch (error) {
            console.error('Fetch error:', error);
            alert('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            submitUploadBtn.textContent = 'Unggah Artefak';
            submitUploadBtn.disabled = false;
        }
    }

    /**
     * (FUNGSI BARU) Menangani logika Hapus Artefak
     */
    async function handleDelete(artefakId, artefakName) {
        // Minta konfirmasi
        if (!confirm(`Apakah Anda yakin ingin menghapus artefak "${artefakName}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/artefak/${artefakId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Artefak berhasil dihapus.');
                fetchArtifacts(); // Refresh grid artefak
            } else {
                const data = await response.json();
                alert(`Gagal menghapus artefak: ${data.errors}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan jaringan.');
        }
    }

    /**
     * (FUNGSI BARU) Menangani logika Ubah Nama (Rename) Artefak
     */
    async function handleRename(artefakId, oldName) {
        const newName = prompt('Masukkan nama artefak baru:', oldName);

        // Jika user membatalkan (null) atau tidak mengubah apa-apa
        if (newName === null || newName.trim() === '' || newName === oldName) {
            return;
        }

        try {
            const response = await fetch(`/api/artefak/${artefakId}/update/`, {
                method: 'PATCH',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName.trim() })
            });

            if (response.ok) {
                alert('Nama artefak berhasil diubah.');
                fetchArtifacts(); // Refresh grid artefak
            } else {
                const data = await response.json();
                alert(`Gagal mengubah nama: ${data.errors}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan jaringan.');
        }
    }

    /**
     * (DIPERBARUI) Mengembalikan ikon berdasarkan TIPE API
     */
    function getIconForType(type) {
        if (!type) return '❔'; // Pengaman jika tipe null
        const typeUpper = type.toUpperCase();

        if (typeUpper.includes('DIAGRAM') || typeUpper.includes('BPMN') || typeUpper.includes('XMI')) {
            return '&lt;/&gt;'; // Ikon untuk diagram
        }
        if (typeUpper.includes('SQL')) {
            return '🗄️'; // Ikon untuk SQL
        }
        if (typeUpper.includes('SPEC') || typeUpper.includes('WIREFRAME') || typeUpper.includes('TXT')) {
            return '📄'; // Ikon untuk dokumen teks
        }
        return '❔'; // Default
    }

    /**
     * Helper untuk mengambil CSRF Token dari cookie
     */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // =============================================
    // ===== JALANKAN FUNGSI INISIALISASI =====
    // =============================================
    
    /**
     * (DIPERBARUI) Menjalankan fungsi yang diperlukan saat halaman dimuat.
     */
    function initializePage() {
        if (!workspaceId) {
            console.error('FATAL: Workspace ID tidak ditemukan. Pastikan Anda menambahkan data-workspace-id ke <body>.');
            alert('Error: Gagal memuat workspace. ID tidak ditemukan.');
        }
        fetchArtifacts(); // Panggil fungsi fetch baru
        // renderHistory(); // Biarkan dummy history, atau Anda bisa hapus
    }
    
    initializePage();
});