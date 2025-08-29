import { useState, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedCode, setUploadedCode] = useState("");
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setError("");
    setSuccess("");
    setUploadedCode("");
    setShowCopySuccess(false);

    // Check file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }

    setFile(selectedFile);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      const { code, filename } = response.data;
      setUploadedCode(code);
      setSuccess(`File uploaded successfully!`);
      setFile(null);
      setUploadProgress(0);

      // Call the success callback with the code
      if (onUploadSuccess) {
        onUploadSuccess(code);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error.response?.data?.error || "Upload failed. Please try again."
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "0 auto",
    },
    dropZone: {
      border: `2px dashed ${
        isDragging ? "#667eea" : file ? "#10b981" : "#d1d5db"
      }`,
      borderRadius: "12px",
      padding: "40px 20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: isDragging ? "#f0f4ff" : file ? "#f0fdf4" : "#fafafa",
      marginBottom: "20px",
      transform: isDragging ? "scale(1.02)" : "scale(1)",
    },
    uploadIcon: {
      fontSize: "3rem",
      marginBottom: "16px",
      opacity: 0.7,
    },
    dropZoneTitle: {
      margin: "0 0 8px 0",
      color: "#374151",
      fontSize: "1.2rem",
      fontWeight: "600",
    },
    dropZoneText: {
      margin: 0,
      color: "#6b7280",
      fontSize: "0.9rem",
    },
    fileInfo: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "20px",
      background: "white",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
    },
    fileIcon: {
      fontSize: "2rem",
      opacity: 0.8,
    },
    fileDetails: {
      flex: 1,
      textAlign: "left",
    },
    fileName: {
      margin: "0 0 4px 0",
      color: "#374151",
      fontSize: "1rem",
      fontWeight: "600",
    },
    fileSize: {
      margin: 0,
      color: "#6b7280",
      fontSize: "0.9rem",
    },
    removeFile: {
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.1rem",
      transition: "background-color 0.2s ease",
    },
    uploadButton: {
      width: "100%",
      padding: "14px 24px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginBottom: "20px",
    },
    progressContainer: {
      marginBottom: "20px",
    },
    progressBar: {
      width: "100%",
      height: "8px",
      background: "#e5e7eb",
      borderRadius: "4px",
      overflow: "hidden",
      marginBottom: "8px",
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
      transition: "width 0.3s ease",
      borderRadius: "4px",
      width: `${uploadProgress}%`,
    },
    progressText: {
      margin: 0,
      textAlign: "center",
      color: "#6b7280",
      fontSize: "0.9rem",
      fontWeight: "500",
    },
    errorMessage: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
      padding: "12px 16px",
      borderRadius: "8px",
      marginTop: "16px",
      fontWeight: "500",
    },
    successMessage: {
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      color: "#15803d",
      padding: "12px 16px",
      borderRadius: "8px",
      marginTop: "16px",
      fontWeight: "500",
      wordBreak: "break-all",
    },
    codeContainer: {
      background: "rgba(26, 26, 46, 0.9)",
      border: "1px solid rgba(0, 212, 255, 0.3)",
      borderRadius: "12px",
      padding: "20px",
      marginTop: "20px",
      textAlign: "center",
      backdropFilter: "blur(10px)",
      boxShadow: "0 8px 25px rgba(0, 212, 255, 0.1)",
    },
    codeTitle: {
      color: "#00d4ff",
      fontSize: "1.1rem",
      fontWeight: "600",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    codeDisplay: {
      background: "rgba(0, 0, 0, 0.3)",
      border: "1px solid rgba(0, 212, 255, 0.2)",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    },
    codeText: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "'Courier New', monospace",
      letterSpacing: "2px",
      flex: 1,
    },
    copyButton: {
      background: "linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      minWidth: "80px",
      justifyContent: "center",
    },
    copySuccess: {
      color: "#10b981",
      fontSize: "0.9rem",
      fontWeight: "500",
      marginTop: "8px",
    },
    codeInstructions: {
      color: "#a1a1aa",
      fontSize: "0.9rem",
      marginTop: "12px",
    },
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.dropZone}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="*/*"
        />

        {!file ? (
          <div>
            <div style={styles.uploadIcon}>📁</div>
            <h3 style={styles.dropZoneTitle}>
              Drop your file here or click to browse
            </h3>
            <p style={styles.dropZoneText}>Maximum file size: 50MB</p>
            <p style={styles.dropZoneText}>
              Supports all file types with extensions preserved
            </p>
          </div>
        ) : (
          <div style={styles.fileInfo}>
            <div style={styles.fileIcon}>{getFileIcon(file.name)}</div>
            <div style={styles.fileDetails}>
              <h4 style={styles.fileName}>{file.name}</h4>
              <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
              <p style={styles.fileSize}>Type: {file.type || "Unknown"}</p>
            </div>
            <button
              style={styles.removeFile}
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {file && !isUploading && (
        <button style={styles.uploadButton} onClick={handleUpload}>
          🚀 Upload File
        </button>
      )}

      {isUploading && (
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={styles.progressFill}></div>
          </div>
          <p style={styles.progressText}>Uploading... {uploadProgress}%</p>
        </div>
      )}

      {error && <div style={styles.errorMessage}>❌ {error}</div>}

      {success && <div style={styles.successMessage}>✅ {success}</div>}

      {uploadedCode && (
        <div style={styles.codeContainer}>
          <div style={styles.codeTitle}>🎯 Your Share Code</div>
          <div style={styles.codeDisplay}>
            <div style={styles.codeText}>{uploadedCode}</div>
            <button
              style={styles.copyButton}
              onClick={() => copyToClipboard(uploadedCode)}
            >
              {showCopySuccess ? <>✅ Copied!</> : <>📋 Copy</>}
            </button>
          </div>
          {showCopySuccess && (
            <div style={styles.copySuccess}>✅ Code copied to clipboard!</div>
          )}
          <p style={styles.codeInstructions}>
            Share this code with others to let them download your file.
            <br />
            The file will be automatically deleted 2 minutes after download.
          </p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
