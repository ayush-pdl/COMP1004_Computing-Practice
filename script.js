let uploadedUserData = [];
let uploadedUsernames = [];
let editingFromPreview = false;

const masterKey = CryptoJS.enc.Utf8.parse("ThisIsASecretKeyForAES256Demo!@#123");

function showPage(pageId) {
  document.querySelectorAll('section').forEach(section => section.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
  const savedSection = document.getElementById('saved-accounts');
  savedSection.style.display = pageId === 'generate' ? 'none' : 'block';
  displayAccounts();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

function toggleFormPasswordVisibility() {
  const pwd = document.getElementById("password");
  pwd.type = pwd.type === "password" ? "text" : "password";
}

function decryptPassword(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, masterKey.toString());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

function togglePassword(index, source) {
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const acc = accounts[index];
  const encryptedPassword = acc.password;

  const span = document.getElementById(`pwd-${source}-${index}`);
  const button = span.nextElementSibling;

  const isHidden = span.textContent.includes('*');
  const decrypted = decryptPassword(encryptedPassword);

  if (isHidden) {
    span.textContent = decrypted;
    button.textContent = "Hide";
  } else {
    span.textContent = '*'.repeat(decrypted.length);
    button.textContent = "Show";
  }
}

function checkPasswordStrength(password) {
  const bar = document.getElementById("strength-bar");
  const text = document.getElementById("strength-text");
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  bar.value = strength;
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  text.textContent = labels[strength - 1] || "Very Weak";
}

document.getElementById("password-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const appName = document.getElementById("appName").value.trim();
  const username = document.getElementById("username").value.trim();
  const rawPassword = document.getElementById("password").value;
  const password = CryptoJS.AES.encrypt(rawPassword, masterKey.toString()).toString();
  const category = document.getElementById("category").value;

  if (document.getElementById("strength-bar").value < 3) {
    alert("Please choose a stronger password before saving.");
    return;
  }

  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  const duplicateInStorage = accounts.some(acc =>
    acc.appName?.toLowerCase() === appName.toLowerCase() &&
    acc.username?.toLowerCase() === username.toLowerCase()
  );

  const duplicateInJSON = !editingFromPreview && uploadedUserData.some(acc =>
    acc.appName?.toLowerCase() === appName.toLowerCase() &&
    acc.username?.toLowerCase() === username.toLowerCase()
  );

  if (duplicateInStorage || duplicateInJSON) {
    alert("An account with this application and username already exists.");
    return;
  }

  accounts.push({ appName, username, password, category });
  localStorage.setItem("accounts", JSON.stringify(accounts));
  alert("Account saved!");
  displayAccounts();
  document.getElementById("vault-saved-accounts").style.display = "block";

  this.reset();
  document.getElementById("password").type = "password";
  document.getElementById("show-password-checkbox").checked = false;
  editingFromPreview = false; // reset flag
});

function displayAccounts() {
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const stored = document.getElementById("stored-accounts");
  const vault = document.getElementById("vault-saved-container");

  stored.innerHTML = accounts.map((acc, index) => `
    <div class="account-card">
      <p><strong>Application:</strong> ${acc.appName}</p>
      <p><strong>Username:</strong> ${acc.username}</p>
      <p><strong>Category:</strong> ${acc.category}</p>
      <p><strong>Password:</strong>
        <span id="pwd-home-${index}">${'*'.repeat(decryptPassword(acc.password).length)}</span>
        <button onclick="togglePassword(${index}, 'home')">Show</button>
      </p>
      <button onclick="editAccount(${index})">Edit</button>
      <button onclick="deleteAccount(${index})">Delete</button>
    </div>
  `).join('');

  vault.innerHTML = accounts.map((acc, index) => `
    <div class="account-card">
      <p><strong>Application:</strong> ${acc.appName}</p>
      <p><strong>Username:</strong> ${acc.username}</p>
      <p><strong>Category:</strong> ${acc.category}</p>
      <p><strong>Password:</strong>
        <span id="pwd-vault-${index}">${'*'.repeat(decryptPassword(acc.password).length)}</span>
        <button onclick="togglePassword(${index}, 'vault')">Show</button>
      </p>
      <button onclick="editAccount(${index})">Edit</button>
      <button onclick="deleteAccount(${index})">Delete</button>
    </div>
  `).join('');
}

function filterAccounts() {
  const searchTerm = document.getElementById("searchBar").value.toLowerCase();
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  
  if (!searchTerm) {
    displayAccounts(); // If search is empty, show all accounts
    return;
  }
  
  const filtered = accounts.filter(acc => 
    acc.appName.toLowerCase().includes(searchTerm) || 
    acc.username.toLowerCase().includes(searchTerm) ||
    acc.category.toLowerCase().includes(searchTerm)
  );
  
  const stored = document.getElementById("stored-accounts");
  
  if (filtered.length === 0) {
    stored.innerHTML = '<p>No accounts found matching your search.</p>';
    return;
  }
  
  stored.innerHTML = filtered.map((acc, index) => {
    // Find the original index in the full accounts array
    const originalIndex = accounts.findIndex(a => 
      a.appName === acc.appName && 
      a.username === acc.username && 
      a.password === acc.password
    );
    
    return `
    <div class="account-card">
      <p><strong>Application:</strong> ${acc.appName}</p>
      <p><strong>Username:</strong> ${acc.username}</p>
      <p><strong>Category:</strong> ${acc.category}</p>
      <p><strong>Password:</strong>
        <span id="pwd-home-${originalIndex}">${'*'.repeat(decryptPassword(acc.password).length)}</span>
        <button onclick="togglePassword(${originalIndex}, 'home')">Show</button>
      </p>
      <button onclick="editAccount(${originalIndex})">Edit</button>
      <button onclick="deleteAccount(${originalIndex})">Delete</button>
    </div>
  `}).join('');
}

function filterVaultAccounts() {
  const searchTerm = document.getElementById("vaultSearchBar").value.toLowerCase();
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  
  if (!searchTerm) {
    // If search is empty, show all accounts in vault
    const vault = document.getElementById("vault-saved-container");
    vault.innerHTML = accounts.map((acc, index) => `
      <div class="account-card">
        <p><strong>Application:</strong> ${acc.appName}</p>
        <p><strong>Username:</strong> ${acc.username}</p>
        <p><strong>Category:</strong> ${acc.category}</p>
        <p><strong>Password:</strong>
          <span id="pwd-vault-${index}">${'*'.repeat(decryptPassword(acc.password).length)}</span>
          <button onclick="togglePassword(${index}, 'vault')">Show</button>
        </p>
        <button onclick="editAccount(${index})">Edit</button>
        <button onclick="deleteAccount(${index})">Delete</button>
      </div>
    `).join('');
    return;
  }
  
  const filtered = accounts.filter(acc => 
    acc.appName.toLowerCase().includes(searchTerm) || 
    acc.username.toLowerCase().includes(searchTerm) ||
    acc.category.toLowerCase().includes(searchTerm)
  );
  
  const vault = document.getElementById("vault-saved-container");
  
  if (filtered.length === 0) {
    vault.innerHTML = '<p>No accounts found matching your search.</p>';
    return;
  }
  
  vault.innerHTML = filtered.map((acc, index) => {
    // Find the original index in the full accounts array
    const originalIndex = accounts.findIndex(a => 
      a.appName === acc.appName && 
      a.username === acc.username && 
      a.password === acc.password
    );
    
    return `
    <div class="account-card">
      <p><strong>Application:</strong> ${acc.appName}</p>
      <p><strong>Username:</strong> ${acc.username}</p>
      <p><strong>Category:</strong> ${acc.category}</p>
      <p><strong>Password:</strong>
        <span id="pwd-vault-${originalIndex}">${'*'.repeat(decryptPassword(acc.password).length)}</span>
        <button onclick="togglePassword(${originalIndex}, 'vault')">Show</button>
      </p>
      <button onclick="editAccount(${originalIndex})">Edit</button>
      <button onclick="deleteAccount(${originalIndex})">Delete</button>
    </div>
  `}).join('');
}

function editAccount(index) {
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const acc = accounts[index];
  document.getElementById("appName").value = acc.appName;
  document.getElementById("username").value = acc.username;
  document.getElementById("category").value = acc.category;
  document.getElementById("password").value = decryptPassword(acc.password);
  checkPasswordStrength(decryptPassword(acc.password));
  accounts.splice(index, 1);
  localStorage.setItem("accounts", JSON.stringify(accounts));
  displayAccounts();
}

function deleteAccount(index) {
  if (!confirm("Are you sure you want to delete this account?")) return;
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  accounts.splice(index, 1);
  localStorage.setItem("accounts", JSON.stringify(accounts));
  displayAccounts();
}

function exportAccounts() {
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  if (!accounts.length) return alert("No accounts to export.");
  const filename = prompt("Enter a name for the file:", "encrypted_accounts");
  if (!filename) return;
  const encrypted = accounts.map(acc => ({
    appName: CryptoJS.AES.encrypt(acc.appName, masterKey.toString()).toString(),
    username: CryptoJS.AES.encrypt(acc.username, masterKey.toString()).toString(),
    password: CryptoJS.AES.encrypt(decryptPassword(acc.password), masterKey.toString()).toString(),
    category: CryptoJS.AES.encrypt(acc.category, masterKey.toString()).toString()
  }));
  const blob = new Blob([JSON.stringify(encrypted, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function handleJSONUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const rawData = JSON.parse(e.target.result);
      const isEncrypted = rawData.every(entry =>
        Object.values(entry).some(field => typeof field === "string" && field.startsWith("U2FsdGVk"))
      );

      uploadedUserData = rawData.map(entry => {
        return isEncrypted
          ? {
              appName: decryptField(entry.appName),
              username: decryptField(entry.username),
              password: decryptField(entry.password),
              category: decryptField(entry.category)
            }
          : {
              appName: entry.appName || "",
              username: entry.username || "",
              password: entry.password || "",
              category: entry.category || ""
            };
      });

      updateJsonPreviewList();
      document.getElementById("file-warning").textContent = "JSON file uploaded and parsed successfully.";
    } catch {
      document.getElementById("file-warning").textContent = "Failed to parse or decrypt the file!";
      uploadedUserData = [];
      document.getElementById("vault-json-preview-container").innerHTML = "";
    }
  };
  reader.readAsText(file);
}

function updateJsonPreviewList() {
  const container = document.getElementById("vault-json-preview-container");
  container.innerHTML = uploadedUserData.map((acc, i) => `
    <div class="account-card">
      <p><strong>Application:</strong> ${acc.appName}</p>
      <p><strong>Username:</strong> ${acc.username}</p>
      <p><strong>Category:</strong> ${acc.category}</p>
      <p><strong>Password:</strong>
        <span id="json-preview-pwd-${i}">${'*'.repeat(acc.password.length)}</span>
        <button onclick="toggleJsonPreviewPassword(${i}, '${acc.password}')">Show</button>
      </p>
      <button onclick="importToForm(${i})">Edit</button>
      <button onclick="deleteFromUpload(${i})">Delete</button>
    </div>
  `).join('');
}

function importToForm(index) {
  const acc = uploadedUserData[index];
  document.getElementById("appName").value = acc.appName;
  document.getElementById("username").value = acc.username;
  document.getElementById("category").value = acc.category;
  document.getElementById("password").value = acc.password;
  checkPasswordStrength(acc.password);
  showPage("vault");
  editingFromPreview = true;
  uploadedUserData.splice(index, 1);
  updateJsonPreviewList();
}

function deleteFromUpload(index) {
  if (!confirm("Remove this uploaded account?")) return;
  uploadedUserData.splice(index, 1);
  updateJsonPreviewList();
}

function handleJSONUploadFromHome(e) {
  handleJSONUpload(e);
  showPage("vault");
}

function decryptField(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, masterKey.toString());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Decryption Error]";
  }
}

function toggleJsonPreviewPassword(index, actualPassword) {
  const span = document.getElementById(`json-preview-pwd-${index}`);
  const button = span.nextElementSibling;
  if (span.textContent.includes("*")) {
    span.textContent = actualPassword;
    button.textContent = "Hide";
  } else {
    span.textContent = "*".repeat(actualPassword.length);
    button.textContent = "Show";
  }
}

function generatePassword() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  document.getElementById("generated-password").value = password;
  updateGeneratedStrength(password);
}

function updateGeneratedStrength(password) {
  const bar = document.getElementById("generated-strength-bar");
  const text = document.getElementById("generated-strength-text");
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  bar.value = strength;
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  text.textContent = labels[strength - 1] || "Very Weak";
}

function copyPassword() {
  const input = document.getElementById("generated-password");
  input.select();
  document.execCommand("copy");
  alert("Password copied to clipboard!");
}

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  section.style.display = section.style.display === "none" ? "block" : "none";
}
