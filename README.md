# CourseReviewSystem

Course Rating System for SOFE 3700U. Node.js (Express) + MySQL.

## Setup (Windows or Linux)

1. **Database** (run each script once, in this order, in MySQL Workbench / VS Code SQLTools):
   1. `database/course_review.sql` (Phase II tables and sample data)
   2. `database/phase3_auth.sql` (adds the `role` column and hashes the student passwords)
   3. `database/add_students.sql` (only if the `STUDENT` table is empty)
2. **Backend**
   ```
   cd backend
   npm install
   copy .env.example .env        (Linux/Mac: cp .env.example .env)
   ```
   Edit `backend/.env` with your own MySQL port and password.
3. **Run:** `npm start` (inside `backend`), then open http://localhost:3000/login
4. **Test login and roles (optional):** with the app running, open a second terminal in `backend` and run `npm test`.

## Login and roles

| Role | How to log in | Can do |
|---|---|---|
| admin | `dhiya.sathish@ontariotechu.net` / `Pass#1001` | Everything, including the Admin page and deleting |
| user | any other Phase II student, e.g. `purva.patel@ontariotechu.net` / `Pass#1002` | View, add and edit reviews |
| guest | "Continue as guest" button | View only |

- Passwords are stored as bcrypt hashes. To change one: `node set-password.js <email> <new password>` (inside `backend`).
- To change someone's role: `UPDATE STUDENT SET role = 'admin' WHERE studentID = ...;`

### Protecting routes
```js
const { requireLogin, requireRole, apiAccess } = require('./auth');

app.get('/some-page', requireLogin, ...);             // any logged-in role
app.get('/other-page', requireRole('admin', 'user'), ...); // no guests
app.get('/admin-page', requireRole('admin'), ...);     // admins only
```
The API routes (`/reviews`, `/courses`, `/weather`) are protected in `server.js` with `apiAccess`:
GET is open to every logged-in role, adding/editing needs user or admin, deleting needs admin.
Not logged in returns `401`, wrong role returns `403` (JSON).

**Testing the API in Postman:** log in first by sending `POST http://localhost:3000/login`
(Body → x-www-form-urlencoded → `email`, `password`). Postman keeps the session cookie for later requests.

The logged-in student's ID is available as `req.session.user.id`.
