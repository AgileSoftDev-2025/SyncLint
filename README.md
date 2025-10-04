# 🔎 SyncLint

Sebuah proyek untuk mata kuliah **Pembangunan Perangkat Lunak (Praktikum)** Kelas I2, dikerjakan oleh Kelompok 3.

**Tujuan:** Membangun sebuah sistem cerdas yang mampu menganalisis dan memvalidasi konsistensi antara berbagai artefak dalam siklus pengembangan perangkat lunak. SyncLint membantu *software engineer* dan analis sistem untuk mendeteksi inkonsistensi sejak dini, memastikan semua dokumen desain selaras, dan mengurangi risiko kesalahan pada tahap implementasi.

---

## ✨ Fitur Utama

-   🔐 **Autentikasi Pengguna**: Sistem login dan registrasi yang aman untuk setiap pengguna.
-   🗂️ **Manajemen Workspace**: Pengguna dapat membuat *workspace* terpisah untuk setiap proyek, memungkinkan pengelolaan artefak yang terorganisir.
-   👤 **Profil Pengguna**: Halaman untuk mengelola informasi akun pribadi.
-   📤 **Unggah Artefak Multi-Format**: Mendukung pengunggahan 8 jenis artefak perangkat lunak yang berbeda, termasuk:
    -   Use Case Specification (`.txt`, `.md`)
    -   BPMN & Diagram UML (Class, Use Case, Activity, Sequence) (`.xml`, `.xmi`)
    -   Wireframe (`.puml`, `.salt`)
    -   SQL DDL Script (`.sql`)
-   🔬 **Analisis Konsistensi Cerdas**: Membandingkan **dua artefak** yang dipilih untuk mengidentifikasi potensi inkonsistensi berdasarkan aturan kontekstual yang telah didefinisikan.
-   📊 **Laporan Hasil Analisis**: Menghasilkan laporan terstruktur yang mengkategorikan temuan menjadi perbedaan *major*, *minor*, dan saran perbaikan.
-   📜 **Riwayat Perbandingan**: Menyimpan semua laporan hasil analisis di dalam *workspace* untuk dapat diakses kembali di kemudian hari.

---

## 💻 Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| *Framework Backend* | Django |
| *Frontend* | HTML, CSS, Vanilla JavaScript |
| *Database* | PostgreSQL |
| *Bahasa Pemrograman* | Python |
| *Version Control* | Git & GitHub |

---

## 🧑‍💻 Anggota Tim

-   Afifa Az’zahra (187231018)
-   Muhammad Hildan Afri Zakaria (187231039)
-   Narendra Wisnwa Caraka (187231046)
-   Putu Bagus Aan Giri Wiguna (187231048)
-   Dezilva Zafiazka Setyano (187231068)
-   Valensia Agatha Maritho Pakpahan (187231115)

---

## 🔮 Rencana Pengembangan

-   🧠 **Integrasi LLM**: Mengintegrasikan *Consistency Engine* dengan API pihak ketiga seperti **Gemini AI** untuk analisis perbandingan yang lebih mendalam dan akurat.
-   🧩 **Peningkatan Parser**: Menggunakan AI untuk *parsing* artefak berbasis teks seperti *Use Case Specification* untuk ekstraksi entitas yang lebih cerdas.
-   🔗 **Analisis Multi-Artefak**: Mengembangkan kemampuan untuk menganalisis lebih dari dua artefak sekaligus untuk memberikan gambaran konsistensi proyek yang holistik.
-   ⚙️ **Kustomisasi Aturan**: Memungkinkan pengguna untuk menambah atau mengubah aturan perbandingan di dalam *workspace* mereka.
-   🌐 **Dukungan Artefak Baru**: Menambah dukungan untuk jenis artefak lain seperti *Requirements Traceability Matrix* atau dokumen arsitektur.

---

## 🏷️ Lisensi

Project ini dibuat untuk kepentingan akademik dan pembelajaran.
Bebas digunakan dan dikembangkan kembali untuk keperluan pendidikan.