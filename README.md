# Content Broadcasting System - Backend API

```Application Service:```
https://content-broadcasting-system-0fyq.onrender.com/api-docs/

Production-ready backend system for distributing educational content with approval workflows, intelligent scheduling, and analytics. Built with Node.js, Express, PostgreSQL, and Redis following SOLID principles.

## 📚 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js 16+ | JavaScript execution |
| **Framework** | Express.js | HTTP API server |
| **Database** | PostgreSQL 12+ | Primary data store |
| **Cache** | Redis 7+ | Performance optimization |
| **Authentication** | JWT | Secure token-based auth |
| **Password Security** | bcrypt | Password hashing (10 salt rounds) |
| **ORM** | Sequelize | Database abstraction |
| **File Upload** | Multer | Form data handling |
| **File Storage** | AWS S3 | Cloud file storage |
| **Rate Limiting** | express-rate-limit | API protection |
| **Process Manager** | Nodemon | Development auto-reload |

## 🚀 Setup Steps

### Prerequisites
- Node.js 22+
- PostgreSQL 12+
- Redis 7+ (optional)
- Docker & Docker Compose

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

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=content_broadcasting
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=7d
   PORT=8000
   NODE_ENV=development
   REDIS_HOST=localhost
   REDIS_PORT=6379
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=ap-south-1
   AWS_BUCKET_NAME=your_bucket
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   Services start:
   - App: http://localhost:8000/api
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379
   - Swagger Docs: http://localhost:8000/api-docs

5. **Local Development** (without Docker)
   ```bash
   npm run dev
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

**Stages:**
1. **Upload**: Teacher uploads content (status: pending)
2. **Approval**: Principal reviews and approves/rejects
3. **Scheduling**: Content available within time window
4. **Broadcasting**: Content rotates and displays to students
5. **Access**: Students view/download/share content

## 📅 Scheduling & Rotation Logic

### Time Window
Teachers define visibility period:
- **start_time**: When content becomes visible
- **end_time**: When content stops being visible

Only approved content within active time window is broadcast.

### Content Rotation
Multiple approved contents rotate in subject slots:
- **rotation_duration**: Minutes each content displays (default: 5)
- Cycle repeats continuously until end_time

**Example Rotation:**
```
Subject: Mathematics
├── Content A: 5 minutes
├── Content B: 3 minutes  
└── Content C: 5 minutes
Total cycle: 13 minutes → repeats
```

**Query Logic:**
1. Fetch approved content for teacher
2. Filter by subject
3. Check if current time within time window
4. Calculate which content should display (based on rotation_duration)
5. Return current content + next content in queue

## 📖 API Usage

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Teacher",
  "email": "john@school.edu",
  "password": "secure_password",
  "role": "teacher"
}

Response: 201 Created
{
  "success": true,
  "data": { "id": 1, "name": "John Teacher", "email": "john@school.edu", "role": "teacher" }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@school.edu",
  "password": "secure_password"
}

Response: 200 OK
{
  "success": true,
  "data": { "user": {...}, "token": "eyJhbGciOiJIUzI1NiIs..." }
}
```

### Content Management

#### Upload Content
```http
POST /api/content/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
title: "Math Final Exam"
subject: "Maths"
start_time: "2025-04-26T10:00:00Z"
end_time: "2025-04-26T12:00:00Z"
rotation_duration: 5

Response: 201 Created
{
  "success": true,
  "data": { "id": 1, "title": "Math Final Exam", "status": "pending", "subject": "Maths" }
}
```

#### Get My Content (Teacher)
```http
GET /api/content/teacher/my-content?page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [...],
  "pagination": { "total": 5, "page": 1, "limit": 10, "pages": 1 }
}
```

#### Get Pending Content (Principal)
```http
GET /api/content/pending?page=1&limit=10
Authorization: Bearer <principal_token>

Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

#### Get Live Content (Public)
```http
GET /api/content/live/:teacherId

Response: 200 OK
{
  "success": true,
  "data": {
    "Maths": { "id": 1, "title": "Question Paper", "file_path": "..." },
    "Science": { "id": 2, "title": "Lab Manual", "file_path": "..." }
  }
}
```

### Approval Management

#### Approve Content
```http
POST /api/approval/approve/:contentId
Authorization: Bearer <principal_token>

Response: 200 OK
{
  "success": true,
  "data": { "id": 1, "status": "approved", "approved_at": "2025-04-26T10:30:00Z" }
}
```

#### Reject Content
```http
POST /api/approval/reject/:contentId
Authorization: Bearer <principal_token>
Content-Type: application/json

{
  "reason": "Image quality is poor"
}

Response: 200 OK
{
  "success": true,
  "data": { "id": 1, "status": "rejected", "rejection_reason": "Image quality is poor" }
}
```

### Analytics

#### Record Usage
```http
POST /api/analytics/usage
Content-Type: application/json

{
  "contentId": 1,
  "action": "view"
}

Response: 201 Created
{
  "success": true,
  "data": { "id": 100, "content_id": 1, "action": "view" }
}
```

#### Get Most Active Subjects
```http
GET /api/analytics/subjects/most-active?limit=5
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    { "subject": "Maths", "usage_count": 150, "views": 120, "downloads": 25, "shares": 5 },
    { "subject": "Science", "usage_count": 100, "views": 80, "downloads": 15, "shares": 5 }
  ]
}
```

#### Get Subject Analytics
```http
GET /api/analytics/subjects
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    { "subject": "Maths", "total_content": 10, "total_usage": 150, "active_users": 45, "last_access": "2025-04-26T12:00:00Z" }
  ]
}
```

## 🛡️ Security Features

- **JWT Authentication** - Stateless, 7-day expiration tokens
- **bcrypt Password Hashing** - 10 salt rounds minimum
- **Role-Based Access Control** - `principal` (admin) and `teacher` (user) roles
- **Input Validation** - All inputs validated before processing
- **SQL Injection Prevention** - Parameterized queries via Sequelize
- **Rate Limiting** - Tiered limits per endpoint type (5-30 req/hour)
- **CORS Protection** - Configurable cross-origin policies
- **Error Handling** - Sanitized error messages, no sensitive data leakage
- **File Type Validation** - Whitelist allowed upload formats
- **Environment Secrets** - Never hardcoded, loaded from `.env`

## 📝 Limitations & Assumptions

### Limitations
1. **Single Database Instance** - No sharding/replication by default
2. **In-Memory Rate Limiting** - Uses memory store, not distributed (single instance only)
3. **Local/S3 File Storage** - No other cloud providers supported
4. **No WebSocket Support** - HTTP polling only, no real-time notifications
5. **Predefined Subjects** - Fixed subject list, not dynamic
6. **No Email Notifications** - Content approval/rejection not emailed
7. **No Content Versioning** - Only latest version maintained
8. **Single Teacher per Content** - Cannot have multiple uploaders

### Assumptions
1. **Subjects are predefined** - Teachers select from existing list
2. **One principal per school** - Role-based, not organization-based
3. **Content files stored externally** - Database stores only paths
4. **Rotation happens server-side** - Client doesn't calculate rotation
5. **No real-time sync needed** - Polling acceptable for live content
6. **Users manage own content** - No content delegation workflow
7. **Timestamps in UTC** - All dates stored in UTC timezone
8. **Content approved instantly** - No multi-level approval workflow
9. **IP address tracking** - Not anonymized for analytics
10. **PostgreSQL as primary DB** - ORM tied to SQL databases
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Server will run at: `http://localhost:8000`

6. **Start Production Server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
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
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teacher","email":"teacher@school.edu","password":"123456","role":"teacher"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@school.edu","password":"123456"}'

# Upload Content
curl -X POST http://localhost:8000/api/content/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "title=Question Paper" \
  -F "subject=Maths" \
  -F "start_time=2025-04-26T10:00:00Z" \
  -F "end_time=2025-04-26T12:00:00Z"

# Get Live Content (Public)
curl http://localhost:8000/api/content/live/1
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

## 🔄 Bonus Features

- 🔲 Redis Caching for `/content/live` API
- 🔲 Rate Limiting (express-rate-limit)
- 🔲 AWS S3 Integration
- 🔲 Subject-wise Analytics
- 🔲 Pagination & Advanced Filters

## 👨‍💻 Author

Ashar

