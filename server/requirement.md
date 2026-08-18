You are an expert full-stack Node.js developer. Build a complete Express.js backend for a project management application called "ProManage" with the following specifications. Generate all code, models, routes, controllers, middleware, and configuration files.

================================================================================
PROJECT NAME: ProManage 
================================================================================

OVERVIEW:
A RESTful API for a project management tool where Project Leads can create projects, assign tasks to team members, and track progress. Regular users (team members) can view and update tasks assigned to them.

================================================================================
TECHNOLOGY STACK:
================================================================================
- Runtime: Node.js (v18+)
- Framework: Express.js
- Database: MongoDB with Mongoose ODM
- Authentication: JWT (JSON Web Tokens)
- Password Hashing: bcryptjs
- Environment Variables: dotenv
- CORS: cors
- Validation: express-validator or Joi (choose one)
- File Structure: MVC pattern

================================================================================
FILE STRUCTURE TO GENERATE:
================================================================================

backend/
├── .env
├── .gitignore
├── package.json
├── server.js
├── vercel.json (for deployment)
├── config/
│   ├── db.js
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Project.js
│   └── Task.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── controllers/
│   ├── authController.js
│   ├── projectController.js
│   └── taskController.js
├── routes/
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   └── taskRoutes.js
└── utils/
    ├── apiResponse.js
    └── constants.js

================================================================================
DATABASE SCHEMAS (Mongoose Models):
================================================================================

1. USER MODEL (User.js):
-------------------------------
Fields:
- name: String (required, trim)
- email: String (required, unique, lowercase, trim)
- password: String (required, minlength: 6, hashed with bcrypt)
- role: String (enum: ['admin', 'user'], default: 'user')
- avatar: String (optional, URL)
- createdAt: Date (default: Date.now)
- updatedAt: Date

Methods:
- matchPassword(enteredPassword): Compare hashed password using bcrypt.compare
- generateToken(): Generate JWT token using user.id and role

Pre-save Hook:
- Hash password before saving if password is modified

Indexes:
- email: 1 (unique)
- role: 1

2. PROJECT MODEL (Project.js):
-------------------------------
Fields:
- name: String (required, trim, maxlength: 100)
- description: String (maxlength: 500)
- owner: ObjectId (ref: 'User', required) - Project Lead/Admin
- team: [ObjectId (ref: 'User')] - Array of team members assigned
- status: String (enum: ['planning', 'active', 'on-hold', 'completed', 'archived'], default: 'planning')
- startDate: Date
- endDate: Date
- priority: String (enum: ['low', 'medium', 'high'], default: 'medium')
- createdAt: Date (default: Date.now)
- updatedAt: Date

Virtuals:
- taskCount: Count of tasks belonging to this project
- completedTasks: Count of tasks with status 'done' in this project
- progressPercentage: (completedTasks / taskCount) * 100

Pre-remove Hook:
- Delete all tasks associated with this project before removing

Indexes:
- owner: 1
- team: 1
- status: 1

3. TASK MODEL (Task.js):
-------------------------------
Fields:
- title: String (required, trim, maxlength: 200)
- description: String (maxlength: 1000)
- project: ObjectId (ref: 'Project', required)
- assignedTo: ObjectId (ref: 'User', required) - Team member responsible
- assignedBy: ObjectId (ref: 'User', required) - Who assigned the task
- status: String (enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo')
- priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium')
- dueDate: Date (required)
- completedAt: Date (set when status becomes 'done')
- attachments: [String] (array of URLs)
- comments: [{
  user: ObjectId (ref: 'User'),
  text: String,
  createdAt: Date (default: Date.now)
}]
- createdAt: Date (default: Date.now)
- updatedAt: Date

Pre-save Hook:
- If status is changing to 'done', set completedAt to current date

Indexes:
- project: 1
- assignedTo: 1
- status: 1
- dueDate: 1
- priority: 1
- compound index: { project: 1, assignedTo: 1 }

================================================================================
API ENDPOINTS (Routes):
================================================================================

AUTH ROUTES (authRoutes.js) - Base: /api/auth
------------------------------------------------
POST   /register          - Register a new user
POST   /login             - Login user, return JWT token
GET    /me                - Get current user profile (protected)
PUT    /update-profile    - Update user profile (protected)
POST   /logout            - Logout (client-side token removal)

PROJECT ROUTES (projectRoutes.js) - Base: /api/projects
------------------------------------------------
GET    /                  - Get all projects (admin: all, user: their projects only)
POST   /                  - Create a new project (admin only)
GET    /:id               - Get a specific project by ID (check access)
PUT    /:id               - Update a project (admin/owner only)
DELETE /:id               - Delete a project (admin/owner only, soft delete)
GET    /:id/tasks         - Get all tasks in a specific project
POST   /:id/add-team      - Add team members to project (admin/owner only)
DELETE /:id/team/:userId  - Remove team member from project (admin/owner only)
GET    /:id/stats         - Get project statistics (tasks, progress, etc.)

TASK ROUTES (taskRoutes.js) - Base: /api/tasks
------------------------------------------------
GET    /                  - Get all tasks (filtered by query params: project, assignedTo, status, priority, dueDate)
POST   /                  - Create a new task (admin only)
GET    /:id               - Get a specific task by ID (check access)
PUT    /:id               - Update a task (admin/assigned user can update status)
DELETE /:id               - Delete a task (admin only)
PUT    /:id/status        - Update task status (assigned user or admin)
GET    /my-tasks          - Get tasks assigned to logged-in user
GET    /overdue           - Get overdue tasks for logged-in user
POST   /:id/comment       - Add a comment to a task (assigned user or admin)
DELETE /:id/comment/:commentId - Delete a comment (owner/admin)

================================================================================
MIDDLEWARE SPECIFICATIONS:
================================================================================

1. AUTH MIDDLEWARE (middleware/auth.js):
-----------------------------------------
Function: protect
- Extract token from Authorization header (Bearer <token>)
- If no token, return 401 Unauthorized
- Verify token using JWT_SECRET
- Attach user object (without password) to req.user
- If token invalid, return 401 Unauthorized

Function: restrictTo(...roles)
- Check if req.user.role is in allowed roles
- If not, return 403 Forbidden

2. ERROR HANDLER (middleware/errorHandler.js):
----------------------------------------------
Global error handler with:
- Mongoose validation errors → 400 Bad Request
- Mongoose duplicate key errors → 400 Bad Request
- Mongoose CastError (invalid ObjectId) → 404 Not Found
- JWT errors → 401 Unauthorized
- Custom errors → appropriate status codes
- Send error response with: { success: false, message, stack (only in development) }

3. VALIDATION MIDDLEWARE (middleware/validation.js):
-----------------------------------------------------
Functions:
- validateRegister: Check name, email, password
- validateLogin: Check email, password
- validateProject: Check name, description, team array
- validateTask: Check title, project, assignedTo, dueDate
- validateObjectId: Check if ID is valid MongoDB ObjectId

================================================================================
CONTROLLER SPECIFICATIONS:
================================================================================

AUTH CONTROLLER (authController.js):
------------------------------------
register:
  - Validate input
  - Check if user already exists (email)
  - Hash password (handled in pre-save)
  - Create user
  - Generate JWT
  - Return { success: true, token, user: { id, name, email, role } }

login:
  - Validate input
  - Find user by email
  - If user not found, return 401
  - Compare password using matchPassword method
  - If password incorrect, return 401
  - Generate JWT
  - Return { success: true, token, user: { id, name, email, role } }

getMe:
  - Return logged-in user data (protected route)

updateProfile:
  - Update name, avatar (not email or password)
  - Return updated user

PROJECT CONTROLLER (projectController.js):
------------------------------------------
getAllProjects:
  - If admin: return all projects (populate owner, team)
  - If user: return projects where user is owner or in team
  - Filter by status if query param provided
  - Return { success: true, count, data: projects }

createProject:
  - Admin only
  - Validate input
  - Create project with owner = req.user.id
  - Return { success: true, data: project }

getProject:
  - Check if project exists
  - Check if user has access (owner or in team or admin)
  - Populate owner, team, taskCount virtual
  - Return { success: true, data: project }

updateProject:
  - Check if user is owner or admin
  - Update fields
  - Return { success: true, data: updatedProject }

deleteProject:
  - Check if user is owner or admin
  - Delete all associated tasks (pre-remove hook)
  - Delete project
  - Return { success: true, message: 'Project deleted' }

addTeamMember:
  - Check if user is owner or admin
  - Check if user being added exists
  - Add to team array (avoid duplicates)
  - Return { success: true, data: project }

getProjectStats:
  - Get task count, completed, in-progress, todo counts
  - Calculate progress percentage
  - Return { success: true, stats: { total, completed, inProgress, todo, overdue, progress } }

TASK CONTROLLER (taskController.js):
------------------------------------
getAllTasks:
  - Build filter query based on query params: project, assignedTo, status, priority, dueDate
  - If user not admin, filter only tasks assigned to them or their projects
  - Populate project, assignedTo, assignedBy
  - Sort by dueDate or createdAt
  - Return { success: true, count, data: tasks }

createTask:
  - Admin only or project owner
  - Validate input
  - Check if assignedTo exists
  - Check if project exists and assignedTo is in project team
  - Create task with assignedBy = req.user.id
  - Return { success: true, data: task }

getTask:
  - Check if task exists
  - Check if user has access
  - Populate all references
  - Return { success: true, data: task }

updateTask:
  - Check if user is admin or task assignee (can update status only)
  - If admin: can update all fields
  - If assignee: can update status only
  - Return { success: true, data: updatedTask }

deleteTask:
  - Admin only
  - Delete task
  - Return { success: true, message: 'Task deleted' }

updateTaskStatus:
  - Check if user is admin or assignedTo
  - Update status
  - If status becomes 'done', set completedAt
  - Return { success: true, data: updatedTask }

getMyTasks:
  - Get all tasks where assignedTo = req.user.id
  - Filter by status if provided
  - Return { success: true, count, data: tasks }

getOverdueTasks:
  - Get tasks assigned to user where dueDate < today and status != 'done'
  - Return { success: true, count, data: tasks }

addComment:
  - Check if task exists
  - Check if user is assignedTo or admin or project owner
  - Add comment with user = req.user.id
  - Return { success: true, data: task }

deleteComment:
  - Check if comment exists
  - Check if user is comment owner or admin
  - Remove comment
  - Return { success: true, message: 'Comment deleted' }

================================================================================
CONFIGURATION FILES:
================================================================================

1. .env FILE:
--------------
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

2. db.js (config/db.js):
------------------------
Function: connectDB
- Connect to MongoDB using mongoose.connect(MONGODB_URI)
- Use connect options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
- Handle connection events (connected, error, disconnected)
- For production (Vercel): implement connection caching pattern

3. auth.js (config/auth.js):
----------------------------
Export JWT_SECRET from environment variables
Export JWT_EXPIRE from environment variables

4. server.js:
-------------
- Load environment variables (dotenv.config())
- Connect to database
- Create Express app
- Apply middleware: cors, express.json, express.urlencoded, morgan (optional)
- Mount routes: /api/auth, /api/projects, /api/tasks
- Apply global error handler
- Export app for Vercel (module.exports = app) - NO app.listen() if deploying to Vercel
- If running locally: app.listen(PORT)

5. vercel.json:
---------------
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}

================================================================================
UTILITY FUNCTIONS:
================================================================================

1. apiResponse.js (utils/apiResponse.js):
-----------------------------------------
- sendSuccess(res, status, data, message)
- sendError(res, status, message, errors)

2. constants.js (utils/constants.js):
-------------------------------------
- TASK_STATUS: { TODO: 'todo', IN_PROGRESS: 'in-progress', REVIEW: 'review', DONE: 'done' }
- TASK_PRIORITY: { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', URGENT: 'urgent' }
- PROJECT_STATUS: { PLANNING: 'planning', ACTIVE: 'active', ON_HOLD: 'on-hold', COMPLETED: 'completed', ARCHIVED: 'archived' }
- USER_ROLES: { ADMIN: 'admin', USER: 'user' }

================================================================================
ADDITIONAL REQUIREMENTS:
================================================================================

1. Input Validation:
   - Use express-validator or Joi for request validation
   - Sanitize inputs (trim, escape)
   - Return meaningful validation errors

2. Security:
   - Rate limiting (express-rate-limit) - 100 requests per 15 minutes
   - Helmet.js for security headers
   - XSS protection (xss-clean)
   - Prevent parameter pollution (hpp)

3. Logging:
   - Use morgan for HTTP request logging in development
   - Log errors in production

4. Error Handling:
   - All errors must be caught and handled gracefully
   - Never expose database errors to client in production
   - Use custom error classes (AppError)

5. API Documentation:
   - Add comments above each endpoint explaining what it does
   - Include request/response examples

6. Response Format:
   - All responses must follow: { success: boolean, message: string, data: any, ... }
   - Pagination for GET endpoints returning lists: { page, limit, totalPages, totalCount }

================================================================================
SAMPLE REQUEST/RESPONSE:
================================================================================

REGISTER:
POST /api/auth/register
Request: { "name": "John Doe", "email": "john@example.com", "password": "password123" }
Response: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}

LOGIN:
POST /api/auth/login
Request: { "email": "john@example.com", "password": "password123" }
Response: Same as register

CREATE PROJECT:
POST /api/projects
Request: { 
  "name": "Q3 Marketing Campaign",
  "description": "Launch strategy for Q3 product rollout",
  "team": ["65f8a1b2c3d4e5f6a7b8c9d0", "65f8a1b2c3d4e5f6a7b8c9d1"],
  "priority": "high",
  "startDate": "2026-09-01",
  "endDate": "2026-12-31"
}
Response: { "success": true, "data": { projectObject } }

CREATE TASK:
POST /api/tasks
Request: {
  "title": "Social Media Calendar",
  "description": "Create content calendar for all social platforms",
  "project": "65f8a1b2c3d4e5f6a7b8c9d2",
  "assignedTo": "65f8a1b2c3d4e5f6a7b8c9d0",
  "priority": "high",
  "dueDate": "2026-11-28"
}
Response: { "success": true, "data": { taskObject } }

================================================================================
DELIVERABLES:
================================================================================

Generate all the above files with:
- Clean, well-commented code
- ES6+ syntax
- Proper error handling
- Security best practices
- Environment-based configuration
- Production-ready structure
- Deployment-ready (Vercel)

Make the code scalable, maintainable, and follow Node.js best practices.