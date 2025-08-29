import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

function FileDownload({ initialCode = "" }) {
  const [code, setCode] = useState(initialCode);
  const [fileInfo, setFileInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleCodeChange = (e) => {
    setCode(e.target.value.toUpperCase());
    setError("");
    setFileInfo(null);
  };

  const handleGetFileInfo = async () => {
    if (!code || code.length !== 8) {
      setError("Please enter a valid 8-character code");
      return;
    }

    setIsLoading(true);
    setError("");
    setFileInfo(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/file/${code}/`);
      setFileInfo(response.data);
    } catch (error) {
      console.error("Error fetching file info:", error);
      if (error.response?.status === 404) {
        setError(
          "🔍 File not found. Please check your 8-character code and try again."
        );
      } else if (error.response?.status === 410) {
        setError(
          "⏰ File has expired and is no longer available. Files auto-delete 2 minutes after download."
        );
      } else {
        setError("❌ Failed to retrieve file information. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileInfo || !fileInfo.download_token) {
      setError("No file information available");
      return;
    }

    setIsDownloading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Starting download for:", code, fileInfo.download_token);

      const downloadUrl = `${API_BASE_URL}/download/${code}/${fileInfo.download_token}/`;
      console.log("Download URL:", downloadUrl);

      // Use fetch to get the file as blob for automatic download
      const response = await fetch(downloadUrl, {
        method: "GET",
        credentials: "omit",
      });

      console.log("Download response:", response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          setError(
            "❌ Download link is invalid or expired. Please request a new sharing code."
          );
          return;
        } else if (response.status === 410) {
          setError(
            "⏰ This file has already been downloaded and expired (files auto-delete 2 minutes after download). Please request a new upload if you need the file again."
          );
          return;
        } else if (response.status === 500) {
          setError("🔧 Server error. The file may have been moved or deleted.");
          return;
        } else {
          setError(`❌ Download failed: HTTP ${response.status}`);
          return;
        }
      }

      // Get the file as blob
      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        setError("Received empty file. Please try again.");
        return;
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("content-disposition");
      let filename = fileInfo.filename;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/["']/g, "");
        }
      }

      // Create object URL from blob
      const url = window.URL.createObjectURL(blob);

      // Create invisible download link and trigger it immediately
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "downloaded_file";
      link.style.display = "none";
      link.style.visibility = "hidden";

      // Add to DOM temporarily
      document.body.appendChild(link);

      // Trigger download immediately
      link.click();

      // Clean up immediately
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setSuccess(
        "✅ File downloaded successfully! Check your downloads folder. Link expires in 2 minutes."
      );
      setFileInfo(null);
      setCode("");
    } catch (error) {
      console.error("Download error:", error);
      setError(
        `❌ Download failed: ${error.message}. Please try again or contact support.`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (filename) => {
    if (!filename) return "📄";

    const extension = filename.split(".").pop()?.toLowerCase();
    const iconMap = {
      // Images
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      bmp: "🖼️",
      svg: "🖼️",
      webp: "🖼️",
      // Documents
      pdf: "📕",
      doc: "📄",
      docx: "📄",
      txt: "📝",
      rtf: "📄",
      // Spreadsheets
      xls: "📊",
      xlsx: "📊",
      csv: "📊",
      // Presentations
      ppt: "📊",
      pptx: "📊",
      // Archives
      zip: "📦",
      rar: "📦",
      "7z": "📦",
      tar: "📦",
      gz: "📦",
      // Audio
      mp3: "🎵",
      wav: "🎵",
      flac: "🎵",
      aac: "🎵",
      ogg: "🎵",
      // Video
      mp4: "🎬",
      avi: "🎬",
      mkv: "🎬",
      mov: "🎬",
      wmv: "🎬",
      flv: "🎬",
      // Code
      js: "💻",
      html: "💻",
      css: "💻",
      py: "💻",
      java: "💻",
      cpp: "💻",
      c: "💻",
      // Other
      exe: "⚙️",
      msi: "⚙️",
    };

    return iconMap[extension] || "📄";
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
    },
    infoHeader: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "24px",
      textAlign: "center",
    },
    infoTitle: {
      fontSize: "1.4rem",
      fontWeight: "700",
      marginBottom: "8px",
    },
    infoText: {
      fontSize: "0.95rem",
      opacity: 0.9,
      lineHeight: "1.5",
    },
    codeSection: {
      marginBottom: "30px",
      textAlign: "center",
    },
    sectionTitle: {
      margin: "0 0 16px 0",
      color: "#374151",
      fontSize: "1.3rem",
      fontWeight: "600",
      textAlign: "center",
    },
    inputGroup: {
      display: "flex",
      gap: "12px",
      marginBottom: "16px",
      justifyContent: "center",
      alignItems: "center",
    },
    codeInput: {
      flex: "1",
      maxWidth: "200px",
      padding: "12px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "1.1rem",
      fontWeight: "600",
      textAlign: "center",
      letterSpacing: "2px",
      textTransform: "uppercase",
      transition: "border-color 0.2s ease",
      outline: "none",
    },
    getInfoButton: {
      padding: "12px 20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      minWidth: "120px",
    },
    fileInfoSection: {
      background: "#f8f9fa",
      border: "1px solid #e9ecef",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      textAlign: "center",
    },
    filePreview: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
      marginBottom: "20px",
      padding: "20px",
      background: "white",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
    },
    fileIcon: {
      fontSize: "3rem",
      opacity: 0.8,
      marginBottom: "8px",
    },
    fileDetails: {
      textAlign: "center",
      width: "100%",
    },
    fileName: {
      margin: "0 0 12px 0",
      color: "#374151",
      fontSize: "1.2rem",
      fontWeight: "600",
      wordBreak: "break-word",
    },
    fileDetailText: {
      margin: "0 0 6px 0",
      color: "#6b7280",
      fontSize: "0.9rem",
    },
    downloadButton: {
      width: "100%",
      maxWidth: "300px",
      margin: "0 auto",
      padding: "14px 24px",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginBottom: "16px",
      display: "block",
    },
    warningMessage: {
      background: "#fef3c7",
      border: "1px solid #fbbf24",
      color: "#92400e",
      padding: "12px 16px",
      borderRadius: "8px",
      fontSize: "0.9rem",
      fontWeight: "500",
      textAlign: "center",
      margin: "0 auto 12px auto",
      maxWidth: "400px",
    },
    tipMessage: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      color: "#1e40af",
      padding: "10px 14px",
      borderRadius: "8px",
      fontSize: "0.85rem",
      fontWeight: "400",
      textAlign: "center",
      margin: "0 auto",
      maxWidth: "400px",
    },
    errorMessage: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
      padding: "12px 16px",
      borderRadius: "8px",
      marginTop: "16px",
      fontWeight: "500",
      textAlign: "center",
      margin: "16px auto 0 auto",
      maxWidth: "400px",
    },
    successMessage: {
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      color: "#15803d",
      padding: "12px 16px",
      borderRadius: "8px",
      marginTop: "16px",
      fontWeight: "500",
      textAlign: "center",
      margin: "16px auto 0 auto",
      maxWidth: "400px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Info Header */}
      <div style={styles.infoHeader}>
        <div style={styles.infoTitle}>📥 Download Files</div>
        <div style={styles.infoText}>
          Enter your 8-character code to download files.
          <strong>Note:</strong> Files auto-delete 2 minutes after first
          download for security.
        </div>
      </div>

      <div style={styles.codeSection}>
        <h3 style={styles.sectionTitle}>Enter File Code</h3>
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="Enter 8-character code"
            maxLength={8}
            style={{
              ...styles.codeInput,
              borderColor: code.length === 8 ? "#10b981" : "#e5e7eb",
            }}
          />
          <button
            onClick={handleGetFileInfo}
            disabled={isLoading || code.length !== 8}
            style={{
              ...styles.getInfoButton,
              opacity: isLoading || code.length !== 8 ? 0.6 : 1,
              cursor:
                isLoading || code.length !== 8 ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "🔍 Checking..." : "🔍 Get File"}
          </button>
        </div>
      </div>

      {fileInfo && (
        <div style={styles.fileInfoSection}>
          <div style={styles.filePreview}>
            <div style={styles.fileIcon}>{getFileIcon(fileInfo.filename)}</div>
            <div style={styles.fileDetails}>
              <h4 style={styles.fileName}>{fileInfo.filename}</h4>
              <p style={styles.fileDetailText}>
                Size: {formatFileSize(fileInfo.size)}
              </p>
              <p style={styles.fileDetailText}>Type: {fileInfo.content_type}</p>
              <p style={styles.fileDetailText}>
                Uploaded: {formatDate(fileInfo.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              ...styles.downloadButton,
              opacity: isDownloading ? 0.6 : 1,
              cursor: isDownloading ? "not-allowed" : "pointer",
            }}
          >
            {isDownloading ? "⬇️ Downloading..." : "⬇️ Download File"}
          </button>

          <div style={styles.warningMessage}>
            ⚠️ This file will be automatically deleted 2 minutes after download.
          </div>

          <div style={styles.tipMessage}>
            💡 <strong>Tip:</strong> If you have IDM or other download managers,
            the file will download to your default location automatically.
          </div>
        </div>
      )}

      {error && <div style={styles.errorMessage}>❌ {error}</div>}

      {success && <div style={styles.successMessage}>✅ {success}</div>}
    </div>
  );
}

export default FileDownload;
