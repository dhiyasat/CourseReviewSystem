-- =========================================================
-- Phase III - Login and roles
-- Run ONCE, after your Phase II script (course_review database).
-- =========================================================
USE course_review;

-- 1. Make the password column long enough for a bcrypt hash (60 chars)
ALTER TABLE STUDENT MODIFY StudentPassword VARCHAR(255);

-- 2. Add the 3 roles. Everyone starts as a normal 'user'.
ALTER TABLE STUDENT ADD role ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user';

-- 3. Replace the plain-text passwords with bcrypt hashes.
--    The passwords themselves stay the same (Pass#1001 ... Pass#1008).
UPDATE STUDENT SET StudentPassword = '$2b$10$cAjQ6wAwwxMmctGa9LHMf.rvSuxHvwrNiyPNYVVBd3HAIi5Wc0A2m' WHERE studentID = 101000001;  -- Pass#1001
UPDATE STUDENT SET StudentPassword = '$2b$10$uMlQ9N9DIqKHKCk6fKfiwOR2Q0txKSlnCrRJDjTb.gxlDyfVl0S7G' WHERE studentID = 101000002;  -- Pass#1002
UPDATE STUDENT SET StudentPassword = '$2b$10$6u.Nys8mUGM.DLfwWBRyX.xCTG9pWO6lRXgNqyJz9iThKBBinqroa' WHERE studentID = 101000003;  -- Pass#1003
UPDATE STUDENT SET StudentPassword = '$2b$10$m.cx8wABok8ZZYQcSo3BKuvm8E1P//lvKJNovCfHJE01OqvGKoRAq' WHERE studentID = 101000004;  -- Pass#1004
UPDATE STUDENT SET StudentPassword = '$2b$10$0dtXwbHtfeDimboS9rVHYeApd8zT80uxADHi9oDd2wyF79mW2l7/6' WHERE studentID = 101000005;  -- Pass#1005
UPDATE STUDENT SET StudentPassword = '$2b$10$HKHFXaRnlk1idP7FU/wtaOQJHVnQw3gg03.4LzMb7Lw8cyZP5pCC.' WHERE studentID = 101000006;  -- Pass#1006
UPDATE STUDENT SET StudentPassword = '$2b$10$Hinvzptod0EuTkDSG31R/e4Rxs0kUuSimrbOPqNXIUyJNg0tLIqUO' WHERE studentID = 101000007;  -- Pass#1007
UPDATE STUDENT SET StudentPassword = '$2b$10$orT9/dcV1DvJkt.1ykv7eO3Vou.fCPnmUJZCdenklD3KP0HhGIvMC' WHERE studentID = 101000008;  -- Pass#1008

-- 4. Make one account the admin (change the ID if you want someone else)
UPDATE STUDENT SET role = 'admin' WHERE studentID = 101000001;

-- Check
SELECT studentID, email, displayName, role FROM STUDENT;
