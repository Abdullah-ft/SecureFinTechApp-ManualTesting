# 🏦 SecureBank: The Cyber Core Banking Portal

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![CryptoJS](https://img.shields.io/badge/crypto.js-gray?style=for-the-badge&logo=javascript&logoColor=yellow)

A sleek and secure front-end banking application built with **React**. This project showcases a modern "Cyber Core" user interface and demonstrates the implementation of essential web security principles in a client-side environment.

## 🚀 Core Features

This application is built from the ground up with security and user experience in mind.

| Feature | Status | Description |
| :--- | :---: | :--- |
| **🔐 Secure User Authentication** | ✅ | Full registration and login flow with client-side password hashing (`bcrypt` simulation). |
| **🛡️ Brute-Force Protection** | ✅ | Accounts are automatically locked after 5 consecutive failed login attempts. |
| **🔑 Strong Password Policy** | ✅ | Enforces strict password requirements (length, digits, symbols, uppercase) during registration. |
| **⏳ Automatic Session Timeout** | ✅ | Users are automatically logged out after 5 minutes of inactivity for enhanced security. |
| **🛡️ Unauthorized Access Prevention** | ✅ | Securely prevents access to protected pages after logout, even when using the browser's back button. |
| **📝 Secure Data Handling** | ✅ | Sensitive information (like user emails) is encrypted before being stored in the application's state. |
| **✍️ On-Demand Encryption Utility** | ✅ | A "Secure Pad" feature on the dashboard allows users to encrypt and decrypt private notes using AES via `crypto-js`. |
| **📄 Secure File Uploads** | ✅ | Validates file uploads by type, extension, and size (max 5MB) to prevent malicious file handling. |
| **📜 Comprehensive Audit Logs** | ✅ | All critical user actions (logins, transfers, errors, etc.) are logged for traceability. |
| **🎨 Modern "Cyber Core" UI** | ✅ | A creative and professional user interface featuring an animated grid background, neon effects, and dynamic "shining" hover interactions for a responsive feel. |

---

## 🛠️ How to Run This Project

Because this repository contains only the core source files, you must first set up a standard React project environment.

### Prerequisites

*   **Node.js** (v16 or later) and **npm** installed on your machine.
*   A code editor like **Visual Studio Code**.

### Step-by-Step Setup Guide

1.  **Create a New React App:**
    Open your terminal and run the following command to create a new React project.
    ```bash
    npx create-react-app secure-bank-app
    ```

2.  **Navigate into the Project:**
    ```bash
    cd secure-bank-app
    ```

3.  **Install Required Libraries:**
    This project requires `lucide-react` for icons and `crypto-js` for the encryption feature. Run this command to install them:
    ```bash
    npm install lucide-react crypto-js
    ```

4.  **Replace the Source Files:**
    Navigate to the `src` folder inside your new `secure-bank-app` directory. Delete the existing files and replace them with the files from this repository:
    *   Replace `src/App.js` with the `App.js` from this project.
    *   Replace `src/App.css` (or `index.css`) with the `SecureBankApp.css` from this project.
    *   Create a new file `src/SecureBankApp.js` and add the `SecureBankApp.js` code from this project.

    *Your `src` folder should now primarily contain `App.js`, `SecureBankApp.js`, and `SecureBankApp.css`.*

5.  **Start the Application:**
    Run the final command to start the development server.
    ```bash
    npm start
    ```

    The application will automatically open in your browser at `http://localhost:3000`. You can now test all the features!

---

## 🧪 Manual Security & Functionality Testing

A total of 20 manual tests were performed to validate the application's security posture and functionality.

| # | Test Case | Action Performed | Expected Outcome | Observed Result | Status |
| :-: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Password Hashing** | Registered a user & inspected app state. | Password stored as a hash, not plaintext. | Password was stored as a `bcrypt$` hash. | ✅ **Pass** |
| 2 | **Strong Password** | Tried to register with a weak password ("123"). | Registration fails; error message shown. | App displayed "Password must be at least 8 characters". | ✅ **Pass** |
| 3 | **Login Success** | Logged in with correct credentials. | Redirected to the dashboard. | Login was successful and dashboard was displayed. | ✅ **Pass** |
| 4 | **Login Failure** | Logged in with an incorrect password. | Error message "Invalid credentials" shown. | Correct error message was displayed. | ✅ **Pass** |
| 5 | **Brute-Force Lock** | Failed to log in 5 times consecutively. | Account is locked; error message shown. | After 5 failures, app showed "Account locked". | ✅ **Pass** |
| 6 | **Unauthorized Access** | Logged out, then used browser's back button. | Redirected to login; access denied. | Browser's back button was disabled. Access impossible. | ✅ **Pass** |
| 7 | **Session Timeout** | Logged in and remained inactive for 5+ mins. | Automatically logged out with an alert. | App showed "Session expired" alert and logged out. | ✅ **Pass** |
| 8 | **Data Confidentiality** | Inspected app state after registration. | User's email was stored in an encrypted format. | The `email` field in the state was encrypted. | ✅ **Pass** |
| 9 | **Secure Error Handling** | Forced a `throw new Error()` in the code. | App does not crash; shows a dev error boundary. | React's error boundary caught the error gracefully. | ✅ **Pass** |
| 10 | **SQL Injection (Sim.)**| Entered `' OR '1'='1` as a username. | Login fails; error "Invalid input" shown. | The application correctly identified the input as invalid. | ✅ **Pass** |
| 11 | **XSS Prevention** | Entered `<script>alert('XSS')</script>` in a field. | Script tags are sanitized/ignored. | No alert was triggered; input was handled as text. | ✅ **Pass** |
| 12 | **Note Encryption** | Typed a note and clicked "Encrypt & Copy". | Note is encrypted and copied to clipboard. | A long, encrypted string was copied successfully. | ✅ **Pass** |
| 13 | **Note Decryption** | Pasted encrypted text and clicked "Decrypt". | Original note text is restored. | The original message was correctly decrypted. | ✅ **Pass** |
| 14 | **File Upload (Valid)** | Uploaded a valid `.pdf` file under 5MB. | Success message shown. | "File uploaded successfully" message appeared. | ✅ **Pass** |
| 15 | **File Upload (Invalid Type)**| Uploaded a `.txt` file. | Error message "File type not allowed" shown. | The upload was correctly rejected. | ✅ **Pass** |
| 16 | **File Upload (Invalid Size)**| Uploaded a file larger than 5MB. | Error message "File too large" shown. | The upload was correctly rejected. | ✅ **Pass** |
| 17 | **Valid Money Transfer** | Transferred a valid amount to another user. | Balance updates correctly; success message. | Transfer was successful and balances were correct. | ✅ **Pass** |
| 18 | **Transfer to Self** | Tried to transfer money to own username. | Error message "Cannot transfer to yourself". | The action was correctly blocked. | ✅ **Pass** |
| 19 | **Insufficient Funds** | Tried to transfer more money than available. | Error message "Insufficient balance". | The action was correctly blocked. | ✅ **Pass** |
| 20 | **Profile Update** | Updated profile email after providing password. | Profile is updated; success message shown. | The update was successful. | ✅ **Pass** |
