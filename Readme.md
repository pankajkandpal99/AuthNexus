# MERN Stack Developer Assignment

## Overview

This application is a complete user authentication and management system built with the MERN stack (MongoDB, Express, React, Node.js) with TypeScript. The system includes user registration, email verification, login, password reset, role-based access control (admin/super_admin/user), profile management, and user listing with search functionality.

## Features Implemented

### Backend Features

✔ **User Authentication**

- JWT authentication with refresh tokens
- Email verification system
- Password reset functionality
- Role-based access control (RBAC)
- Secure cookie management

✔ **Database**

- MySQL with Sequelize ORM
- Proper data modeling and relationships
- Database seeding capability

✔ **Security**

- Input validation using Zod and express-validator
- Rate limiting for API endpoints
- Helmet for security headers
- XSS protection
- CSRF protection

✔ **File Handling**

- Profile image upload with Multer
- Image processing with Sharp

✔ **Infrastructure**

- Redis configured (caching implementation pending)
- Upstash Redis integration ready
- SMTP email service integration

### Frontend Features

✔ **User Interface**

- Responsive design using Tailwind CSS
- ShadCN UI components
- Custom pagination implementation
- Form validation with react-hook-form
- Toast notifications

✔ **Functionality**

- User registration with image preview
- Email verification flow
- Password reset flow
- Profile management (view/edit)
- User listing with search
- Role-based UI rendering

## Pending Items

- **Redis Caching**: Infrastructure is configured but caching logic needs implementation
- **Google OAuth**: Setup is partially complete but couldn't be finished due to time constraints
- **Additional Optimizations**: More performance optimizations could be added

## Technical Stack

### Backend

- Node.js with TypeScript
- Express.js framework
- MySQL with Sequelize ORM
- Redis (configured)
- JWT authentication
- Zod for validation
- Busboy for file uploads (stronger and better handling than multer)
- Nodemailer for emails
- Winston logging

### Frontend

- React 19 with TypeScript
- Vite build tool
- Tailwind CSS with ShadCN
- React Hook Form + Zod validation
- Axios for API calls
- Redux Toolkit for state management
- Framer Motion for animations
- React Router DOM

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MySQL
- Redis (optional)
- SMTP credentials (Mailtrap or real SMTP)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pankajkandpal99/AuthNexus.git
   ```

2. Install dependencies for both server and client:
   cd server && npm install
   cd ../client && npm install

3. Create a .env file in client directory based on .env exmaple 

VITE_MY_BACKEND_URL=http:localhost:8800

4. Create a .env file in the server directory based on .env.example:

Server Config -> 
NODE_ENV=development
PORT=8800
JWT_SECRET=your_jwt_secret_key

MySQL Database Config -> 
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
DB_PORT=3306

App Config -> 
AUTO_SYNC_DB=true
COOKIE_DOMAIN=localhost
ALLOWED_ORIGINS=http://localhost:5173
BASE_URL=http://localhost:8800
FRONTEND_URL=http://localhost:5173

SMTP (Email) Config -> 
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=AuthNexus

Redis Config -> 
If using Upstash Redis (cloud) -> 
UPSTASH_REDIS_URL=redis://default:your_upstash_token@your-upstash-url:port

OR if using local Redis -> 
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=


5. Run the application:
# In server directory
npm run dev

# In client directory (separate terminal)
npm run dev

Implementation Notes
1. Type Safety: The entire application is built with 
TypeScript for type safety

2. Modern React: Uses React 19 with Vite for fast development

3. Security: Implements multiple security layers including rate limiting and input sanitization

4. Scalability: Architecture designed for easy scaling

5. Redis: While Redis is fully configured, caching implementation would be the next logical step

# Time Constraints
Due to the limited timeframe:

1. Google OAuth couldn't be fully implemented
2. Redis caching logic needs to be completed
3. Some edge cases could use additional testing

# Future Improvements
1. Implement Redis caching for frequent queries
2. Complete Google OAuth integration
3. Add more comprehensive tests
4. Implement API documentation with Swagger
5. Add Docker configuration for easier deployment
