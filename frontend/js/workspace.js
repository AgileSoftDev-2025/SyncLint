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
            // Gunakan 'artifact.type' (dari API)
            const icon = getIconForType(artifact.type); 
            const checkboxHTML = isSelectingArtifacts ? `<input type="checkbox" class="artifact-checkbox" data-id="${artifact.id}">` : '';

            // Buat link download
            const downloadLink = `
                <a href="${artifact.file_url}" download="${artifact.name}" class="artifact-download-link">
                    <div class="icon-wrapper">
                        <div class="icon-placeholder">${icon}</div>
                        <i class="fas fa-download download-icon"></i> </div>
                    <p>${artifact.name}</p>
                </a>
            `;

            card.innerHTML = `
                ${checkboxHTML}
                ${downloadLink}
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