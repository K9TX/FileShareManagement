# 🚀 K9TX FileShare - Secure Temporary File Sharing Service

A lightweight, secure file sharing service with automatic deletion and modern UI. Built with Django REST Framework and React.

## ✨ Features

- **🔐 Secure Sharing**: Files protected with unique 8-character codes
- **⏰ Auto-Expiration**: Files automatically deleted 2 minutes after download
- **📱 Modern UI**: Dark theme with K9TX branding and animations
- **⚡ Fast Upload**: Drag & drop with real-time progress tracking
- **🔒 One-Time Downloads**: Secure token-based download system
- **📄 All File Types**: Support for any file type up to 50MB
- **🧹 Auto-Cleanup**: Background cleanup of expired files and database records

## 🛠️ Tech Stack

### Backend

- **Django 4.2** - Web framework
- **Django REST Framework** - API development
- **MySQL** - Database for metadata

### Frontend

- **React 18** - User interface
- **Vite** - Build tool and dev server

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 5.7+

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Fileshare/Backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**

   ```bash
   # Create .env file with your settings
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Set up database**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Start the server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd ../Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📞 Support

Made with 💙 by K9TX 


