# Smart Attendance System using CCTV

This repository contains a full-stack smart attendance system that uses CCTV cameras and CNN-based facial recognition to:
- Automate attendance marking
- Estimate students' attention and focus levels
- Provide a foundation for future exam monitoring functionality

## Repository Structure

- `frontend/` – Web UI for students, teachers, and admins (React / Vite)
- `backend/` – REST APIs, WebSocket handlers, and business logic (FastAPI)
- `ml/` – CNN models, training, inference, and experiments
- `data/` – Local datasets and samples
- `docs/` – Documentation, design notes, and reports
- `scripts/` – Development and maintenance helper scripts
- `infra/` – Deployment and environment configuration
- `tests/` – End-to-end and cross-cutting tests

---

## 🛠️ Required Backend API Endpoints (For Backend Developers)

The frontend expects the following REST and WebSocket endpoints to be fully implemented on the backend. The Base URL is assumed to be `http://localhost:8000/api/v1`. All protected endpoints require a Bearer JWT Token in the `Authorization` header.

### 1. Authentication & Profile
- `POST /auth/login` - Authenticates user and returns `{ token, user }`.
- `POST /auth/signup` - Registers a new user.
- `POST /auth/forgot-password` - Requests password reset link.
- `GET /auth/me` - Retrieves the authenticated user's profile.
- `PUT /auth/me` - Updates the user's profile info (name, bio).
- `PUT /auth/me/avatar` - Uploads user avatar (multipart/form-data).

### 2. Student Management & Face Enrollment
- `GET /students` - Lists all enrolled students.
- `POST /students` - Creates a single new student record.
- `POST /students/bulk-import` - Uploads a CSV to bulk import student data.
- `DELETE /students/{id}` - Deletes a student record.
- `POST /students/{id}/enroll` - Uploads webcam capture frames to enroll a specific student's face data.
- `POST /students/bulk-enroll` - Uploads a ZIP file of images to bulk-enroll faces.

### 3. Courses & Past Sessions
- `GET /courses` - Retrieves a list of courses/classes available.
- `GET /sessions` - Retrieves past attendance session histories.

### 4. Live Classroom & Detection (Phase 4)
- `POST /sessions`
  - **Payload:** `{ "course_id": "CS-301" }`
  - **Response:** `{ "id": "db_session_id_here" }`
- `WS /sessions/{id}/detect`
  - **Type:** WebSocket
  - **Incoming Message (from Frontend):** `{ "type": "frame", "image": "base64_string" }`
  - **Outgoing Message (to Frontend):** 
    ```json
    {
      "faces": [
        {
          "studentId": "STU-1001",
          "status": "Present",
          "x": 10, "y": 20, "width": 20, "height": 30
        }
      ]
    }
    ```
- `PUT /attendance/{record_id}`
  - **Payload:** `{ "status": "Present", "override": true }`
- `PUT /sessions/{id}/close`
  - **Payload:** Final session statistics, timings, and attendance snapshot.

### 5. Reporting (Upcoming Phase 5)
- `GET /reports`
  - **Response:** Aggregated attendance statistics for dashboard charts.

---
*The frontend contains a built-in mock fallback for all of these endpoints so UI development can proceed independently. If the API fails to respond, the frontend automatically switches to localized mock simulations.*
