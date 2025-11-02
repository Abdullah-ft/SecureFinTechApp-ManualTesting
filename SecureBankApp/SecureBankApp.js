import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Lock,
  User,
  Mail,
  DollarSign,
  FileText,
  LogOut,
  Shield,
  Activity,
  ArrowLeft,
  ArrowRight,
  Key,
  Unlock,
} from "lucide-react";
import CryptoJS from "crypto-js";
import "./SecureBankApp.css";

// Your original, unmodified logic functions are all here.
const hashPassword = (password) => {
  let hash = 0;
  const str = password + "salt_secret_key";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return "bcrypt$" + Math.abs(hash).toString(16).padStart(16, "0");
};
const encryptData = (data) => btoa(data).split("").reverse().join("");
const decryptData = (encrypted) => atob(encrypted.split("").reverse().join(""));

// --- AES Encryption/Decryption functions for the Secure Note ---
const SECRET_KEY = "my-super-secret-key-12345";
const encryptNote = (text) => CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
const decryptNote = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const SecureBankApp = () => {
  // All state and effects from your file are preserved.
  const [currentView, setCurrentView] = useState("login");
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [failedAttempts, setFailedAttempts] = useState({});
  const [lockedAccounts, setLockedAccounts] = useState({});
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [transferForm, setTransferForm] = useState({
    recipient: "",
    amount: "",
  });
  const [profileForm, setProfileForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [fileUpload, setFileUpload] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userBalances, setUserBalances] = useState({});
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    if (currentUser) {
      const INACTIVITY_LIMIT = 5 * 60 * 1000;
      const CHECK_INTERVAL = 10 * 1000;
      const checkSession = setInterval(() => {
        if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
          alert("⏰ Session expired due to inactivity. Please login again");
          logActivity("Session expired due to inactivity");
          handleLogout();
        }
      }, CHECK_INTERVAL);
      return () => clearInterval(checkSession);
    }
  }, [currentUser, lastActivity]);
  // TEMPORARY CODE FOR TESTING: Log the users state to the console whenever it changes.
  useEffect(() => {
    console.log("--- USER DATA UPDATED ---");
    console.log(users);
  }, [users]); // This tells the code to run only when the 'users' state changes.

  const resetActivity = () => setLastActivity(Date.now());
  const logActivity = (action) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: currentUser || "Anonymous",
      action: action,
    };
    setActivityLog((prev) => [...prev, logEntry]);
  };
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/\d/.test(password)) return "Password must contain at least one digit";
    if (!/[!@#$%^&*]/.test(password))
      return "Password must contain at least one special character";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    return null;
  };
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const sanitizeInput = (input) => input.replace(/[<>\"']/g, "");
  const handleRegister = () => {
    resetActivity();
    try {
      const { username, email, password, confirmPassword } = registerForm;
      if (!username || !email || !password || !confirmPassword)
        return showMessage("error", "All fields are required");
      if (username.length > 50)
        return showMessage("error", "Username too long (max 50 characters)");
      const cleanUsername = sanitizeInput(username);
      if (cleanUsername !== username)
        return showMessage("error", "Username contains invalid characters");
      if (users[username])
        return showMessage("error", "Username already exists");
      if (!validateEmail(email))
        return showMessage("error", "Invalid email format");
      const passwordError = validatePassword(password);
      if (passwordError) return showMessage("error", passwordError);
      if (password !== confirmPassword)
        return showMessage("error", "Passwords do not match");

      const hashedPassword = hashPassword(password);
      const encryptedEmail = encryptData(email);
      setUsers((prev) => ({
        ...prev,
        [username]: {
          password: hashedPassword,
          email: encryptedEmail,
          createdAt: new Date().toISOString(),
        },
      }));
      setUserBalances((prev) => ({ ...prev, [username]: 1000 }));
      logActivity(`User registered: ${username}`);
      showMessage("success", "Registration successful! Please login.");
      setCurrentView("login");
      setRegisterForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      showMessage("error", "Registration failed.");
    }
  };
  const handleLogin = () => {
    resetActivity();
    try {
      const { username, password } = loginForm;
      if (!username || !password)
        return showMessage("error", "All fields are required");
      if (lockedAccounts[username])
        return showMessage(
          "error",
          "Account locked due to multiple failed login attempts"
        );
      if (
        username.includes("'") ||
        username.includes("--") ||
        username.includes("OR")
      )
        return showMessage("error", "Invalid input detected");

      const user = users[username];
      if (!user || user.password !== hashPassword(password)) {
        // --- THIS IS THE LINE THAT WAS FIXED ---
        const attempts = (failedAttempts[username] || 0) + 1;
        // ----------------------------------------
        setFailedAttempts((prev) => ({ ...prev, [username]: attempts }));
        if (attempts >= 5) {
          setLockedAccounts((prev) => ({ ...prev, [username]: true }));
          showMessage(
            "error",
            "Account locked due to multiple failed attempts"
          );
          logActivity(
            `Account locked: ${username} after ${attempts} failed attempts`
          );
        } else {
          showMessage("error", "Invalid credentials");
        }
        return;
      }
      setFailedAttempts((prev) => ({ ...prev, [username]: 0 }));
      setCurrentUser(username);
      setCurrentView("dashboard");
      setLoginForm({ username: "", password: "" });
      logActivity(`User logged in: ${username}`);
      showMessage("success", "Login successful!");
    } catch (error) {
      showMessage("error", "Login failed.");
    }
  };
  const handleLogout = () => {
    logActivity(`User logged out: ${currentUser}`);
    setCurrentUser(null);
    setCurrentView("login");
    setNoteInput("");
    showMessage("success", "Logged out successfully");
  };
  const handleTransfer = () => {
    resetActivity();
    try {
      const { recipient, amount } = transferForm;

      if (!recipient || !amount)
        return showMessage("error", "All fields are required");

      // 1. Check if input contains alphabets (invalid format)
      if (/[^0-9.\-\/= ]/.test(amount)) {
        return showMessage("error", "Invalid input format.");
      }

      // 4. Handle expressions like "x=1/0"
      if (/\/0(?!\d)/.test(amount)) {
        return showMessage("error", "Zero division error.");
      }

      // Try to evaluate numeric value safely
      let numAmount = parseFloat(amount);

      // If still NaN after parsing → invalid
      if (isNaN(numAmount)) {
        return showMessage("error", "Invalid amount.");
      }

      // 2 & 3. Check for negative, zero, or less than minimum
      if (numAmount <= 0) {
        return showMessage("error", "Amount must be positive.");
      }
      if (numAmount < 1) {
        return showMessage("error", "Minimum transfer amount is $1.");
      }

      // Existing validations
      if (numAmount > 100000)
        return showMessage("error", "Transfer limit exceeded (max: $100,000)");

      if (!users[recipient]) return showMessage("error", "Recipient not found");

      if (recipient === currentUser)
        return showMessage("error", "Cannot transfer to yourself");

      if (numAmount > userBalances[currentUser])
        return showMessage("error", "Insufficient balance");

      // Update balances
      setUserBalances((prev) => ({
        ...prev,
        [currentUser]: prev[currentUser] - numAmount,
        [recipient]: (prev[recipient] || 0) + numAmount,
      }));

      logActivity(
        `Transfer: ${currentUser} sent $${numAmount} to ${recipient}`
      );

      showMessage(
        "success",
        `Successfully transferred $${numAmount} to ${recipient}`
      );

      setTransferForm({ recipient: "", amount: "" });
      setCurrentView("dashboard");
    } catch (error) {
      showMessage("error", "Transfer failed.");
    }
  };
  const handleFileUpload = (e) => {
    resetActivity();
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".pdf"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      return showMessage(
        "error",
        "File type not allowed. Only images and PDFs are permitted."
      );
    }
    if (file.size > 5000000)
      return showMessage("error", "File too large (max 5MB)");
    setFileUpload(file);
    showMessage("success", `File ${file.name} uploaded successfully`);
  };
  const handleProfileUpdate = () => {
    resetActivity();
    try {
      const { email, currentPassword, newPassword } = profileForm;
      if (!currentPassword)
        return showMessage("error", "Current password required");
      if (users[currentUser].password !== hashPassword(currentPassword))
        return showMessage("error", "Current password is incorrect");

      const updates = {};
      if (email && !validateEmail(email))
        return showMessage("error", "Invalid email format");
      if (email) updates.email = encryptData(email);
      if (newPassword) {
        const passwordError = validatePassword(newPassword);
        if (passwordError) return showMessage("error", passwordError);
        updates.password = hashPassword(newPassword);
      }
      setUsers((prev) => ({
        ...prev,
        [currentUser]: { ...prev[currentUser], ...updates },
      }));
      logActivity(`Profile updated: ${currentUser}`);
      showMessage("success", "Profile updated successfully");
      setProfileForm({ email: "", currentPassword: "", newPassword: "" });
      setCurrentView("dashboard");
    } catch (error) {
      showMessage("error", "Profile update failed");
    }
  };

  const handleEncryptAndCopy = async () => {
    if (!noteInput) return showMessage("error", "Note is empty.");
    const encrypted = encryptNote(noteInput);
    try {
      await navigator.clipboard.writeText(encrypted);
      setNoteInput("");
      logActivity("Encrypted and copied a secure note.");
      showMessage("success", "Encrypted note copied to clipboard!");
    } catch (err) {
      showMessage("error", "Failed to copy to clipboard.");
    }
  };

  const handleDecryptPasted = () => {
    if (!noteInput) return showMessage("error", "Paste encrypted text first.");
    try {
      const decrypted = decryptNote(noteInput);
      if (decrypted) {
        setNoteInput(decrypted);
        logActivity("Decrypted a secure note from clipboard.");
        showMessage("success", "Note has been decrypted.");
      } else {
        showMessage("error", "Decryption failed. Invalid text.");
      }
    } catch (error) {
      showMessage("error", "Decryption failed. Invalid text.");
    }
  };

  if (currentView !== "login" && currentView !== "register" && !currentUser) {
    setCurrentView("login");
  }

  const renderContent = () => {
    if (currentView === "dashboard") {
      return (
        <div key="dashboard" className="dashboard-layout">
          <div className="balance-column">
            <div className="card balance-card">
              <h4>Available Balance</h4>
              <p>
                $
                {(userBalances[currentUser] || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="card secure-note-card">
              <h4>Secure Pad</h4>
              <p className="form-hint">
                Encrypt text and copy it. Paste it back to decrypt.
              </p>
              <textarea
                placeholder="Type a note or paste encrypted text..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <div className="note-actions">
                <button
                  className="note-button encrypt"
                  onClick={handleEncryptAndCopy}
                >
                  <Key size={16} /> Encrypt & Copy
                </button>
                <button
                  className="note-button decrypt"
                  onClick={handleDecryptPasted}
                >
                  <Unlock size={16} /> Decrypt Pasted
                </button>
              </div>
            </div>
          </div>
          <div className="command-column">
            <div className="card command-center">
              <h4>Command Center</h4>
              <button
                className="command-button"
                onClick={() => setCurrentView("transfer")}
              >
                <DollarSign size={20} />
                <span>Make a Transfer</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="command-button"
                onClick={() => setCurrentView("profile")}
              >
                <User size={20} />
                <span>Update Profile</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="command-button"
                onClick={() => setCurrentView("upload")}
              >
                <FileText size={20} />
                <span>Upload Document</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="command-button"
                onClick={() => setCurrentView("logs")}
              >
                <Activity size={20} />
                <span>View Activity Logs</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // This block is simplified for the example but would contain your full forms
    return (
      <div key={currentView} className="content-view-wrapper">
        <div className="card content-card">
          <button
            onClick={() => setCurrentView("dashboard")}
            className="back-button"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          {currentView === "transfer" && (
            <>
              <h2 className="page-title">Transfer Money</h2>
              <div className="form-group">
                <label>Recipient Username</label>
                <input
                  type="text"
                  value={transferForm.recipient}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      recipient: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={transferForm.amount}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, amount: e.target.value })
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleTransfer()}
                />
              </div>
              <button
                onClick={handleTransfer}
                className="button button-primary"
              >
                Send Transfer
              </button>
            </>
          )}
          {currentView === "profile" && (
            <>
              <h2 className="page-title">Update Profile</h2>
              <div className="form-group">
                <label>New Email (optional)</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>New Password (optional)</label>
                <input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      newPassword: e.target.value,
                    })
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleProfileUpdate()}
                />
              </div>
              <button
                onClick={handleProfileUpdate}
                className="button button-primary"
              >
                Update Profile
              </button>
            </>
          )}
          {currentView === "upload" && (
            <>
              <h2 className="page-title">Upload Document</h2>
              <div className="form-group">
                <label>Select File (Images/PDF, max 5MB)</label>
                <input type="file" onChange={handleFileUpload} />
              </div>
              {fileUpload && (
                <div className="upload-info">
                  <p>
                    <strong>Selected:</strong> {fileUpload.name}
                  </p>
                </div>
              )}
            </>
          )}
          {currentView === "logs" && (
            <>
              <h2 className="page-title">Activity Logs</h2>
              <div className="logs-container">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog
                      .slice()
                      .reverse()
                      .map((log, idx) => (
                        <tr key={idx}>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td>{log.user}</td>
                          <td>{log.action}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="secure-bank-app">
      {message.text && (
        <div
          className={`toast-message ${message.type} ${
            message.text ? "show" : ""
          }`}
        >
          {" "}
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}{" "}
          {message.text}{" "}
        </div>
      )}
      {!currentUser ? (
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <Shield className="logo" size={28} />
              <h1>SecureBank</h1>
            </div>
            {currentView === "login" && (
              <div className="auth-form">
                <h2 className="card-title evil-title">
                  <span className="powered">Powered by E‑corp ☠</span>
                </h2>
                <div className="input-group">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <div className="input-group">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <button onClick={handleLogin} className="button button-primary">
                  Authenticate
                </button>
                <p className="form-footer">
                  No account?{" "}
                  <button
                    onClick={() => setCurrentView("register")}
                    className="link-button"
                  >
                    Create one
                  </button>
                </p>
              </div>
            )}
            {currentView === "register" && (
              <div className="auth-form">
                <h2 className="card-title">Create an Account</h2>
                <div className="input-group">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={registerForm.username}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        username: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    onKeyPress={(e) => e.key === "Enter" && handleRegister()}
                  />
                </div>
                <button
                  onClick={handleRegister}
                  className="button button-primary"
                >
                  Register
                </button>
                <p className="form-footer">
                  Have an account?{" "}
                  <button
                    onClick={() => setCurrentView("login")}
                    className="link-button"
                  >
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="app-container">
          <header className="app-header">
            <div className="header-logo">
              <Shield className="logo-cyber" size={24} />
              <span>SecureBank</span>
            </div>
            <div className="header-user">
              <span>
                Welcome, <strong>{currentUser}</strong>
              </span>
              <div className="user-avatar">
                {currentUser.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="logout-button">
                <LogOut size={16} />
              </button>
            </div>
          </header>
          <main className="main-content">{renderContent()}</main>
        </div>
      )}
    </div>
  );
};

export default SecureBankApp;
