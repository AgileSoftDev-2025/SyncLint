// Menunggu hingga seluruh konten halaman siap sebelum menjalankan skrip.
document.addEventListener("DOMContentLoaded", () => {

    // =============================================
    // ================ STATE & DATA ===============
    // =============================================
    
    // State untuk mengontrol mode seleksi artefak
    let isSelectingArtifacts = false;

    // Data dummy untuk artefak proyek (nantinya akan diganti data dari API)
    const artifactsData = [
        { name: 'ERD_Akademik.xml', date: '15/11/2025', type: 'xml' },
        { name: 'Use_Case_Pendaftaran_Login.txt', date: '15/11/2025', type: 'txt' },
        { name: 'Skema_DB_Pengguna.sql', date: '15/11/2025', type: 'sql' },
        { name: 'Konfigurasi_Aplikasi.xml', date: '16/11/2025', type: 'xml' },
        { name: 'Log_Server_20251116.txt', date: '16/11/2025', type: 'txt' },
        { name: 'Tabel_Produk.sql', date: '17/11/2025', type: 'sql' }
        // ...dan seterusnya
    ];

    // Data dummy untuk riwayat (nantinya akan diganti data dari API)
    const historyData = [
        { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
        { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
        { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    ];

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
    const uploadButtons = document.querySelectorAll('.upload-section button');
    const fileDropArea = modal.querySelector('.file-drop-area');
    const fileInput = modal.querySelector('.file-input');
    const artifactNamePreview = modal.querySelector('#artifactNamePreview');

    // =============================================
    // =============== EVENT LISTENERS ===============
    // =============================================
    
    if (selectBtn) {
        selectBtn.addEventListener('click', toggleArtifactSelection);
    }
    
    // Pasang listener untuk semua tombol "Unggah"
    uploadButtons.forEach(button => {
        button.addEventListener('click', openUploadModal);
    });

    // Event listener untuk elemen di dalam modal
    if (modal) {
        closeModalBtn.addEventListener('click', closeUploadModal);
        window.addEventListener('click', (event) => {
            if (event.target === modal) closeUploadModal();
        });
        
        // Fungsionalitas drag-and-drop dan pilih file
        fileDropArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        
        // Mencegah perilaku default browser saat file di-drag ke area drop
        fileDropArea.addEventListener('dragover', (e) => e.preventDefault());
        fileDropArea.addEventListener('drop', handleFileDrop);
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
     * Membuka modal pop-up untuk mengunggah artefak.
     */
    function openUploadModal() {
        modal.style.display = 'flex';
    }

    /**
     * Menutup modal pop-up dan mereset isinya.
     */
    function closeUploadModal() {
        modal.style.display = 'none';
        artifactNamePreview.textContent = 'Contoh_Nama.txt'; // Reset nama file
        fileInput.value = ''; // Reset input file
    }
    
    /**
     * Menangani file yang dipilih melalui dialog atau di-drop.
     * @param {FileList} files - Daftar file dari input atau event drop.
     */
    function handleFile(files) {
        if (files.length > 0) {
            const fileName = files[0].name;
            artifactNamePreview.textContent = fileName;
        }
    }

    function handleFileSelect() {
        handleFile(this.files);
    }
    
    function handleFileDrop(e) {
        e.preventDefault();
        handleFile(e.dataTransfer.files);
    }

    /**
     * Mengembalikan ikon emoji berdasarkan tipe file.
     * @param {string} type - Ekstensi file (xml, txt, sql).
     * @returns {string} String emoji ikon.
     */
    function getIconForType(type) {
        switch (type) {
            case 'xml': return '&lt;/&gt;';
            case 'txt': return '📄';
            case 'sql': return '🗄️';
            default: return '❔';
        }
    }

    // =============================================
    // ===== JALANKAN FUNGSI INISIALISASI =====
    // =============================================
    
    /**
     * Menjalankan semua fungsi yang diperlukan saat halaman pertama kali dimuat.
     */
    function initializePage() {
        renderArtifacts();
        renderHistory();
    }
    
    initializePage();
});