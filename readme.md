# SecureBox: A Password Manager

Hey there! Welcome to this simple but secure password manager I built to help manage all those passwords we need these days. It's completely client-side, so your data stays on your computer - nothing gets sent to any servers.

## What does it do?

This tool helps you:
- Store your usernames and passwords for different websites and apps
- Generate strong passwords when you need new ones
- Check if your passwords are actually secure
- Organize everything by categories so you can find stuff later

## Features

- **Secure storage:** Everything is encrypted with AES-256 before being saved in your browser
- **Password generator:** One-click strong password creation
- **Strength checker:** See how strong (or weak) your passwords are
- **Dark mode:** Easy on the eyes when you're working late
- **Search:** Find your accounts quickly by typing part of the name or username
- **Import/Export:** Back up your passwords as an encrypted file you can restore later
- **No internet required:** Works completely offline after page load

## How to use it

### Setup
Just download the files and open `index.html` in your browser. No installation needed!

### Adding passwords
1. Go to the Vault tab
2. Fill in the app name (like "Facebook" or "Gmail")
3. Add your username and password
4. Pick a category
5. Hit Save

### Creating strong passwords
1. Click on the Generator tab
2. Hit the "Generate Password" button
3. Copy the password
4. Use it for your new account

### Finding saved accounts
- All your saved stuff shows up on the Home page and in the Vault
- Use the search bar to quickly find what you need
- Click "Show" to see a password, "Hide" to mask it again

### Editing or deleting
- Each saved account has "Edit" and "Delete" buttons
- Editing will load the details back into the form
- Deleting will ask for confirmation first (so you don't accidentally lose anything)

### Backup and restore
- Click "Export Accounts" to save an encrypted backup file
- Use "Choose File" to restore from a backup

## The techie details

The app uses:
- LocalStorage to keep your data in the browser
- AES-256 encryption for all sensitive info
- Pure JavaScript with no external dependencies
- CSS for the light/dark theme switching

## Worth noting

- If you clear your browser data, you'll lose your passwords (so make backups!)
- There's no cloud sync (that would compromise security)
- The encryption key is fixed in the code (in a real-world scenario, you'd want to use a master password)

## Browser support

Works great in Chrome, Firefox, Edge, and Safari - basically any modern browser.

## License

This project is released for educational purposes. You are free to modify or build upon it, with attribution.

