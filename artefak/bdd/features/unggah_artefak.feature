Feature: Mengunggah Artefak
  Sebagai pengguna, saya ingin mengunggah artefak proyek ke workspace saya
  agar sistem dapat memvalidasi formatnya dan mengubahnya menjadi JSON
  sehingga saya bisa menganalisisnya nanti.

  Background:
    Given saya adalah pengguna yang sudah login dengan email "penguji@bdd.com"
    And saya memiliki workspace "Proyek Uji Coba BDD"

  Scenario: Pengguna berhasil mengunggah artefak dengan format yang didukung
    Given saya memiliki file artefak "skema_db.sql" dengan konten "CREATE TABLE Users (id INT);"
    When saya mengunggah file "skema_db.sql" dengan tipe "SQL_DDL"
    Then sistem merespons dengan status sukses (201)
    And artefak "skema_db.sql" tersimpan di database
    And artefak tersebut memiliki file JSON yang sudah diparsing

  Scenario: Pengguna gagal mengunggah artefak dengan format yang tidak didukung
    Given saya memiliki file "foto_saya.jpg"
    When saya mencoba mengunggah file "foto_saya.jpg" dengan tipe "JPG"
    Then sistem merespons dengan status error (400)
    And saya melihat pesan error "Format file tidak didukung"
    And artefak "foto_saya.jpg" tidak tersimpan di database
