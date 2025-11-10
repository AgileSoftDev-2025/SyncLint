# File: artefak/bdd/unggah_artefak.feature
# Skenario BDD ini didasarkan pada Laporan SRS Bagian 4.6 dan B.2

Fitur: Mengunggah Artefak
  Sebagai pengguna, saya ingin mengunggah artefak proyek ke workspace saya
  agar sistem dapat memvalidasi formatnya dan mengubahnya menjadi JSON
  [cite_start]sehingga saya bisa menganalisisnya nanti. [cite: 397, 710, 712]

  Latar Belakang:
    Given saya adalah pengguna yang sudah login dengan email "penguji@bdd.com"
    And saya memiliki workspace "Proyek Uji Coba BDD"

  Skenario: Pengguna berhasil mengunggah artefak dengan format yang didukung
    Given saya memiliki file artefak "skema_db.sql" dengan konten "CREATE TABLE Users (id INT);"
    [cite_start]When saya mengunggah file "skema_db.sql" dengan tipe "SQL_DDL" [cite: 403]
    Then sistem merespons dengan status sukses (201)
    And artefak "skema_db.sql" tersimpan di database
    [cite_start]And artefak tersebut memiliki file JSON yang sudah diparsing [cite: 404]

  Skenario: Pengguna gagal mengunggah artefak dengan format yang tidak didukung
    Given saya memiliki file "foto_saya.jpg"
    When saya mencoba mengunggah file "foto_saya.jpg" dengan tipe "JPG"
    Then sistem merespons dengan status error (400)
    [cite_start]And saya melihat pesan error "Format file tidak didukung" [cite: 400, 803]
    And artefak "foto_saya.jpg" tidak tersimpan di database