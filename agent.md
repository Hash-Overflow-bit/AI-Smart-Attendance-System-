# Smart Attendance System — Agent Memory File

> **Last Updated:** 2026-06-04
> **Purpose:** This file serves as the permanent project memory and context for any AI agent working on this codebase. Read this file first before making any changes.

---

## Project Summary

- **Project Name:** Smart Attendance System using CCTV
- **Purpose:** A full-stack system that uses CCTV cameras and CNN-based facial recognition to automate student attendance marking, estimate attention/focus levels during lectures, and provide academic intervention tools.
- **Main Objectives:**
  1. Eliminate manual attendance taking via real-time face recognition
  2. Track student behavioral attention (head pose, engagement) during classes
  3. Generate reports for teachers, counselors, and administrators
  4. Provide an academic intervention & alerting system for at-risk students
  5. Support role-based access for Teachers, Counselors, Admins, and Students

---

## System Architecture

### Frontend Technologies
- **Framework:** React 19 (JSX, not TypeScript) via Vite 8
- **Routing:** react-router-dom v7
- **Styling:** TailwindCSS 3.4 (PostCSS + Autoprefixer)
- **Webcam:** react-webcam v7
- **Charts:** Recharts v3
- **Icons:** lucide-react v1.6
- **Notifications:** react-hot-toast v2
- **Build Tool:** Vite 8
- **State Management:** React useState + localStorage (no Redux/Zustand)

### Backend Technologies
- **Framework:** FastAPI (Python 3.12, async)
- **ML Libraries:** MediaPipe (face detection), OpenCV (image processing), NumPy
- **Package Manager:** Poetry (pyproject.toml) + requirements.txt
- **WebSocket Support:** FastAPI WebSocket + websockets library
- **Validation:** Pydantic v2

### Database
- **Current State:** ❌ **NO DATABASE CONFIGURED**
- **Planned:** PostgreSQL (planned in Phase 1 of `docs/development_todo.md` using SQLAlchemy + asyncpg)
- **Current Workaround:** Browser `localStorage` used for all data persistence on frontend

### Authentication
- **Current State:** ❌ **NOT IMPLEMENTED**
- **Planned:** JWT-based authentication with role-based access control (RBAC)
- **Roles Defined:** Admin, Teacher/Instructor, Counselor, Student

### Deployment Architecture
- **Current State:** ❌ **NOT IMPLEMENTED** (scaffolded only)
- **Planned:**
  - Docker containers (3 Dockerfiles: backend, frontend, ml-service)
  - Kubernetes manifests (backend, frontend, ml-service deployments)
  - Nginx reverse proxy
  - CI/CD pipeline (directory exists, no implementation)

---

## Modules

### Module 1: Authentication & User Management (UAM)
- **Description:** Login, logout, password reset, role management, profile pictures, student registration
- **Status:** ❌ Not Started
- **Dependencies:** None (foundational module)
- **Files:** `backend/app/api/v1/auth.py` (empty)
- **User Stories:** UAM-01 through UAM-07 (all pending)

### Module 2: Student Registration — Face Enrollment (FEM)
- **Description:** Student data entry, webcam face capture, face embedding generation, bulk photo upload, quality validation
- **Status:** 🟡 Partially Completed (~55%)
- **Dependencies:** UAM (for auth), Database (for persistence)
- **Files:**
  - Frontend: `frontend/src/pages/dashboard/FaceEnrollment.jsx`, `frontend/src/components/dashboard/StudentRegistrationForm.jsx`, `frontend/src/components/dashboard/WebcamCapture.jsx`
  - Backend: `backend/app/services/ml_service.py` (mock embeddings), `backend/app/api/v1/attendance.py` (enroll endpoint)
- **What Works:** Registration form with validation, webcam capture UI, bulk upload UI with review flow, searchable student gallery
- **What's Missing:** Real face recognition model (FaceNet/ArcFace), actual DB storage, angle-guided capture, real-time quality feedback, re-enrollment audit history

### Module 3: Attendance Processing Module (APM)
- **Description:** Real-time face detection via CCTV, recognition via embeddings, auto-marking Present/Absent, manual overrides
- **Status:** 🟡 Partially Completed (~40%)
- **Dependencies:** FEM (for embeddings), UAM (for auth), Database
- **Files:**
  - Frontend: `frontend/src/pages/dashboard/LiveClassroom.jsx`
  - Backend: `backend/app/api/v1/attendance.py` (WebSocket endpoint), `backend/app/services/ml_service.py`
- **What Works:** Live webcam with canvas bounding box overlay, simulated face detection & recognition, manual override toggles, session start/end with log storage
- **What's Missing:** Real face recognition (currently random), embedding comparison engine, backend DB persistence, proper session management API, unknown face security logging

### Module 4: Attendance Summary (AS)
- **Description:** Filtered attendance views, student attendance percentages, CSV export, trend charts, poor attendance reports
- **Status:** 🟡 Partially Completed (~35%)
- **Dependencies:** APM (for attendance data), Database
- **Files:** `frontend/src/pages/dashboard/ReportsLogs.jsx`, `frontend/src/pages/dashboard/StudentManagement.jsx`
- **What Works:** Session archive viewing, attendance rate display, static trend bar chart, export button UI
- **What's Missing:** Date/subject filtering, actual CSV file generation, dynamic percentages from DB, poor attendance threshold reports (<75%), "Last Seen" timestamps

### Module 5: System Administration (SAM-Admin)
- **Description:** System health monitoring, backup management, RBAC admin panel, audit log viewer
- **Status:** ❌ Not Started
- **Dependencies:** UAM, Database
- **Files:** `frontend/src/pages/dashboard/SystemSettings.jsx` (placeholder)

### Module 6: Behavioural Attention Tracking Model (BTM)
- **Description:** Head pose analysis, real-time attention scores, posture/sleepiness detection, class engagement averages
- **Status:** ❌ Not Started
- **Dependencies:** APM (for session context), ML models, Database
- **Files:** `frontend/src/pages/dashboard/AttentionAnalysis.jsx` (placeholder), `ml/` (empty)

### Module 7: Academic Intervention & Alerting Module (AIM)
- **Description:** Low engagement alerts, student risk lists, custom thresholds, notification management, classroom heatmaps
- **Status:** ❌ Not Started
- **Dependencies:** BTM (for attention data), APM (for attendance data), UAM (for roles), Database

### Module 8: Reporting & Statistical Summary Module (RSM)
- **Description:** Real-time dashboards, engagement summaries, at-risk reports, automated CSV/PDF generation, student portal
- **Status:** 🟡 Partially Completed (~25%)
- **Dependencies:** APM, BTM, AS, AIM, Database
- **Files:** `frontend/src/pages/dashboard/DashboardHome.jsx`, `frontend/src/pages/dashboard/ReportsLogs.jsx`
- **What Works:** Dashboard home with aggregate stats, session archive with anomaly detection
- **What's Missing:** Engagement summaries, at-risk monthly reports, automated file generation, student personal portal, focus heatmaps, periodic email summaries

### Module 9: Announcements / System Management
- **Description:** Course CRUD, database backups, CI/CD pipeline management, SIS data import
- **Status:** ❌ Not Started (Course CRUD exists in CourseDashboard but is frontend-only)
- **Dependencies:** UAM, Database
- **Files:** `course-dashboard/` (empty), `frontend/src/pages/dashboard/CourseDashboard.jsx` (frontend-only CRUD)

---

## Completed Features

### Frontend (UI Layer — No Backend Integration)
1. **Landing Page** — Full marketing page with hero, features, how-it-works, stakeholders, CTA sections
2. **Dashboard Layout** — Sidebar navigation + Topbar with all routes configured
3. **Dashboard Home** — Stats cards (students, courses, attendance), recent sessions, system integrity, weekly growth card
4. **Face Enrollment Page** — Two-tab interface (Webcam Capture / Bulk Upload), student registration form with validation, webcam capture with toast pipeline, bulk upload with review flow, full student registry datatable with search
5. **Student Management Page** — Add student modal with validation, CSV bulk upload parser with error reporting, student registry table with attendance calculation, delete functionality
6. **Course Dashboard** — Course CRUD (Add/Edit/Delete), grid & list views, course detail slide-out panel, low attendance warning alerts, search & filter
7. **Live Classroom** — Webcam feed with canvas overlay, simulated face detection with bounding boxes, real-time stats (Present/Unknown), session roster with manual override toggles, session end with log persistence
8. **Reports & Logs** — Session archive datatable, attendance rate visualization, anomaly detection, session detail overlay, export button UI, trend bar chart
9. **UI Component Library** — Badge, Button, Card, Input, Select, PageHeader, SectionHeading, Tabs

### Backend (Minimal)
1. **FastAPI app** — Basic CORS-enabled FastAPI server with root endpoint
2. **Attendance Router** — `POST /api/v1/attendance/enroll` and `WS /api/v1/attendance/ws/detect`
3. **ML Service** — Face detection via MediaPipe, blur detection via Laplacian, mock embedding generation, frame processing with bounding box coordinates

---

## Pending Features

### Critical (Must-Have Before Any Deployment)
1. **Database setup** — PostgreSQL or MongoDB with ORM (SQLAlchemy/Beanie)
2. **Authentication system** — JWT login/logout, password hashing, session management
3. **RBAC middleware** — Role-based route protection
4. **Real face recognition model** — FaceNet/ArcFace/MobileFaceNet integration
5. **Frontend-Backend integration** — Connect all frontend pages to backend APIs
6. **Backend API completion** — ~20+ endpoints needed for all modules
7. **Pydantic schemas** — Request/response validation models

### High Priority
8. **Embedding storage & comparison** — Cosine similarity/Euclidean distance matching
9. **Session management** — Create, close, roster management via API
10. **Attendance persistence** — DB-backed attendance records
11. **CSV/PDF export** — Real file generation and download
12. **Unknown face security logging** — DB-backed audit trail

### Medium Priority
13. **Head pose estimation model** — For attention tracking (BTM)
14. **Attention scoring system** — 0-100% scale with visual indicators
15. **Alert system** — Configurable thresholds, notification channels
16. **Student personal portal** — Individual attendance/attention view
17. **System health dashboard** — CPU, RAM, storage monitoring
18. **Classroom heatmap** — Spatial engagement visualization

### Low Priority
19. **CI/CD pipeline** — Docker builds, automated deployments
20. **Periodic email summaries** — Scheduled reports via email
21. **Database backup/restore** — Admin-initiated backup system
22. **SIS data import** — CSV/database import from external systems
23. **Instructor bio management** — Profile page features

---

## API Endpoints

### Implemented
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/` | Root health check | ✅ Working |
| POST | `/api/v1/attendance/enroll` | Enroll student with face images | ✅ Working (mock embeddings) |
| WS | `/api/v1/attendance/ws/detect` | Real-time frame processing | ✅ Working (mock detection) |

### Planned (Not Implemented)
| Method | Endpoint | Module |
|--------|----------|--------|
| POST | `/api/v1/auth/login` | UAM |
| POST | `/api/v1/auth/logout` | UAM |
| POST | `/api/v1/auth/register` | UAM |
| POST | `/api/v1/auth/reset-password` | UAM |
| GET | `/api/v1/users/me` | UAM |
| PUT | `/api/v1/users/me` | UAM |
| PUT | `/api/v1/users/me/avatar` | UAM |
| GET | `/api/v1/users` | UAM (admin) |
| PUT | `/api/v1/users/{id}/role` | UAM (admin) |
| GET | `/api/v1/students` | FEM |
| GET | `/api/v1/students/{id}` | FEM |
| POST | `/api/v1/students` | FEM |
| PUT | `/api/v1/students/{id}` | FEM |
| DELETE | `/api/v1/students/{id}` | FEM |
| POST | `/api/v1/students/bulk-import` | FEM |
| POST | `/api/v1/sessions` | APM |
| PUT | `/api/v1/sessions/{id}/close` | APM |
| GET | `/api/v1/sessions` | APM |
| GET | `/api/v1/sessions/{id}` | APM |
| PUT | `/api/v1/attendance/{id}` | APM (manual override) |
| GET | `/api/v1/reports/attendance` | AS/RSM |
| GET | `/api/v1/reports/at-risk` | AS/RSM |
| GET | `/api/v1/reports/export` | AS/RSM |
| GET | `/api/v1/courses` | SAM |
| POST | `/api/v1/courses` | SAM |
| PUT | `/api/v1/courses/{id}` | SAM |
| DELETE | `/api/v1/courses/{id}` | SAM |
| GET | `/api/v1/attention/scores` | BTM |
| GET | `/api/v1/alerts` | AIM |
| POST | `/api/v1/alerts/thresholds` | AIM |
| GET | `/api/v1/system/health` | SAM-Admin |
| POST | `/api/v1/system/backup` | SAM-Admin |

---

## Database Collections/Tables

### Planned Schema (Not Yet Implemented)

#### Users
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/PK | Unique identifier |
| email | String (unique) | Login email |
| password_hash | String | Bcrypt hashed password |
| name | String | Full name |
| role | Enum | Admin, Teacher, Counselor, Student |
| avatar_url | String (nullable) | Profile picture path |
| bio | Text (nullable) | Instructor biography |
| created_at | Timestamp | Account creation date |

#### Students
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/PK | Unique identifier |
| student_id | String (unique) | Institution student ID (e.g. STU-1001) |
| name | String | Full name |
| roll_no | String (unique) | Roll number (e.g. CS-21-140) |
| email | String | Student email |
| department | String | Department name |
| course_id | FK → Courses | Assigned course |
| embedding | Vector(128/512) | Face embedding vector |
| embedding_status | Enum | Pending, Active, Failed |
| enrollment_date | Timestamp | When enrolled |
| user_id | FK → Users (nullable) | Linked user account |

#### Courses
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/PK | Unique identifier |
| code | String (unique) | Course code (e.g. CS-402) |
| name | String | Course name |
| instructor_id | FK → Users | Assigned instructor |
| slots | JSON/Array | Time slots |
| created_at | Timestamp | Creation date |

#### Sessions
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/PK | Unique identifier |
| session_id | String (unique) | Display session ID |
| course_id | FK → Courses | Associated course |
| start_time | Timestamp | Session start |
| end_time | Timestamp (nullable) | Session end |
| status | Enum | Active, Completed |

#### AttendanceRecords
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/PK | Unique identifier |
| session_id | FK → Sessions | Associated session |
| student_id | FK → Students | Student being tracked |
| status | Enum | Present, Absent |
| first_seen | Timestamp (nullable) | First recognition time |
| marked_by | Enum | System, Manual |
| modified_by | FK → Users (nullable) | Manual override user |
| modified_at | Timestamp (nullable) | Override timestamp |

#### AttentionLogs
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/PK | Unique identifier |
| session_id | FK → Sessions | Associated session |
| student_id | FK → Students | Student being tracked |
| score | Float (0-100) | Attention score |
| head_pose | JSON | Yaw, pitch, roll values |
| timestamp | Timestamp | Measurement time |

#### Alerts
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/PK | Unique identifier |
| student_id | FK → Students | Flagged student |
| alert_type | Enum | LowEngagement, LowAttendance, Unknown |
| severity | Enum | Info, Warning, Critical |
| message | Text | Alert description |
| resolved | Boolean | Whether addressed |
| created_at | Timestamp | Alert creation time |

#### AuditLog
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/PK | Unique identifier |
| user_id | FK → Users | Who performed the action |
| action | String | Action description |
| entity_type | String | Table/entity affected |
| entity_id | String | ID of affected record |
| old_value | JSON | Previous state |
| new_value | JSON | New state |
| timestamp | Timestamp | When it occurred |

### Relationships
- Users → Students (1:1 optional, for student accounts)
- Users → Courses (1:M, instructor teaches many courses)
- Courses → Sessions (1:M)
- Sessions → AttendanceRecords (1:M)
- Students → AttendanceRecords (1:M)
- Sessions → AttentionLogs (1:M)
- Students → AttentionLogs (1:M)
- Students → Alerts (1:M)

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access: user management, RBAC, course CRUD, system settings, backups, all reports, SIS import |
| **Teacher/Instructor** | Start/end attendance sessions, view class reports, manual overrides, set attention thresholds, view engagement summaries |
| **Counselor** | View at-risk reports, access attention/attendance correlation, view disengagement patterns, schedule intervention meetings |
| **Student** | View personal attendance percentage, view personal attention score, view course enrollment |

---

## End-to-End Flows

### Authentication Flow (NOT IMPLEMENTED)
```
1. User navigates to /login
2. Enters email + password
3. Backend validates credentials, returns JWT token
4. Token stored in httpOnly cookie or localStorage
5. All subsequent API calls include Authorization header
6. Protected routes check token validity via middleware
7. Roles checked against route permissions
8. Logout destroys session/token
```

### Attendance Flow (PARTIALLY IMPLEMENTED — Frontend Only)
```
1. Teacher navigates to /dashboard/live
2. Selects course (currently hardcoded CS-301)
3. Webcam activates, frames captured at 5 FPS
4. [MISSING] Frames sent to backend WebSocket /ws/detect
5. [SIMULATED] ML service detects faces, generates bounding boxes
6. [SIMULATED] Detected faces matched against stored embeddings
7. Recognized students auto-marked "Present" in roster
8. Unknown faces labeled with red bounding box + alert
9. Teacher can manually toggle any student's status
10. Teacher clicks "End Session"
11. System marks all remaining students as "Absent"
12. Session log saved to localStorage (should be DB)
```

### Reporting Flow (PARTIALLY IMPLEMENTED — Frontend Only)
```
1. Teacher/Admin navigates to /dashboard/reports
2. System loads session logs from localStorage
3. [MISSING] Real DB queries for filtering by date/course
4. Session archive displayed with attendance rates
5. Click on session opens detail overlay with full roster
6. [MISSING] Real CSV/PDF export (currently toast mock)
7. [MISSING] Automated daily/weekly report generation
8. [MISSING] Email delivery of periodic summaries
```

### Notification/Alerting Flow (NOT IMPLEMENTED)
```
1. BTM calculates attention score per student per frame
2. Score aggregated over time window (e.g., 5 minutes)
3. If score < threshold for > 5 minutes, trigger alert
4. Alert logged in centralized Alerts table
5. Dashboard pop-up notification to instructor
6. [OPTIONAL] Email notification based on admin config
7. Weekly risk list auto-generated for counselors
```

### Admin Management Flow (NOT IMPLEMENTED)
```
1. Admin logs in with admin role
2. Access /dashboard/settings
3. Manage users: create, edit roles, revoke access
4. Manage courses: CRUD operations linked to faculty
5. Import student roster from SIS (CSV/DB)
6. View system health telemetry
7. Initiate database backups
8. Configure notification preferences
9. View audit logs of all manual changes
```

---

## Known Issues

1. **No database** — All persistence uses browser localStorage, which is ephemeral and per-device
2. **No authentication** — All dashboard routes are publicly accessible without any login
3. **Mock ML** — Face recognition generates random student IDs instead of real embedding comparison
4. **Frontend-backend disconnect** — The React frontend does NOT call the FastAPI backend; all logic is client-side
5. **Hardcoded data** — Course information, session metadata, and some student data are hardcoded
6. **CORS wildcard** — Backend allows all origins (`*`), unacceptable for production
7. **No error boundaries** — React app has no error boundary components
8. **No responsive testing** — UI is built for desktop; mobile responsiveness is unverified
9. **Partially empty documentation** — Core docs `docs/project_overview.md` and `docs/system_architecture.md` are empty files, but `docs/requirements_specification.md` has been fully populated with the 55 user stories.
10. **Duplicate README content** — `README.md` has duplicated content
11. **Missing environment config** — `backend/app/config.py` is empty; no `.env` management
12. **No test coverage** — Test directories exist but contain zero test files
13. **localStorage data loss risk** — Clearing browser data wipes all "enrolled" students and session history
14. **Lack of a master plan** — Solved: Created comprehensive `docs/development_todo.md` with 10 detailed implementation phases and `docs/project_audit_report.md` documenting code status.

---

## Development Roadmap

The development of the Smart Attendance System is organized into **10 major phases** detailed in [development_todo.md](file:///c:/Users/Hashir%20Mehboob/Desktop/smart-attendance-system/docs/development_todo.md). The phases are:

1. **Phase 1: Database & Config (Foundation)** — PostgreSQL, SQLAlchemy, asyncpg, Alembic migrations, database models, and global settings/dependencies.
2. **Phase 2: Authentication & Authorization** — JWT-based authentication, passwords hashing with bcrypt, role-based access control (RBAC) middleware, and login/signup/reset pages.
3. **Phase 3: Face Enrollment (Backend + ML)** — Integration of a real FaceNet/ArcFace model, generating 512-d embeddings, database storage, quality validation feedback UI, and re-enrollment history.
4. **Phase 4: Attendance Processing System** — WebSocket connection for real-time video stream, face matching against stored database embeddings, labeling unrecognized faces, and manual roster status overrides.
5. **Phase 5: Reporting, Summary & Export** — Cumulative attendance metrics, at-risk alerts (<75% attendance threshold), trend charts, and real CSV/PDF file exports.
6. **Phase 6: Behavioural Attention Tracking (BTM)** — MediaPipe Face Mesh head pose estimation (yaw, pitch, roll), body posture/sleepiness detection, and classroom focus visualization charts.
7. **Phase 7: Academic Intervention & Alerting (AIM)** — Real-time low-attention alerts, counselor risk lists, custom course thresholds, heatmaps, and notification channels setup.
8. **Phase 8: System Administration & Course Management** — Course CRUD endpoints, system health dashboard (CPU, RAM, Disk), automated backups/restore, SIS roster imports, and audit logging.
9. **Phase 9: Student Personal Portal** — Dedicated personal dashboard route for students to monitor their own attendance and attention progress securely.
10. **Phase 10: Testing, CI/CD & Deployment** — Comprehensive test suites (pytest + Vitest), Dockerfiles/docker-compose environments, CI/CD pipeline, and security optimizations.

---

## Agent Instructions

### Project-Specific Rules
1. **Never delete localStorage integration** — It serves as the mock DB layer until a real database is connected. Keep it working as a fallback.
2. **Maintain the existing folder structure** — Follow the conventions in the root `non-negociable-cursor-reqs.md` file.
3. **Backend is FastAPI** — Always use async endpoints, Pydantic models for request/response validation, and the existing router pattern.
4. **Frontend is React + Vite** — Use JSX (not TSX). The project uses TailwindCSS extensively; follow the existing design language.
5. **ML module lives in `ml/`** — Keep model code, training scripts, and inference utilities separate from the backend.

### Architecture Decisions
- The backend follows a layered architecture: `api/` → `services/` → `models/` with `schemas/` for validation
- The frontend follows a page-based structure under `src/pages/` with shared components in `src/components/`
- All API routes are versioned under `/api/v1/`
- WebSocket is the preferred transport for real-time video processing

### Coding Standards
- **Python:** PEP 8, async/await for all I/O, type hints on all function signatures
- **JavaScript/React:** Functional components only, hooks for state, destructured props
- **Naming:** camelCase for JS, snake_case for Python, PascalCase for React components
- **Files:** One component per file, kebab-case for filenames (Python uses snake_case)

### Folder Structure
```
smart-attendance-system/
├── backend/
│   └── app/
│       ├── api/v1/          # API route handlers
│       ├── models/          # ORM/database models
│       ├── schemas/         # Pydantic request/response models
│       ├── services/        # Business logic & ML integration
│       ├── middleware/      # Auth, CORS, logging middleware
│       ├── integrations/    # External service integrations
│       ├── utils/           # Shared utilities
│       ├── config.py        # Environment configuration
│       └── main.py          # FastAPI app entry point
├── frontend/
│   └── src/
│       ├── pages/           # Route-level page components
│       │   ├── dashboard/   # All dashboard pages
│       │   └── landing/     # Public landing page
│       ├── components/      # Reusable UI components
│       │   ├── dashboard/   # Dashboard-specific components
│       │   ├── landing/     # Landing page sections
│       │   ├── layout/      # Layout components (sidebar, topbar)
│       │   └── ui/          # Generic UI primitives
│       └── hooks/           # Custom React hooks
├── ml/                      # ML models, training, inference
├── infra/                   # Docker, K8s, CI/CD config
├── scripts/                 # Dev/maintenance scripts
├── tests/                   # Cross-cutting tests
└── docs/                    # Documentation & design artifacts
```

### Key localStorage Keys (Current Mock DB)
- `smart_attendance_enrolled_students` — Array of student objects
- `smart_attendance_courses` — Array of course objects
- `smart_attendance_session_logs` — Array of completed session logs

### Implementation Notes
- The `ml_service.py` generates **mock 128-d embeddings** using `np.random.rand(128)`. Replace with real model inference.
- The LiveClassroom uses `setInterval` at 1500ms to simulate face detection. Replace with actual WebSocket frame processing.
- All "Export" buttons currently show toast notifications. Replace with real file generation.
- The `CourseDashboard.jsx` has full CRUD but only in localStorage. Connect to backend API.
- The `StudentManagement.jsx` calculates attendance from session logs in localStorage. Must be moved to backend.
