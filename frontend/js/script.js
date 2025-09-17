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
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
    { text: 'Histori Laporan Hasil Perbandingan...', date: '20 Agustus 2025' },
];

// Fungsi untuk mendapatkan ikon berdasarkan tipe file
function getIconForType(type) {
    switch (type) {
        case 'xml':
            return '&lt;/&gt;';
        case 'txt':
            return '📄'; // Emoji kertas
        case 'sql':
            return '🗄️'; // Emoji lemari arsip
        default:
            return '';
    }
}

// Fungsi untuk merender artefak
function renderArtifacts() {
    const grid = document.getElementById('artifacts-grid');
    grid.innerHTML = ''; // Clear existing content

    artifactsData.forEach(artifact => {
        const card = document.createElement('div');
        card.className = 'artifact-card';
        const icon = getIconForType(artifact.type);
        card.innerHTML = `
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
    list.innerHTML = ''; // Clear existing content

    historyData.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${item.text}</span>
            <span>${item.date}</span>
        `;
        list.appendChild(listItem);
    });
}

// Panggil fungsi render saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderArtifacts();
    renderHistory();
});