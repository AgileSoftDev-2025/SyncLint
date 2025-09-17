// Menu ⋮ (rename & delete)
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("menu-dot")) {
        event.stopPropagation();
        document.querySelectorAll('.menu').forEach(menu => menu.remove());

        const dot = event.target;
        const menu = document.createElement('div');
        menu.className = 'menu';
        menu.innerHTML = `
            <div onclick="renameWorkspace(this)">Rename</div>
            <div onclick="deleteWorkspace(this)">Delete</div>
        `;
        dot.parentElement.appendChild(menu);
        menu.style.display = 'block';

        const handleClickOutside = (e) => {
            if (!menu.contains(e.target) && !dot.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        };
        setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    }
});

function renameWorkspace(element) {
    const card = element.closest('.card');
    const cardTitle = card.querySelector('.card-title');
    const newName = prompt('Masukkan nama baru:', cardTitle.textContent.trim());
    if (newName) {
        cardTitle.textContent = newName;
    }
    element.parentElement.remove();
}

function deleteWorkspace(element) {
    if (confirm('Apakah Anda yakin ingin menghapus workspace ini?')) {
        element.closest('.card').remove();
    }
}

// Modal Buat Workspace
const modal = document.getElementById("workspaceModal");
const addBtn = document.querySelector(".add-btn");
const closeBtn = document.querySelector(".close");
const createBtn = document.getElementById("createWorkspaceBtn");
const inputName = document.getElementById("workspaceName");

addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    inputName.value = "";
    inputName.focus();
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

function createWorkspace() {
    const name = inputName.value.trim();
    if (name) {
        const grid = document.querySelector(".grid");
        const newCard = document.createElement("div");
        newCard.className = "card";
        newCard.innerHTML = `
            <div class="card-top">
                <img src="https://img.icons8.com/ios/50/000000/document.png" 
                     alt="Document Icon" class="document-icon">
            </div>
            <div class="menu-dot">⋮</div>
            <div class="card-bottom">
                <div class="card-title">${name}</div>
                <span>Dibuat: ${new Date().toLocaleDateString()}</span><br>
                <span>Terakhir dilihat: Baru saja</span>
            </div>
        `;
        grid.appendChild(newCard);
        modal.style.display = "none";
    } else {
        alert("Nama workspace tidak boleh kosong!");
    }
}

createBtn.addEventListener("click", createWorkspace);

// Tambahkan submit dengan ENTER
inputName.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        createWorkspace();
    }
});
