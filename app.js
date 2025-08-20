import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, set, get, child, remove, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyARjqBoMwIByqb7ePMqzCIK_S2zUpx-uXc",
  authDomain: "files-4de04.firebaseapp.com",
  databaseURL: "https://files-4de04-default-rtdb.firebaseio.com",
  projectId: "files-4de04",
  storageBucket: "files-4de04.firebasestorage.app",
  messagingSenderId: "924989248853",
  appId: "1:924989248853:web:69205076b574da7f8d4bdc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const fileInput = document.getElementById("fileInput");
const passwordInput = document.getElementById("password");
const expiryInput = document.getElementById("expiry");
const uploadBtn = document.getElementById("uploadBtn");
const fileList = document.getElementById("fileList");

// Helper: convert file -> base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // strip metadata
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Upload
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Select a file first.");
    return;
  }

  try {
    const base64 = await fileToBase64(file);
    const id = Date.now().toString();
    const password = passwordInput.value ? passwordInput.value : null;
    const expiryHours = parseInt(expiryInput.value);
    const expiryTime = Date.now() + expiryHours * 60 * 60 * 1000;

    await set(ref(db, "files/" + id), {
      name: file.name,
      type: file.type,
      data: base64,
      password: password,
      expiry: expiryTime
    });

    fileInput.value = "";
    passwordInput.value = "";
    alert("File uploaded successfully!");
  } catch (err) {
    console.error(err);
    alert("Upload failed.");
  }
});

// Auto-clean + show file list
onValue(ref(db, "files"), (snapshot) => {
  fileList.innerHTML = "";
  const now = Date.now();

  snapshot.forEach((childSnap) => {
    const id = childSnap.key;
    const data = childSnap.val();

    // Expired? delete it
    if (data.expiry && now > data.expiry) {
      remove(ref(db, "files/" + id));
      return;
    }

    const tr = document.createElement("tr");

    // File name
    const tdName = document.createElement("td");
    tdName.textContent = data.name;
    tr.appendChild(tdName);

    // Expiry info
    const tdExp = document.createElement("td");
    const hoursLeft = Math.max(0, Math.round((data.expiry - now) / (1000 * 60 * 60)));
    tdExp.textContent = hoursLeft + "h left";
    tr.appendChild(tdExp);

    // Password info
    //const tdPass = document.createElement("td");
    //tdPass.textContent = data.password ? "Yes" : "No";
    //tr.appendChild(tdPass);

    // Download button
    const tdDownload = document.createElement("td");
    const downloadBtn = document.createElement("button");
    downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i>`;
    downloadBtn.onclick = () => downloadFile(id, data);
    tdDownload.appendChild(downloadBtn);
    tr.appendChild(tdDownload);

    // Delete button
    const tdDelete = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    deleteBtn.onclick = () => remove(ref(db, "files/" + id));
    tdDelete.appendChild(deleteBtn);
    tr.appendChild(tdDelete);

    fileList.appendChild(tr);
  });
});

// Download helper
function downloadFile(id, data) {
  if (data.password) {
    const entered = prompt("Enter password to download:");
    if (entered !== data.password) {
      alert("Wrong password!");
      return;
    }
  }

  const byteChars = atob(data.data);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: data.type });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = data.name;
  a.click();
}