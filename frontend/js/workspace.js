// Data dummy untuk artefak proyek
const artifactsData = [
    { name: 'ERD_Akademik.xml', date: '15/11/2025', type: 'xml' },
    { name: 'Use_Case_Pendaftaran_Login.txt', date: '15/11/2025', type: 'txt' },
    { name: 'Skema_DB_Pengguna.sql', date: '15/11/2025', type: 'sql' },
    { name: 'Konfigurasi_Aplikasi.xml', date: '16/11/2025', type: 'xml' },
    { name: 'Log_Server_20251116.txt', date: '16/11/2025', type: 'txt' },
    { name: 'Tabel_Produk.sql', date: '17/11/2025', type: 'sql' },
    { name: 'Antarmuka_API.xml', date: '17/11/2025', type: 'xml' },
    { name: 'Deskripsi_Skenario.txt', date: '18/11/2025', type: 'txt' },
    { name: 'Query_Analisis_Penjualan.sql', date: '18/11/2025', type: 'sql' },
    { name: 'Sitemap_Website.xml', date: '19/11/2025', type: 'xml' },
    { name: 'Dokumen_Persyaratan.txt', date: '19/11/2025', type: 'txt' },
    { name: 'Script_Migrasi_V3.sql', date: '20/11/2025', type: 'sql' },
    { name: 'Data_Pelanggan.xml', date: '20/11/2025', type: 'xml' },
    { name: 'Catatan_Meeting.txt', date: '21/11/2025', type: 'txt' },
    { name: 'Backup_DB_Utama.sql', date: '21/11/2025', type: 'sql' },
    { name: 'Konfigurasi_Lokal.xml', date: '22/11/2025', type: 'xml' },
    { name: 'Feedback_Pengguna.txt', date: '22/11/2025', type: 'txt' },
    { name: 'Stored_Procedure.sql', date: '23/11/2025', type: 'sql' },
];

// Data dummy untuk riwayat
const historyData = [
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
];

// State: apakah sedang memilih artefak
let selectingArtifacts = false;

// Fungsi untuk mendapatkan ikon berdasarkan tipe file
function getIconForType(type) {
    switch (type) {
        case 'xml':
            return '&lt;/&gt;';
        case 'txt':
            return '📄';
        case 'sql':
            return '🗄️';
        default:
            return '';
    }
}

// Fungsi untuk merender artefak
function renderArtifacts() {
    const grid = document.getElementById('artifacts-grid');
    grid.innerHTML = '';

    artifactsData.forEach((artifact, index) => {
        const card = document.createElement('div');
        card.className = 'artifact-card';
        const icon = getIconForType(artifact.type);

        // Checkbox kiri atas
        const checkbox = selectingArtifacts
            ? `<input type="checkbox" class="artifact-checkbox" data-index="${index}">`
            : '';

        card.innerHTML = `
            ${checkbox}
            <div class="icon-placeholder">${icon}</div>
            <p>${artifact.name}</p>
            <p class="date">${artifact.date}</p>
        `;
        grid.appendChild(card);
    });
}


// Fungsi untuk merender riwayat
function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';

    historyData.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${item.text}</span>
            <span>${item.date}</span>
        `;
        list.appendChild(listItem);
    });
}

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    // ... (kode yang sudah ada sebelumnya) ...

    // === LOGIKA MODAL (VERSI BARU) ===

    // 1. Ambil elemen-elemen yang dibutuhkan
    const modal = document.getElementById('uploadModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const uploadButtons = document.querySelectorAll('.upload-section button');
    const modalTitle = document.getElementById('modalTitle');
    
    // Elemen baru di modal
    const fileDropArea = document.querySelector('.file-drop-area');
    const fileInput = document.querySelector('.file-input');
    const artifactNamePreview = document.getElementById('artifactNamePreview'); // Diperbarui
    const fileSelectLink = document.querySelector('.file-select-link');

    // 2. Fungsi untuk menampilkan modal
    function openModal(event) {
        // Judul modal sekarang statis sesuai desain baru
        modalTitle.textContent = 'Unggah (Pilihan Jenis Artefak) Baru';
        modal.style.display = 'flex';
    }

    // 3. Fungsi untuk menyembunyikan modal
    function closeModal() {
        modal.style.display = 'none';
        // Reset nama file saat modal ditutup
        artifactNamePreview.textContent = 'Contoh_Nama.txt';
        fileInput.value = ''; // Kosongkan input file
    }

    // 4. Tambahkan event listener ke setiap tombol unggah
    uploadButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    // 5. Tambahkan event listener ke tombol close (X)
    closeModalBtn.addEventListener('click', closeModal);

    // 6. Tutup modal jika user mengklik di luar area konten
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // 7. Fungsionalitas Area Unggah File
    fileDropArea.addEventListener('click', () => {
        fileInput.click();
    });
    // Juga buat link di dalamnya bisa diklik
    fileSelectLink.addEventListener('click', (e) => {
        e.preventDefault(); // Mencegah link pindah halaman
        fileInput.click();
    });

    // 8. Saat file sudah dipilih, perbarui teks nama artefak
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;
            // Perbarui teks di dalam <span>
            artifactNamePreview.textContent = fileName;
        }
    });
});
