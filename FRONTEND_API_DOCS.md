# Frontend API Documentation

**Base URL:** `https://nest-auth-docker.onrender.com` (Production)  
**Local Dev:** `http://localhost:3000`

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Student Endpoints](#student-endpoints)
3. [Company Endpoints](#company-endpoints)
4. [Job Offers](#job-offers)
5. [Applications](#applications)
6. [File Upload](#file-upload)
7. [Error Handling](#error-handling)

---

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register (Student)
```http
POST /auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "userType": "student",
  "university": "estin"
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "userId": 1,
  "email": "john@example.com",
  "userType": "student",
  "firstName": "John",
  "lastName": "Doe"
}
```

**University Options:** `usthb`, `esi`, `usdb`, `estin`, `other`

---

### Register (Enterprise)
```http
POST /auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "password": "StrongPass123!",
  "userType": "enterprise",
  "enterpriseSize": "51-200"
}
```

**Enterprise Size Options:** `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1000+`

---

### Login
```http
POST /auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "StrongPass123!",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 1,
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Store `access_token` in localStorage/sessionStorage and include in all subsequent requests**

---

## 👤 Student Endpoints

### Get Student Profile (Protected)
```http
GET /students/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "studentId": 1,
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "university": "estin",
  "createdAt": "2024-01-25T10:00:00Z",
  "skills": [
    {
      "skillId": 1,
      "skillName": "JavaScript",
      "proficiency": "Advanced"
    }
  ],
  "experiences": [
    {
      "experienceId": 1,
      "company": "Tech Corp",
      "position": "Junior Developer",
      "startDate": "2023-01-01",
      "endDate": "2024-01-01"
    }
  ]
}
```

---

### Update Student Profile (Protected)
```http
PUT /students/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "university": "estin",
  "bio": "Passionate full-stack developer"
}
```

**Response (200):** Same as Get Profile

---

### Get Student by ID
```http
GET /students/:id
```

**Response (200):** Same as Get Profile

---

## 🏢 Company Endpoints

### Get Company Profile (Protected)
```http
GET /companies/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "companyId": 1,
  "userId": 1,
  "firstName": "Tech Corp",
  "lastName": "",
  "enterpriseSize": "51-200",
  "website": "https://techcorp.com",
  "createdAt": "2024-01-25T10:00:00Z",
  "jobOffers": [
    {
      "offerId": 1,
      "title": "Senior Developer",
      "description": "We are looking for...",
      "type": "full-time",
      "salary": 5000
    }
  ]
}
```

---

### Update Company Profile (Protected)
```http
PUT /companies/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "firstName": "Tech Corp",
  "website": "https://techcorp.com",
  "description": "Leading tech company"
}
```

**Response (200):** Same as Get Profile

---

### Get All Companies
```http
GET /companies
```

**Response (200):**
```json
[
  {
    "companyId": 1,
    "firstName": "Tech Corp",
    "enterpriseSize": "51-200",
    "website": "https://techcorp.com"
  }
]
```

---

### Get Company by ID
```http
GET /companies/:id
```

**Response (200):** Company object

---

## 💼 Job Offers

### Get All Job Offers
```http
GET /job-offers
```

**Response (200):**
```json
[
  {
    "offerId": 1,
    "title": "Senior Backend Developer",
    "description": "We are looking for...",
    "type": "full-time",
    "salary": 5000,
    "location": "Algiers",
    "company": {
      "companyId": 1,
      "firstName": "Tech Corp"
    },
    "createdAt": "2024-01-25T10:00:00Z"
  }
]
```

---

### Get Job Offer by ID
```http
GET /job-offers/:id
```

**Response (200):** Job offer object

---

### Get Job Offers by Company
```http
GET /job-offers/company/:companyId
```

**Response (200):** Array of job offers

---

### Get Job Offers by Type
```http
GET /job-offers/type/:type
```

**Type Options:** `full-time`, `part-time`, `contract`, `internship`

**Response (200):** Array of job offers

---

### Create Job Offer (Protected - Companies Only)
```http
POST /job-offers
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Senior Backend Developer",
  "description": "We are looking for an experienced backend developer...",
  "type": "full-time",
  "salary": 5000,
  "location": "Algiers",
  "requirements": "5+ years experience, Node.js, PostgreSQL"
}
```

**Response (201):** Job offer object

---

### Update Job Offer (Protected - Owner Only)
```http
PUT /job-offers/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:** Same as Create

**Response (200):** Updated job offer object

---

### Delete Job Offer (Protected - Owner Only)
```http
DELETE /job-offers/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Job offer deleted successfully"
}
```

---

## 📝 Applications

### Apply for Job (Protected - Students Only)
```http
POST /applications/:offerId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "coverLetter": "I am very interested in this position because...",
  "cvUrl": "https://my-cv.com/cv.pdf"
}
```

**Response (201):**
```json
{
  "applicationId": 1,
  "studentId": 1,
  "offerId": 1,
  "status": "pending",
  "coverLetter": "I am very interested...",
  "cvUrl": "https://my-cv.com/cv.pdf",
  "createdAt": "2024-01-25T10:00:00Z"
}
```

---

### Get My Applications (Protected - Students Only)
```http
GET /applications/my-applications
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
[
  {
    "applicationId": 1,
    "status": "pending",
    "jobOffer": {
      "offerId": 1,
      "title": "Senior Developer",
      "company": {
        "firstName": "Tech Corp"
      }
    },
    "createdAt": "2024-01-25T10:00:00Z"
  }
]
```

---

### Get Applications by Offer (Protected - Companies Only)
```http
GET /applications/offer/:offerId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):** Array of applications for that offer

---

### Get Application by ID (Protected)
```http
GET /applications/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):** Application object

---

### Update Application Status (Protected - Companies Only)
```http
PUT /applications/:id/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "status": "accepted"
}
```

**Status Options:** `pending`, `accepted`, `rejected`, `withdrawn`

**Response (200):** Updated application object

---

### Withdraw Application (Protected - Students Only)
```http
PUT /applications/:id/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Application withdrawn successfully"
}
```

---

## 📤 File Upload

### Upload Image (Protected)
```http
POST /upload/image
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Image file (jpg, jpeg, png, webp, max 5MB)

**Response (201):**
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "publicId": "nest-auth/images/..."
}
```

---

### Upload Document (Protected)
```http
POST /upload/document
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF file (max 10MB)

**Response (201):**
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "publicId": "nest-auth/documents/..."
}
```

---

## ❌ Error Handling

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Email already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error |

---

## 🔑 Authentication Flow

```
1. User registers/logs in
   ↓
2. Backend returns access_token (JWT)
   ↓
3. Frontend stores token (localStorage/sessionStorage)
   ↓
4. Frontend includes token in Authorization header for protected endpoints
   ↓
5. Backend validates token
   ↓
6. If valid → Process request
   If invalid → Return 401 Unauthorized (user must login again)
```

---

## 📱 Frontend Setup (Example)

```javascript
// Store token after login
const response = await fetch('https://nest-auth-docker.onrender.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});

const data = await response.json();
localStorage.setItem('access_token', data.access_token);

// Use token in protected requests
const token = localStorage.getItem('access_token');
const profileResponse = await fetch('https://nest-auth-docker.onrender.com/students/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🎯 Student Dashboard Data Flow

```
Login
  ↓
Get Student Profile (GET /students/profile)
  ↓
Get My Applications (GET /applications/my-applications)
  ↓
Display:
  - Student Info
  - Skills
  - Experiences
  - Applications List
  - Application Status
```

---

## 🎯 Company Dashboard Data Flow

```
Login
  ↓
Get Company Profile (GET /companies/profile)
  ↓
Get Job Offers (GET /job-offers)
  ↓
Get Applications for Each Offer (GET /applications/offer/:offerId)
  ↓
Display:
  - Company Info
  - Job Offers
  - Applications
  - Applicant Details
```

---

**Last Updated:** January 25, 2026  
**API Version:** 1.0  
**Swagger Docs:** https://nest-auth-docker.onrender.com/api
