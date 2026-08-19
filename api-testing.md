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

---

## Project APIs

### 1. Create Project
- **Endpoint:** `POST /api/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Creates a new project.

#### Input Structure (Request Body - JSON)
```json
{
  "name": "New Website Redesign",
  "description": "Complete overhaul of the main website."
}
```

#### Output Structure (Success Response - 201 Created)
```json
{
  "success": true,
  "data": {
    "name": "New Website Redesign",
    "description": "Complete overhaul of the main website.",
    "status": "planning",
    "owner": "65f8a1b2c3d4e5f6a7b8c9d0",
    "members": [],
    "_id": "65f9b2c3d4e5f6a7b8c9d1e2",
    "createdAt": "2026-08-19T10:00:00.000Z",
    "updatedAt": "2026-08-19T10:00:00.000Z",
    "__v": 0
  }
}
```

---

### 2. Get All Projects
- **Endpoint:** `GET /api/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Retrieves all projects the authenticated user owns or is a member of.

#### Output Structure (Success Response - 200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f9b2c3d4e5f6a7b8c9d1e2",
      "name": "New Website Redesign",
      "description": "Complete overhaul of the main website.",
      "status": "planning",
      "owner": {
        "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "members": []
    }
  ]
}
```

---

## Task APIs

### 1. Create Task
- **Endpoint:** `POST /api/projects/:projectId/tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Creates a new task under a specific project.

#### Input Structure (Request Body - JSON)
```json
{
  "title": "Design Homepage",
  "description": "Create wireframes and high fidelity designs for the homepage.",
  "priority": "high",
  "dueDate": "2026-08-25T10:00:00.000Z"
}
```

#### Output Structure (Success Response - 201 Created)
```json
{
  "success": true,
  "data": {
    "title": "Design Homepage",
    "description": "Create wireframes and high fidelity designs for the homepage.",
    "project": "65f9b2c3d4e5f6a7b8c9d1e2",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-08-25T10:00:00.000Z",
    "_id": "65f9c3d4e5f6a7b8c9d1e3f4",
    "createdAt": "2026-08-19T10:30:00.000Z",
    "updatedAt": "2026-08-19T10:30:00.000Z",
    "__v": 0
  }
}
```

---

### 2. Get All Tasks
- **Endpoint:** `GET /api/tasks` or `GET /api/projects/:projectId/tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Retrieves all tasks, optionally filtered by project ID.

#### Output Structure (Success Response - 200 OK)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f9c3d4e5f6a7b8c9d1e3f4",
      "title": "Design Homepage",
      "description": "Create wireframes and high fidelity designs for the homepage.",
      "project": {
        "_id": "65f9b2c3d4e5f6a7b8c9d1e2",
        "name": "New Website Redesign",
        "status": "planning"
      },
      "status": "todo",
      "priority": "high"
    }
  ]
}
```
