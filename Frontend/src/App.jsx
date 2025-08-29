import { useState } from "react";
import FileUpload from "./components/FileUpload";
import FileDownload from "./components/FileDownload";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedCode, setUploadedCode] = useState("");

  const handleUploadSuccess = (code) => {
    setUploadedCode(code);
    // Don't auto-redirect, let user choose
  };

  return (
    <div className="app">
      <div className="background-animation"></div>

      <header className="app-header">
        <div className="logo-container">
          <div className="logo">K9TX</div>
          <div className="logo-subtitle">FileShare</div>
        </div>
        <h1>🚀 Secure File Sharing</h1>
        <p>Share files instantly with auto-expiring encrypted links</p>
      </header>

      <nav className="tab-nav">
        <button
          className={`tab-button ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          <span className="tab-icon">📤</span>
          Upload File
        </button>
        <button
          className={`tab-button ${activeTab === "download" ? "active" : ""}`}
          onClick={() => setActiveTab("download")}
        >
          <span className="tab-icon">📥</span>
          Download File
        </button>
      </nav>

      <main className="app-main">
        <div className="content-wrapper">
          {activeTab === "upload" && (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          )}
          {activeTab === "download" && (
            <FileDownload initialCode={uploadedCode} />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>K9TX FileShare</h3>
            <p>Secure • Fast • Reliable</p>
            <p>
              Want to open Bank Account?{" "}
              <a href="https://k9txbank.vercel.app">Click Here</a>
            </p>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>50MB file limit</li>
              <li>Auto-expiring links</li>
              <li>End-to-end security</li>
              <li>All file types supported</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Security</h4>
            <p>Files are automatically deleted 2 minutes after download.</p>
            <p>Your privacy and security are our top priority.</p>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a
                href="https://twitter.com/k9txs"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">🐦</span>
                <span>Twitter</span>
              </a>
              <a
                href="https://github.com/k9tx"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">🐙</span>
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/k9tx"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">💼</span>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://instagram.com/kartik9t.xs"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">📸</span>
                <span>Instagram</span>
              </a>
              <a href="mailto:contact@k9tx.com" className="social-link">
                <span className="social-icon">📧</span>
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 K9TX Capital Management. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
