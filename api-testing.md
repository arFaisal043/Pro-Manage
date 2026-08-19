# API Testing Documentation

This document contains the input and output structure for all implemented APIs, useful for testing via Postman or similar tools.

## Authentication APIs

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Description:** Registers a new user and returns a JWT token along with user details.

#### Input Structure (Request Body - JSON)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Output Structure (Success Response - 201 Created)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 2. Login User
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a user and returns a JWT token.

#### Input Structure (Request Body - JSON)
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Output Structure (Success Response - 200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```
