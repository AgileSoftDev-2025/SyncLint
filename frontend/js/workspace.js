// File: frontend/js/workspace.js (TERBARU)

document.addEventListener("DOMContentLoaded", () => {

    // =============================================
    // ================ STATE & DATA ===============
    // =============================================
    
    // State untuk mengontrol mode seleksi artefak
    let isSelectingArtifacts = false;

    // State untuk data (nantinya akan diisi dari API)
    // Kita akan tambahkan artefak baru ke array ini setelah unggah
    const artifactsData = [
        { name: 'ERD_Akademik.xml', date: '15/11/2025', type: 'xml' },
        { name: 'Use_Case_Pendaftaran_Login.txt', date: '15/11/2025', type: 'txt' },
        { name: 'Skema_DB_Pengguna.sql', date: '15/11/2025', type: 'sql' },
        { name: 'Konfigurasi_Aplikasi.xml', date: '16/11/2025', type: 'xml' },
        { name: 'Log_Server_20251116.txt', date: '16/11/2025', type: 'txt' },
        { name: 'Tabel_Produk.sql', date: '17/11/2025', type: 'sql' }
    ];

    const historyData = [
        { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
        { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
        { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    ];

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
    const uploadTriggerGrid = document.getElementById('upload-triggers') || document.querySelector('.upload-section'); // Ambil grid tombol
    const submitUploadBtn = modal.querySelector('.upload-btn'); // Tombol "Unggah Artefak" di modal
    
    // Elemen Form Modal
    const modalTitle = modal.querySelector('#modalTitle');
    const fileDropArea = modal.querySelector('.file-drop-area');
    const fileInput = modal.querySelector('.file-input');
    const fileSelectLink = modal.querySelector('.file-select-link');
    const textInput = modal.querySelector('#artifactText');
    const artifactNameInput = modal.querySelector('#artifactNameInput'); // Ganti dari 'artifactNamePreview'

    // =============================================
    // =============== EVENT LISTENERS ===============
    // =============================================
    
    if (selectBtn) {
        selectBtn.addEventListener('click', toggleArtifactSelection);
    }
    
    // Pasang listener di grid tombol, bukan di tiap tombol
    if (uploadTriggerGrid) {
        uploadTriggerGrid.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.type) {
                openUploadModal(e); // Panggil fungsi dengan event
            }
        });
    }

    // Event listener untuk elemen di dalam modal
    if (modal) {
        closeModalBtn.addEventListener('click', closeUploadModal);
        submitUploadBtn.addEventListener('click', handleSubmitUpload); // Listener untuk submit

        window.addEventListener('click', (event) => {
            if (event.target === modal) closeUploadModal();
        });
        
        // Fungsionalitas drag-and-drop dan pilih file
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

        // Jika mengetik di textarea, hapus file
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
    
    /**
     * Mengaktifkan atau menonaktifkan mode seleksi artefak.
     */
    function toggleArtifactSelection() {
        isSelectingArtifacts = !isSelectingArtifacts;
        renderArtifacts(); // Render ulang artefak untuk menampilkan/menyembunyikan checkbox
    }

    /**
     * Menampilkan daftar artefak di UI.
     */
    function renderArtifacts() {
        if (!artifactsGrid) return;
        artifactsGrid.innerHTML = ''; // Kosongkan grid sebelum mengisi ulang

        artifactsData.forEach((artifact, index) => {
            const card = document.createElement('div');
            card.className = 'artifact-card';
            const icon = getIconForType(artifact.type);
            const checkboxHTML = isSelectingArtifacts ? `<input type="checkbox" class="artifact-checkbox" data-index="${index}">` : '';

            card.innerHTML = `
                ${checkboxHTML}
                <div class="icon-placeholder">${icon}</div>
                <p>${artifact.name}</p>
                <p class="date">${artifact.date}</p>
            `;
            artifactsGrid.appendChild(card);
        });
    }

    /**
     * Menampilkan daftar riwayat perbandingan di UI.
     */
    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';

        historyData.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>${item.text}</span><span>${item.date}</span>`;
            historyList.appendChild(listItem);
        });
    }
    
    /**
     * Membuka modal pop-up dan MENGINGAT tipe artefak.
     */
    function openUploadModal(e) {
        // Simpan tipe artefak dari tombol yang diklik
        currentArtifactType = e.target.dataset.type;
        // Set judul modal
        modalTitle.textContent = `Unggah ${e.target.textContent} Baru`;
        
        resetModalForm();
        modal.style.display = 'flex';
    }

    /**
     * Menutup modal pop-up dan mereset isinya.
     */
    function closeUploadModal() {
        modal.style.display = 'none';
        resetModalForm();
    }

    /**
     * Mereset form di dalam modal
     */
    function resetModalForm() {
        currentFile = null;
        // HAPUS BARIS DI ATAS
        textInput.value = '';
        artifactNameInput.value = '';
        fileInput.value = null; // Reset input file
    }
    
    /**
     * Menangani file yang dipilih melalui dialog atau di-drop.
     */
    function handleFile(file) {
        if (file) {
            currentFile = file;
            artifactNameInput.value = file.name; // Otomatis isi nama file
            textInput.value = ''; // Hapus input teks jika file dipilih
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
     * Fungsi INTI: Mengirim data ke backend API.
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
            // Jika pengguna memilih file
            formData.append('file', currentFile, name);
        } else if (textContent) {
            // Jika pengguna mengetik di textarea, buat file dari teks
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
                    'X-CSRFToken': getCookie('csrftoken'), // Penting untuk keamanan Django
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) { // Status 201 CREATED
                alert('Unggah berhasil!');
                
                // Tambahkan artefak baru ke data
                const newArtifact = data.artefak;
                artifactsData.push({
                    name: newArtifact.name,
                    date: new Date().toLocaleDateString('id-ID'), // Buat tanggal hari ini
                    type: newArtifact.type.toLowerCase().split('_')[0] // 'SQL_DDL' -> 'sql'
                });
                renderArtifacts(); // Panggil fungsi render Anda
                
                closeUploadModal();
            } else {
                // Tampilkan error dari backend
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
     * Mengembalikan ikon emoji berdasarkan tipe file.
     */
    function getIconForType(type) {
        // Disederhanakan agar cocok dengan data dummy dan data baru
        const typeSimple = type.toLowerCase();
        if (typeSimple.includes('xml') || typeSimple.includes('bpmn') || typeSimple.includes('diagram')) {
            return '&lt;/&gt;';
        }
        if (typeSimple.includes('txt') || typeSimple.includes('spec')) {
            return '📄';
        }
        if (typeSimple.includes('sql')) {
            return '🗄️';
        }
        return '❔';
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
     * Menjalankan semua fungsi yang diperlukan saat halaman pertama kali dimuat.
     */
    function initializePage() {
        if (!workspaceId) {
            console.error('FATAL: Workspace ID tidak ditemukan. Pastikan Anda menambahkan data-workspace-id ke <body>.');
            alert('Error: Gagal memuat workspace. ID tidak ditemukan.');
        }
        renderArtifacts();
        renderHistory();
    }
    
    initializePage();
});