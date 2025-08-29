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
- **Celery + Redis** - Background task processing
- **Local Storage** - Temporary file storage

### Frontend

- **React 18** - User interface
- **Vite** - Build tool and dev server
- **Modern CSS** - Dark theme with animations
- **Responsive Design** - Works on all devices

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 5.7+
- Redis server (optional, for background tasks)

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

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=fileshare_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306

# File Sharing Settings
FILE_EXPIRE_MINUTES=2  # Auto-delete time after download

# Celery/Redis (Optional)
CELERY_BROKER_URL=redis://localhost:6379
CELERY_RESULT_BACKEND=redis://localhost:6379
```

## 📁 Project Structure

```
Fileshare/
├── Backend/
│   ├── fileservice/          # Main Django app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API endpoints
│   │   ├── middleware.py     # Auto-cleanup middleware
│   │   └── management/       # Custom commands
│   ├── fileshare_backend/    # Django project settings
│   ├── cleanup_manual.py     # Manual cleanup script
│   ├── cleanup_cron.py       # Cron job script
│   └── requirements.txt      # Python dependencies
├── Frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── FileUpload.jsx
│   │   │   └── FileDownload.jsx
│   │   ├── App.jsx           # Main app component
│   │   └── App.css           # Styling
│   ├── public/               # Static assets
│   └── package.json          # Node dependencies
└── README.md                 # This file
```

## 🎯 How It Works

1. **Upload**: User uploads file (up to 50MB), gets 8-character sharing code
2. **Share**: User shares the code with intended recipient
3. **Download**: Recipient enters code, downloads file once
4. **Auto-Delete**: File automatically deleted 2 minutes after download

## 🔧 Management Commands

### Manual Cleanup

```bash
# See what would be cleaned up
python manage.py cleanup_files --dry-run

# Clean up expired files
python manage.py cleanup_files

# Force cleanup all downloaded files
python manage.py cleanup_files --force
```

### Using Cleanup Scripts

```bash
# Manual cleanup with options
python cleanup_manual.py --dry-run
python cleanup_manual.py --force

# Cron job (for scheduled cleanup)
python cleanup_cron.py
```

## 🌐 Deployment

### Development

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- Auto-reload enabled for both

### Production Considerations

- Set `DEBUG=False` in production
- Use proper database credentials
- Set up Redis for Celery tasks
- Configure web server (nginx/apache)
- Set up SSL certificates
- Use environment variables for secrets

## 🔒 Security Features

- **No permanent storage** - Files auto-deleted after use
- **Unique access codes** - 8-character alphanumeric codes
- **One-time downloads** - Files expire after first download
- **Token-based security** - Download tokens prevent unauthorized access
- **Input validation** - All uploads validated and sanitized
- **CORS protection** - Cross-origin request security

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by K9TX Technologies
- Inspired by the need for secure, temporary file sharing
- Thanks to the Django and React communities

## 📞 Support

- 🐦 Twitter: [@k9txs](https://twitter.com/k9txs)
- 💼 LinkedIn: [K9TX](https://linkedin.com/in/k9tx)
- 📧 Email: contact@k9tx.com
- 🐙 GitHub: [K9TX](https://github.com/k9tx)

---

**Made with 💙 by K9TX Technologies**
