# NestJS Auth API with Swagger Documentation

A production-ready NestJS backend API with comprehensive Swagger/OpenAPI documentation, PostgreSQL database, JWT authentication, file uploads, and Docker containerization.

## 🚀 Live Demo

- **API**: https://nest-auth-docker.onrender.com
- **Swagger Docs**: https://nest-auth-docker.onrender.com/api
- **Database**: Neon PostgreSQL
- **File Storage**: Cloudinary

## 📋 Features

- ✅ **Full Swagger/OpenAPI Documentation** - Interactive API docs with all endpoints documented
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **PostgreSQL Database** - TypeORM with automatic schema synchronization
- ✅ **File Uploads** - Cloudinary integration for images and documents
- ✅ **Rate Limiting** - Built-in request throttling for API protection
- ✅ **XSS Protection** - Custom sanitization interceptor
- ✅ **Docker Containerization** - docker-compose for local development
- ✅ **Environment Validation** - Joi schema validation for all environment variables
- ✅ **CORS & Security** - Helmet middleware for HTTP security headers

## 📦 Tech Stack

- **Framework**: NestJS 11+ with TypeScript
- **ORM**: TypeORM with PostgreSQL
- **Authentication**: @nestjs/jwt
- **Documentation**: @nestjs/swagger with Swagger UI
- **File Storage**: Cloudinary SDK
- **Security**: Helmet, Rate Limiting
- **Containerization**: Docker & docker-compose
- **Cloud Hosting**: Render (backend), Neon (database)

## 🗂️ Project Structure

```
src/
├── auth/                      # Authentication module (login, register)
├── users/                     # User management
├── students/                  # Student profiles with skills & experience
├── companies/                 # Company management
├── job-offers/                # Job postings
├── applications/              # Job applications
├── upload/                    # File upload controller (Cloudinary integration)
├── common/
│   ├── cloudinary/           # Cloudinary service & provider
│   ├── rate-limit/           # Rate limiting module
│   ├── sanitization/         # XSS protection
│   └── interceptors/         # Global interceptors
├── config/
│   └── env.validation.ts     # Environment variable validation schema
├── app.module.ts             # Root module
└── main.ts                   # Application bootstrap
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for local development)
- PostgreSQL 15 (or use Neon for cloud)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/fadimeddahi/nest-auth-docker.git
cd nest-auth-docker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
```

4. **Start with Docker (Recommended)**
```bash
docker-compose up -d
```

5. **Or run locally**
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

6. **Access Swagger Documentation**
- Local: http://localhost:3000/api
- Production: https://nest-auth-docker.onrender.com/api

## 🔑 Environment Variables

Create a `.env` file with the following variables:

```dotenv
# Database Configuration
POSTGRES_HOST=your_db_host
POSTGRES_PORT=5432
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name

# Environment
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Users
- `POST /users/register` - Alternative registration endpoint
- `GET /users/profile` - Get current user profile (protected)
- `GET /users/:id` - Get user details by ID

### Students
- `GET /students/profile` - Get current student profile (protected)
- `PUT /students/profile` - Update student profile (protected)
- `GET /students/:id` - Get student details

### Companies
- `GET /companies` - List all companies
- `GET /companies/:id` - Get company details
- `GET /companies/profile` - Get current company profile (protected)
- `PUT /companies/profile` - Update company profile (protected)

### Job Offers
- `GET /job-offers` - List all job offers
- `GET /job-offers/:id` - Get job offer details
- `POST /job-offers` - Create job offer (protected)
- `PUT /job-offers/:id` - Update job offer (protected)
- `DELETE /job-offers/:id` - Delete job offer (protected)
- `GET /job-offers/company/:companyId` - Filter by company
- `GET /job-offers/type/:type` - Filter by offer type

### Applications
- `POST /applications` - Submit job application (protected)
- `GET /applications/my-applications` - Get current user's applications (protected)
- `GET /applications/offer/:offerId` - Get applications for job offer (protected)
- `PUT /applications/:id/status` - Update application status (protected)
- `PUT /applications/:id/withdraw` - Withdraw application (protected)

### File Upload
- `POST /upload/image` - Upload image (max 5MB, jpg/png/webp)
- `POST /upload/document` - Upload document (max 10MB, pdf)

All endpoints are documented with examples and response schemas in the Swagger UI.

## 🔐 Authentication

The API uses JWT (JSON Web Token) for authentication:

1. **Register/Login** to get a JWT token
2. **Include the token** in the `Authorization` header:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

Protected endpoints require a valid JWT token.

## 📤 File Upload Example

```bash
curl -X POST 'https://nest-auth-docker.onrender.com/upload/image' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'file=@your_image.jpg'
```

Response:
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "nest-auth/images/..."
}
```

## 🧪 Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

Test coverage:
```bash
npm run test:cov
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t nest-auth-docker .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs nest-app
docker-compose logs nest-db
```

### Stop Containers
```bash
docker-compose down
```

## 🌐 Production Deployment

### Deployed on Render

1. Connect GitHub repository
2. Set environment variables in Render dashboard
3. Build command: `npm install --legacy-peer-deps && npm run build`
4. Start command: `node dist/main.js`

### Database on Neon PostgreSQL

- Create Neon project at https://console.neon.tech
- Configure `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- SSL is automatically enabled for Neon connections

## 📊 Database Schema

The database automatically creates tables for:
- `users` - User accounts and authentication
- `students` - Student profiles
- `skills` - Student skills
- `experiences` - Student work experience
- `companies` - Company information
- `job_offers` - Job postings
- `applications` - Job applications

Tables are auto-created on first startup via TypeORM synchronization.

## 🛡️ Security Features

- ✅ **Helmet** - HTTP security headers
- ✅ **CORS** - Cross-Origin Resource Sharing configured
- ✅ **Rate Limiting** - Request throttling (3-5 req/min depending on endpoint)
- ✅ **XSS Protection** - HTML sanitization interceptor
- ✅ **JWT Validation** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt for password storage
- ✅ **SSL/TLS** - Encrypted database connections

## 🔄 Continuous Integration

The repository is connected to GitHub. Push changes to automatically trigger deployment on Render.

## 📝 License

This project is MIT licensed.

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues.

## 📧 Contact

- GitHub: [@fadimeddahi](https://github.com/fadimeddahi)
- Email: f_meddahi@estin.dz

## 🚀 Getting Started

```bash
# 1. Clone repository
git clone https://github.com/fadimeddahi/nest-auth-docker.git

# 2. Install dependencies
npm install

# 3. Configure .env file
cp .env.example .env
# Edit .env with your database credentials

# 4. Start development server
npm run start:dev

# 5. Open Swagger UI
# http://localhost:3000/api
```

---

**Made with ❤️ using NestJS**
