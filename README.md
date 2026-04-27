# Content Broadcasting System - Backend API

A production-ready, enterprise-grade backend system for distributing educational content to students with approval workflows and intelligent scheduling. Built with **Node.js, Express, PostgreSQL** and following **SOLID principles** and **OOP design patterns**.

## 🌟 Features

- ✅ **JWT-based Authentication** with role-based access control (RBAC)
- ✅ **Content Upload System** with file validation (JPG, PNG, GIF)
- ✅ **Approval Workflow** for content moderation by principals
- ✅ **Subject-Based Scheduling** with intelligent content rotation
- ✅ **Public Broadcasting API** for students to access live content
- ✅ **Time-Window Scheduling** - Teachers define when content is visible
- ✅ **Clean Architecture** following SOLID principles and OOP patterns
- ✅ **Error Handling** with custom error classes and middleware
- ✅ **Input Validation** with comprehensive validators
- ✅ **Dependency Injection** for testability and flexibility

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           Express Application Factory               │
│    (Dependency Injection & Service Setup)           │
└──────────────────────┬────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    Controllers    Services      Utilities
        │              │              │
    Auth/Content/  Business    Manager/Validator
    Approval       Logic       Classes
        │              │              │
        └──────────────┼──────────────┘
                       │
                   Routes
                       │
                   Middleware
                       │
              Database (PostgreSQL)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ 
- **PostgreSQL** 12+
- **npm** or **yarn**

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/l-ashar-l/Content-Broadcasting-System.git
   cd Content-Broadcasting-System
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=content_broadcasting
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_DIALECT=postgres

   # JWT
   JWT_SECRET=your_secret_key_change_in_production
   JWT_EXPIRE=7d

   # Server
   PORT=5000
   NODE_ENV=development

   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads


    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_REGION=ap-south-1
    AWS_BUCKET_NAME=content-broadcast
   ```

4. **Create Database**
   ```bash
   psql -U postgres -c "CREATE DATABASE content_broadcasting;"
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Server will run at: `http://localhost:5000`

6. **Start Production Server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Auth Endpoints

#### Register User
```http
POST /auth/register

{
  "name": "John Teacher",
  "email": "john@school.edu",
  "password": "secure_password",
  "role": "teacher"  // or "principal"
}

Response: 201 Created
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Teacher",
    "email": "john@school.edu",
    "role": "teacher",
    "created_at": "2025-04-26T10:00:00Z"
  }
}
```

#### Login User
```http
POST /auth/login

{
  "email": "john@school.edu",
  "password": "secure_password"
}

Response: 200 OK
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {...}
}
```

### Content Endpoints

#### Upload Content
```http
POST /content/upload
Authorization: Bearer <teacher_token>
Content-Type: multipart/form-data

Parameters:
  file: <binary file>
  title: "Math Question Paper"
  subject: "Maths"
  description: "Final exam paper (optional)"
  start_time: "2025-04-26T10:00:00Z"
  end_time: "2025-04-26T12:00:00Z"
  rotation_duration: 5  (in minutes)

Response: 201 Created
{
  "success": true,
  "statusCode": 201,
  "message": "Content uploaded successfully",
  "data": {
    "id": 1,
    "title": "Math Question Paper",
    "subject": "Maths",
    "status": "pending",
    "file_path": "1234567890-987654321.jpg",
    "created_at": "2025-04-26T10:00:00Z"
  }
}
```

#### Get My Content (Teacher)
```http
GET /content/teacher/my-content?page=1&limit=10
Authorization: Bearer <teacher_token>

Response: 200 OK
{
  "success": true,
  "message": "Content retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Get Pending Content (Principal)
```http
GET /content/pending?page=1&limit=10
Authorization: Bearer <principal_token>

Response: 200 OK
{
  "success": true,
  "message": "Pending content retrieved successfully",
  "data": [...],
  "pagination": {...}
}
```

#### Get Live Content (Public API)
```http
GET /content/live/:teacherId

Response: 200 OK
{
  "success": true,
  "message": "Live content retrieved successfully",
  "data": {
    "Maths": {
      "id": 1,
      "title": "Question Paper",
      "subject": "Maths",
      "file_path": "...",
      "start_time": "2025-04-26T10:00:00Z"
    }
  }
}
```

### Approval Endpoints

#### Approve Content
```http
POST /approval/approve/:contentId
Authorization: Bearer <principal_token>

Response: 200 OK
{
  "success": true,
  "message": "Content approved successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "approved_by": 2,
    "approved_at": "2025-04-26T10:30:00Z"
  }
}
```

#### Reject Content
```http
POST /approval/reject/:contentId
Authorization: Bearer <principal_token>

{
  "reason": "Image quality is poor"
}

Response: 200 OK
{
  "success": true,
  "message": "Content rejected successfully",
  "data": {
    "id": 1,
    "status": "rejected",
    "rejection_reason": "Image quality is poor"
  }
}
```

#### Get Approval Statistics
```http
GET /approval/stats
Authorization: Bearer <principal_token>

Response: 200 OK
{
  "success": true,
  "message": "Approval statistics retrieved successfully",
  "data": {
    "pending": 3,
    "approved": 10,
    "rejected": 2,
    "total": 15
  }
}
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('principal', 'teacher') DEFAULT 'teacher',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Contents Table
```sql
CREATE TABLE contents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by INT NOT NULL REFERENCES users(id),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by INT REFERENCES users(id),
  approved_at DATETIME,
  start_time DATETIME,
  end_time DATETIME,
  rotation_duration INT DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Content Lifecycle

```
Upload → Pending → [Approved / Rejected]
                        ↓
                   Check Time Window
                   Check Rotation
                        ↓
                   Live Content
                        ↓
                   Students Access
```

## 📅 Scheduling & Rotation Logic

**Time Window:** Teachers define when content is visible
- `start_time`: When content becomes visible
- `end_time`: When content stops being visible

**Rotation Duration:** Time each content displays
- `rotation_duration`: Minutes to display per rotation cycle
- Multiple contents cycle continuously

**Example:**
- Content A: 5 minutes
- Content B: 3 minutes
- Content C: 5 minutes
- Cycle: A (5) → B (3) → C (5) → repeat (total 13 min cycle)

## 🛡️ Security Features

- ✅ **JWT Authentication** - Stateless, secure token-based auth
- ✅ **bcrypt Password Hashing** - 10 salt rounds
- ✅ **Role-Based Access Control** - Principal vs Teacher permissions
- ✅ **Input Validation** - Comprehensive validators
- ✅ **File Type Validation** - Whitelist allowed formats
- ✅ **Error Handling** - No sensitive data leakage
- ✅ **Environment-based Secrets** - Never hardcoded secrets

## 🧪 Testing

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teacher","email":"teacher@school.edu","password":"123456","role":"teacher"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@school.edu","password":"123456"}'

# Upload Content
curl -X POST http://localhost:5000/api/content/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "title=Question Paper" \
  -F "subject=Maths" \
  -F "start_time=2025-04-26T10:00:00Z" \
  -F "end_time=2025-04-26T12:00:00Z"

# Get Live Content (Public)
curl http://localhost:5000/api/content/live/1
```

## 📁 Project Structure

```
src/
├── config/              # Database configuration
├── controllers/         # HTTP request handlers
├── middlewares/         # Express middleware
├── models/              # Sequelize models
├── routes/              # Route definitions
├── services/            # Business logic
├── utils/               # Utility classes
├── app.js               # Application factory
└── server.js            # Entry point

uploads/                 # File storage
architecture-notes.txt   # Detailed architecture
```

## 🎯 SOLID Principles Implementation

1. **Single Responsibility** - Each class has one reason to change
2. **Open/Closed** - Open for extension, closed for modification
3. **Liskov Substitution** - Implementations are interchangeable
4. **Interface Segregation** - Specific interfaces, not general ones
5. **Dependency Inversion** - Depend on abstractions, not implementations

## 🐛 Error Handling

All errors follow standard format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": null
}
```

## 📖 Assumptions & Limitations

1. **Single Database Instance** - No sharding/replication by default
2. **Local File Storage** - S3 is optional/bonus feature
3. **Predefined Subjects** - Can be extended from database
4. **No Real-time Notifications** - WebSocket optional
5. **No Email Notifications** - Can be added later
6. **Basic Rate Limiting** - Can be enhanced with Redis

## 🔄 Optional Features (Bonus)

- 🔲 Redis Caching for `/content/live` API
- 🔲 Rate Limiting (express-rate-limit)
- 🔲 AWS S3 Integration
- 🔲 Subject-wise Analytics
- 🔲 Pagination & Advanced Filters

## 👨‍💻 Author

Ashar - Backend Developer

