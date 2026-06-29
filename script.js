// =======================
// ✅ DATA (LOAD FROM LOCAL STORAGE IF EXISTS)
// =======================
// 
if (localStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "login.html";
}

let books = JSON.parse(localStorage.getItem("books"));
if (!books || !Array.isArray(books)) {
  books = [
    { id: 1, title: "Java Programming", isIssued: false, count: 0 },
    { id: 2, title: "Data Structures", isIssued: false, count: 0 },
    { id: 3, title: "Database Systems", isIssued: false, count: 0 },
    { id: 4, title: "C Programming", isIssued: false, count: 0 },
    { id: 5, title: "Python", isIssued: false, count: 0 },
    { id: 6, title: "English Grammar", isIssued: false, count: 0 },
    { id: 7, title: "Discrete Mathematics", isIssued: false, count: 0 },
    { id: 8, title: "Environmental Science", isIssued: false, count: 0 },
    { id: 9, title: "DPCO", isIssued: false, count: 0 },
    { id: 10, title: "EEE", isIssued: false, count: 0 },
  ];
}


let members = JSON.parse(localStorage.getItem("members"));
if (!members || !Array.isArray(members)) {
  members = [
    { id: 2117240020101, name: "Gokul" },
    { id: 2117240020102, name: "Tinku" },
    { id: 2117240020103, name: "Ravi" },
    { id: 2117240020104, name: "Anita" },
    { id: 2117240020105, name: "Priya" },
    { id: 2117240020106, name: "Vikram" },
    { id: 2117240020107, name: "Sneha" },
    { id: 2117240020108, name: "Janavi" },
    { id: 2117240020109, name: "Rio" },
    { id: 2117240020110, name: "Babu" },
  ];
}


let history = JSON.parse(localStorage.getItem("history")) || [];

// ✅ Save all data to storage
function saveData() {
  localStorage.setItem("books", JSON.stringify(books));
  localStorage.setItem("members", JSON.stringify(members));
  localStorage.setItem("history", JSON.stringify(history));
}

// =======================
// ✅ UI SECTION SWITCHING
// =======================
function showSection(action) {
  const forms = document.getElementById("forms");
  forms.innerHTML = "";

  if (action === "issue") {
    forms.innerHTML = `
      <h2>Issue Book</h2>
      <input type="number" id="issueId" placeholder="Book ID">
      <input type="number" id="memberId" placeholder="Member ID">
      <button onclick="issueBook()">Issue</button>
    `;
  } else if (action === "return") {
    forms.innerHTML = `
      <h2>Return Book</h2>
      <input type="number" id="returnId" placeholder="Book ID">
      <button onclick="returnBook()">Return</button>
    `;
  } else if (action === "addMember") {
    forms.innerHTML = `
      <h2>Add Member</h2>
      <input type="number" id="memId" placeholder="Member ID">
      <input type="text" id="memName" placeholder="Member Name">
      <button onclick="addMember()">Add</button>
    `;
  } else if (action === "addBook") {
    forms.innerHTML = `
      <h2>Add Book</h2>
      <input type="number" id="bookId" placeholder="Book ID">
      <input type="text" id="bookTitle" placeholder="Book Title">
      <button onclick="addBook()">Add</button>
    `;
  } else if (action === "scan") {
    forms.innerHTML = `
      <h2>📷 Entry Log Scanner</h2>
      <div id="reader"></div>
      <div id="log">
        <h3>Scan Entries</h3>
        <div id="entries"></div>
      </div>
    `;
    startScanner();
  } else if (action === "remove") {
    forms.innerHTML = `
      <h2>Remove</h2>
      <button onclick="removeOption('member')">Remove Member</button>
      <button onclick="removeOption('book')">Remove Book</button>
    `;
  }
}

// =======================
// ✅ Remove UI Options
// =======================
function removeOption(type) {
  const forms = document.getElementById("forms");

  if (type === "member") {
    forms.innerHTML = `
      <h2>Remove Member</h2>
      <input type="number" id="deleteMemberId" placeholder="Enter Member ID">
      <button onclick="removeMember()">Delete</button>
      <button onclick="showSection('remove')">Back</button>
    `;
  } else {
    forms.innerHTML = `
      <h2>Remove Book</h2>
      <input type="number" id="deleteBookId" placeholder="Enter Book ID">
      <button onclick="removeBook()">Delete</button>
      <button onclick="showSection('remove')">Back</button>
    `;
  }
}

// =======================
// ✅ CRUD Operations
// =======================
function issueBook() {
  let bookId = parseInt(document.getElementById("issueId").value);
  let memberId = parseInt(document.getElementById("memberId").value);

  let book = books.find(b => b.id === bookId);
  let member = members.find(m => m.id === memberId);

  if (book && member && !book.isIssued) {
    book.isIssued = true;
    book.count++;

    history.push({
      bookId: book.id,
      bookTitle: book.title,
      memberId: member.id,
      memberName: member.name,
      date: new Date().toLocaleString(),
      returned: false
    });

    alert(`Book issued: ${book.title} to ${member.name}`);
  } else {
    alert("Invalid book or already issued.");
  }

  updateDashboard();
}

function returnBook() {
  let bookId = parseInt(document.getElementById("returnId").value);
  let book = books.find(b => b.id === bookId);

  if (book && book.isIssued) {
    book.isIssued = false;

    let record = history.filter(h => h.bookId === book.id && !h.returned).pop();
    if (record) record.returned = true;

    alert(`Book returned: ${book.title}`);
  } else {
    alert("Invalid return!");
  }
  updateDashboard();
}

function addMember() {
  let id = parseInt(document.getElementById("memId").value);
  let name = document.getElementById("memName").value;

  if (id && name) {
    members.push({ id, name });
    alert(`Member added: ${name}`);
  }
  updateDashboard();
}

function addBook() {
  let id = parseInt(document.getElementById("bookId").value);
  let title = document.getElementById("bookTitle").value;

  if (id && title) {
    books.push({ id, title, isIssued: false, count: 0 });
    alert(`Book added: ${title}`);
  }
  updateDashboard();
}

// =======================
// ✅ REMOVE Functions
// =======================
function removeMember() {
  let id = parseInt(document.getElementById("deleteMemberId").value);
  let index = members.findIndex(m => m.id === id);

  if (index === -1) return alert("❌ Invalid Member ID");

  if (!confirm(`Delete member: ${members[index].name}?`)) return;

  members.splice(index, 1);
  alert("✅ Member removed");
  updateDashboard();
}

function removeBook() {
  let id = parseInt(document.getElementById("deleteBookId").value);
  let index = books.findIndex(b => b.id === id);

  if (index === -1) return alert("❌ Invalid Book ID");

  if (books[index].isIssued) {
    return alert("⚠ Cannot delete. Book is currently issued.");
  }

  if (!confirm(`Delete book: ${books[index].title}?`)) return;

  books.splice(index, 1);
  alert("✅ Book removed");
  updateDashboard();
}

// =======================
// ✅ UPDATE UI + SAVE DATA
// =======================
function updateDashboard() {
  saveData(); // ✅ Saves after every change

  document.getElementById("totalBooks").innerText = books.length;
  document.getElementById("issuedBooks").innerText = books.filter(b => b.isIssued).length;
  document.getElementById("availableBooks").innerText = books.filter(b => !b.isIssued).length;
  document.getElementById("totalMembers").innerText = members.length;

  renderTables();
  renderHistory();
}

function renderTables() {
  const booksBody = document.querySelector("#booksTable tbody");
  booksBody.innerHTML = "";
  books.forEach(b => {
    booksBody.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.title}</td>
        <td>${b.isIssued ? "📕 Issued" : "📗 Available"}</td>
        <td>${b.count ?? 0}</td>

         
      </tr>`;
  });

  const membersBody = document.querySelector("#membersTable tbody");
  membersBody.innerHTML = "";
  members.forEach(m => {
    membersBody.innerHTML += `
      <tr>
        <td>${m.id}</td>
        <td>${m.name}</td>
      </tr>`;
  });
}
// =======================
// ✅ LIVE SEARCH FILTER
// =======================
document.getElementById("searchInput").addEventListener("keyup", function () {
  const searchText = this.value.toLowerCase();

  // Filter Books
  const bookRows = document.querySelectorAll("#booksTable tbody tr");
  bookRows.forEach(row => {
    const id = row.children[0].textContent.toLowerCase();
    const title = row.children[1].textContent.toLowerCase();
    row.style.display = (id.includes(searchText) || title.includes(searchText)) ? "" : "none";
  });

  // Filter Members
  const memberRows = document.querySelectorAll("#membersTable tbody tr");
  memberRows.forEach(row => {
    const id = row.children[0].textContent.toLowerCase();
    const name = row.children[1].textContent.toLowerCase();
    row.style.display = (id.includes(searchText) || name.includes(searchText)) ? "" : "none";
  });
});


function renderHistory() {
  let card = document.getElementById("historyCard");
  if (!card) {
    card = document.createElement("div");
    card.className = "card";
    card.id = "historyCard";
    card.innerHTML = `
      <h2>History</h2>
      <table id="historyTable">
        <thead>
          <tr><th>Book</th><th>Member</th><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody></tbody>
      </table>`;
    document.querySelector("main").appendChild(card);
  }

  const historyBody = document.querySelector("#historyTable tbody");
  historyBody.innerHTML = "";

  history.forEach(h => {
    historyBody.innerHTML += `
      <tr>
        <td>${h.bookTitle}</td>
        <td>${h.memberName}</td>
        <td>${h.date}</td>
        <td>${h.returned ? "✅ Returned" : "❌ Not Returned"}</td>
      </tr>`;
  });
}

// =======================
// ✅ QR CODE SCANNER
// =======================
const qrScript = document.createElement("script");
qrScript.src = "https://unpkg.com/html5-qrcode";
document.head.appendChild(qrScript);

function startScanner() {
  if (typeof Html5Qrcode === "undefined") {
    return alert("QR library loading, please wait.");
  }

  const logDiv = document.getElementById("entries");
  const scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      const entry = document.createElement("div");
      entry.className = "entry";
      entry.textContent = `Number: ${decodedText} — Time: ${new Date().toLocaleString()}`;
      logDiv.prepend(entry);
    }
  );
}

// =======================
// ✅ THEME SAVE
// =======================
const themeBtn = document.getElementById("themeToggle");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀ Light Mode" : "🌙 Dark Mode";
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀ Light Mode";
}

// ✅ INITIAL UI RENDER
updateDashboard();
function exportPDF() {
  const { jsPDF } = window.jspdf;

  if (!jsPDF) {
    alert("PDF library not loaded yet. Please wait a second.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 20;

  // ===== HEADER =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Library Activity Report", 105, y, { align: "center" });
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Generated on: " + new Date().toLocaleString(), 14, y);
  y += 8;

  doc.setDrawColor(0);
  doc.line(14, y, 196, y);
  y += 8;

  // ===== ENTRY LOG =====
  const entries = document.querySelectorAll("#entries .entry");
  if (entries.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(" Entry Log", 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    entries.forEach(e => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text("• " + e.textContent, 20, y);
      y += 6;
    });
    y += 5;
    doc.line(14, y, 196, y);
    y += 8;
  }

  // ===== BOOK HISTORY =====
  if (history.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Book Issue & Return History", 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    history.forEach(h => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(
        `• ${h.bookTitle} — ${h.memberName} (${h.date}) — ${h.returned ? "Returned" : "Issued"}`,
        20,
        y
      );
      y += 6;
    });
    y += 5;
    doc.line(14, y, 196, y);
    y += 8;
  }

  // ===== MEMBERS =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(" Current Members", 14, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  members.forEach(m => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(`• ${m.id} — ${m.name}`, 20, y);
    y += 6;
  });

  // ===== FOOTER =====
  y += 10;
  doc.setFontSize(10);
  doc.text("GOKUL S || 2117240020107 || CSE B", 105, 285,{align: "center"})
  // ===== SAVE =====
  doc.save("Library Report.pdf");
}
function logout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
}

function updateDateTime(){
  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const date = now.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  document.getElementById("time").innerText = time;
  document.getElementById("date").innerText = date;
}

updateDateTime();
setInterval(updateDateTime, 1000);
