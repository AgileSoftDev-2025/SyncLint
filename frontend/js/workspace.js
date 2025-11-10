// File: frontend/js/workspace.js (VERSI FINAL - DENGAN LOGIKA PERBANDINGAN)

document.addEventListener("DOMContentLoaded", () => {
  // =============================================
  // ================ STATE & DATA ===============
  // =============================================

  // State untuk mengontrol mode seleksi artefak
  let isSelectingArtifacts = false;
  // State untuk menyimpan ID artefak yang dipilih
  let selectedArtifacts = [];

  // State untuk modal
  let currentFile = null;
  let currentArtifactType = null;
  const workspaceId = document.body.dataset.workspaceId;

  // =============================================
  // ===== INISIALISASI & SELEKSI ELEMEN DOM =====
  // =============================================

  // Panel Utama
  const artifactsGrid = document.getElementById("artifacts-grid");
  const historyList = document.getElementById("history-list");
  const analysisPanel = document.querySelector(".analysis-panel");

  // Tombol Aksi
  const selectBtn = document.querySelector(".select-btn");
  const compareBtn = document.querySelector(".compare-btn");

  // Elemen Modal
  const modal = document.getElementById("uploadModal");
  const closeModalBtn = modal.querySelector(".close-btn");
  const uploadTriggerGrid =
    document.getElementById("upload-triggers") ||
    document.querySelector(".upload-section");
  const submitUploadBtn = modal.querySelector(".upload-btn");

  // Elemen Form Modal
  const modalTitle = modal.querySelector("#modalTitle");
  const fileDropArea = modal.querySelector(".file-drop-area");
  const fileInput = modal.querySelector(".file-input");
  const fileSelectLink = modal.querySelector(".file-select-link");
  const textInput = modal.querySelector("#artifactText");
  const artifactNameInput = modal.querySelector("#artifactNameInput");

  // Nonaktifkan tombol bandingkan di awal (Rule B2)
  if (compareBtn) {
    compareBtn.disabled = true;
  }

  // =============================================
  // =============== EVENT LISTENERS ===============
  // =============================================

  // (Basic Path 1) - User menekan tombol "Pilih Artefak"
  if (selectBtn) {
    selectBtn.addEventListener("click", toggleArtifactSelection);
  }

  // Listener untuk tombol "Bandingkan"
  if (compareBtn) {
    compareBtn.addEventListener("click", handleCompareClick);
  }

  // Listener di grid untuk menangani klik pada checkbox
  if (artifactsGrid) {
    artifactsGrid.addEventListener("click", handleArtifactClick);
  }

  if (uploadTriggerGrid) {
    uploadTriggerGrid.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON" && e.target.dataset.type) {
        openUploadModal(e);
      }
    });
  }

  // ... (Event Listener untuk Modal) ...
  if (modal) {
    closeModalBtn.addEventListener("click", closeUploadModal);
    submitUploadBtn.addEventListener("click", handleSubmitUpload);

    window.addEventListener("click", (event) => {
      if (event.target === modal) closeUploadModal();
    });

    fileSelectLink.addEventListener("click", (e) => {
      e.preventDefault();
      fileInput.click();
    });
    fileInput.addEventListener("change", handleFileSelect);

    fileDropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      fileDropArea.classList.add("active");
    });
    fileDropArea.addEventListener("dragleave", () =>
      fileDropArea.classList.remove("active")
    );
    fileDropArea.addEventListener("drop", handleFileDrop);

    textInput.addEventListener("input", () => {
      if (textInput.value.trim() !== "") {
        currentFile = null;
        fileInput.value = null;
        if (artifactNameInput.value.trim() === "") {
          artifactNameInput.value = "artefak-teks.txt";
        }
      }
    });
  }

  // =============================================
  // ================== FUNGSI ===================
  // =============================================

  /**
   * (Basic Path 1 & 2a)
   * Mengaktifkan atau menonaktifkan mode seleksi
   */
  function toggleArtifactSelection() {
    isSelectingArtifacts = !isSelectingArtifacts;

    // (Rule 2a) - Reset pilihan jika keluar mode seleksi
    if (!isSelectingArtifacts) {
      selectedArtifacts = [];
      selectBtn.textContent = "Pilih Artefak";
    } else {
      // (Basic Path 2)
      selectBtn.textContent = "Batal Pilih";
    }

    updateCompareButtonState(); // Update tombol
    fetchArtifacts(); // Render ulang grid dengan/tanpa checkbox
  }

  /**
   * (Basic Path 3, 5, 7 & NF1, NF2)
   * Menampilkan daftar artefak di UI.
   */
  function renderArtifacts(artifacts = []) {
    if (!artifactsGrid) return;
    artifactsGrid.innerHTML = "";

    // Cek Rule B3: Cek jika artefak < 2
    if (artifacts.length < 2 && selectBtn) {
      selectBtn.disabled = true;
      selectBtn.title = "Butuh minimal 2 artefak untuk membandingkan";
    } else if (selectBtn) {
      selectBtn.disabled = false;
      selectBtn.title = "";
    }

    artifacts.forEach((artifact, index) => {
      const card = document.createElement("div");
      card.className = "artifact-card";

      // Cek apakah artefak ini ada di array 'selectedArtifacts'
      const isChecked = selectedArtifacts.includes(artifact.id.toString());

      // (Basic Path 5, 7, NF1, NF2) - Tanda visual highlight
      if (isChecked) {
        card.style.border = "3px solid var(--primary-color)";
        card.style.backgroundColor = "var(--secondary-color)";
      }

      const icon = getIconForType(artifact.type);

      // (Basic Path 3) - Tampilkan checkbox HANYA jika isSelectingArtifacts
      const checkboxHTML = isSelectingArtifacts
        ? `<input type="checkbox" 
                          class="artifact-checkbox" 
                          data-id="${artifact.id}" 
                          ${isChecked ? "checked" : ""}>`
        : "";

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
   * (Basic Path 4, 6 & Rule 7a)
   * Menangani klik pada kartu artefak saat mode seleksi.
   */
  function handleArtifactClick(e) {
    // Hanya bekerja jika targetnya adalah checkbox
    const checkbox = e.target.closest(".artifact-checkbox");
    if (!isSelectingArtifacts || !checkbox) return;

    const artifactId = checkbox.dataset.id;
    const isChecked = checkbox.checked;

    if (isChecked) {
      // (Basic Path 4, 6) - User memilih
      if (selectedArtifacts.length < 2) {
        selectedArtifacts.push(artifactId);
      } else {
        // (Rule 7a) - User mencoba memilih lebih dari 2
        alert("Hanya bisa membandingkan dua artefak sekaligus.");
        checkbox.checked = false; // Batalkan centang
        return; // Hentikan fungsi
      }
    } else {
      // User membatalkan pilihan
      selectedArtifacts = selectedArtifacts.filter((id) => id !== artifactId);
    }

    // Render ulang UI untuk menampilkan highlight
    // (Kita panggil fetchArtifacts lagi agar state visual selalu update)
    fetchArtifacts();

    // (Basic Path 8) - Update status tombol "Bandingkan"
    updateCompareButtonState();
  }

  /**
   * (Basic Path 8, 9 & Rule 5a, B1, B2, NF3)
   * Mengaktifkan/menonaktifkan tombol Bandingkan
   */
  function updateCompareButtonState() {
    if (!compareBtn) return;

    if (selectedArtifacts.length === 2) {
      // (Basic Path 9, NF3)
      compareBtn.disabled = false;
      compareBtn.style.opacity = 1;
      compareBtn.style.cursor = "pointer";
    } else {
      // (Rule 5a, B2)
      compareBtn.disabled = true;
      compareBtn.style.opacity = 0.6;
      compareBtn.style.cursor = "not-allowed";
    }
  }

  /**
   * (FUNGSI BARU) Menangani klik pada tombol "Bandingkan"
   * Ini adalah fungsi yang memanggil API Backend Anda.
   */
  async function handleCompareClick() {
    if (selectedArtifacts.length !== 2) return;

    const [id1, id2] = selectedArtifacts;

    compareBtn.textContent = "Menganalisis...";
    compareBtn.disabled = true;

    try {
      const response = await fetch("/api/compare/", {
        // <-- Panggil API baru
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          artifact_id_1: id1,
          artifact_id_2: id2,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // SUKSES! Tampilkan hasil
        displayComparisonResults(data.result);
      } else {
        throw new Error(data.errors || "Gagal membandingkan");
      }
    } catch (error) {
      console.error("Gagal saat perbandingan:", error);
      alert(`Error: ${error.message}`);
    } finally {
      // Kembalikan tombol ke state normal
      compareBtn.textContent = "Bandingkan";
      // Keluar dari mode seleksi dan reset (Post-Condition)
      toggleArtifactSelection();
    }
  }

  /**
   * (FUNGSI BARU) Menampilkan hasil di UI
   */
  function displayComparisonResults(result) {
    if (!analysisPanel) return;

    // Hapus placeholder
    const placeholder = analysisPanel.querySelector(".placeholder-content");
    if (placeholder) placeholder.style.display = "none";

    // Buat HTML untuk hasil
    let htmlResult = `
            <h3>${result.comparison_summary}</h3>
            <h4>Inkonsistensi Ditemukan:</h4>
            <ul>
                ${result.inconsistencies
                  .map(
                    (item) =>
                      `<li><strong>[${item.type}]</strong> ${item.message}</li>`
                  )
                  .join("")}
            </ul>
            <h4>Saran:</h4>
            <ul>
                ${result.suggestions.map((item) => `<li>${item}</li>`).join("")}
            </ul>
        `;

    // Cari area untuk menaruh hasil, atau buat baru
    let resultContainer = analysisPanel.querySelector(".results-container");
    if (!resultContainer) {
      resultContainer = document.createElement("div");
      resultContainer.className = "results-container";
      // tambahkan style agar rapi
      resultContainer.style.textAlign = "left";
      resultContainer.style.padding = "0 20px";
      analysisPanel.appendChild(resultContainer);
    }

    resultContainer.innerHTML = htmlResult;
  }

  /**
   * (FUNGSI BARU) Mengambil daftar artefak dari backend
   */
  async function fetchArtifacts() {
    if (!workspaceId) return;

    try {
      const response = await fetch(`/api/workspace/${workspaceId}/artefaks/`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data artefak dari server.");
      }
      const data = await response.json();

      if (data.status === "success") {
        renderArtifacts(data.artefaks); // Panggil render dengan data API
      } else {
        console.error("Error dari API:", data.errors);
      }
    } catch (error) {
      console.error("Gagal fetch artefak:", error);
      if (artifactsGrid)
        artifactsGrid.innerHTML = '<p class="error">Gagal memuat artefak.</p>';
    }
  }

  // ... (Fungsi-fungsi Modal: openUploadModal, closeUploadModal, dll.) ...

  function openUploadModal(e) {
    currentArtifactType = e.target.dataset.type;
    modalTitle.textContent = `Unggah ${e.target.textContent} Baru`;

    resetModalForm();
    modal.style.display = "flex";
  }

  function closeUploadModal() {
    modal.style.display = "none";
    resetModalForm();
  }

  function resetModalForm() {
    currentFile = null;
    textInput.value = "";
    artifactNameInput.value = "";
    fileInput.value = null;
  }

  function handleFile(file) {
    if (file) {
      currentFile = file;
      artifactNameInput.value = file.name;
      textInput.value = "";
      console.log("File dipilih:", currentFile);
    }
  }

  function handleFileSelect() {
    handleFile(this.files[0]);
  }

  function handleFileDrop(e) {
    e.preventDefault();
    fileDropArea.classList.remove("active");
    handleFile(e.dataTransfer.files[0]);
  }

  /**
   * (DIPERBARUI) Fungsi INTI: Mengirim data ke backend API.
   */
  async function handleSubmitUpload() {
    const name = artifactNameInput.value.trim();
    const textContent = textInput.value.trim();

    if (!name) {
      alert("Nama artefak harus diisi.");
      return;
    }
    if (!currentFile && !textContent) {
      alert("Silakan pilih file atau isi kolom teks.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", currentArtifactType);
    formData.append("workspace_id", workspaceId);

    if (currentFile) {
      formData.append("file", currentFile, name);
    } else if (textContent) {
      const textBlob = new Blob([textContent], { type: "text/plain" });
      formData.append("file", textBlob, name);
    }

    submitUploadBtn.textContent = "Mengunggah...";
    submitUploadBtn.disabled = true;

    try {
      const response = await fetch("/api/artefak/upload/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Status 201 CREATED
        alert("Unggah berhasil!");
        fetchArtifacts();
        closeUploadModal();
      } else {
        alert(`Error: ${data.errors || "Unggah gagal."}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      submitUploadBtn.textContent = "Unggah Artefak";
      submitUploadBtn.disabled = false;
    }
  }

  /**
   * (DIPERBARUI) Mengembalikan ikon berdasarkan TIPE API
   */
  function getIconForType(type) {
    if (!type) return "❔";
    const typeUpper = type.toUpperCase();

    if (
      typeUpper.includes("DIAGRAM") ||
      typeUpper.includes("BPMN") ||
      typeUpper.includes("XMI")
    ) {
      return "&lt;/&gt;"; // Ikon untuk diagram
    }
    if (typeUpper.includes("SQL")) {
      return "🗄️"; // Ikon untuk SQL
    }
    if (
      typeUpper.includes("SPEC") ||
      typeUpper.includes("WIREFRAME") ||
      typeUpper.includes("TXT")
    ) {
      return "📄"; // Ikon untuk dokumen teks
    }
    return "❔"; // Default
  }

  /**
   * Helper untuk mengambil CSRF Token dari cookie
   */
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
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

  function initializePage() {
    if (!workspaceId) {
      console.error("FATAL: Workspace ID tidak ditemukan.");
      alert("Error: Gagal memuat workspace. ID tidak ditemukan.");
      return;
    }
    fetchArtifacts(); // Panggil fungsi fetch baru
    // renderHistory(); // (Anda bisa mengaktifkan ini jika sudah ada API history)
  }

  initializePage();
});
