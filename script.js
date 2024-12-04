document.addEventListener("DOMContentLoaded", () => {
    const accountForm = document.getElementById("accountForm");
    const feedback = document.getElementById("feedback");
    const strengthDisplay = document.getElementById("strength");
  
    accountForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
  
      if (!username || !password) {
        feedback.textContent = "Both fields are required!";
        feedback.style.color = "red";
        return;
      }
  
      // Step 1: Check username in JSON file
      const isUsernameInJson = await loadUsers(username);
      if (isUsernameInJson) {
        feedback.textContent = "Username already exists in the system (JSON)!";
        feedback.style.color = "red";
        return;
      }
  
      // Step 2: Save to local storage
      const account = { username, password };
      const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
      const existingAccount = accounts.find((acc) => acc.username === username);
  
      if (existingAccount) {
        feedback.textContent = "Username already exists in local storage!";
        feedback.style.color = "red";
      } else {
        accounts.push(account);
        localStorage.setItem("accounts", JSON.stringify(accounts));
        feedback.textContent = "Account saved successfully!";
        feedback.style.color = "green";
      }
  
      // Step 3: Check password strength
      const strength = checkPasswordStrength(password);
      displayStrength(strength);
    });
  
    async function loadUsers(username) {
      try {
        const response = await fetch("users.json");
        const users = await response.json();
        return users.some((user) => user.username === username);
      } catch (error) {
        console.error("Error loading JSON file:", error);
        feedback.textContent = "Unable to verify username in JSON.";
        feedback.style.color = "red";
        return false;
      }
    }
  
    function checkPasswordStrength(password) {
      let strength = "Weak";
      if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*]/.test(password)) {
        strength = "Strong";
      } else if (password.length >= 6 && (/[A-Z]/.test(password) || /\d/.test(password))) {
        strength = "Moderate";
      }
      return strength;
    }
  
    function displayStrength(strength) {
      strengthDisplay.textContent = `Password Strength: ${strength}`;
      strengthDisplay.className = `strength ${strength.toLowerCase()}`;
    }
  });
  