-- =========================================================
-- Adds the 8 Phase II students (only needed if STUDENT is empty).
-- Run this AFTER phase3_auth.sql. Passwords are already hashed:
--   101000001 dhiya  -> Pass#1001 (admin)
--   101000002..8     -> Pass#1002 ... Pass#1008 (user)
-- =========================================================
USE course_review;

INSERT INTO STUDENT (studentID, email, displayName, StudentPassword, programOfStudy, StudentYear, role) VALUES
(101000001, 'dhiya.sathish@ontariotechu.net', 'dhiyasat', '$2b$10$cAjQ6wAwwxMmctGa9LHMf.rvSuxHvwrNiyPNYVVBd3HAIi5Wc0A2m', 'Software Engineering', '3', 'admin'),
(101000002, 'purva.patel@ontariotechu.net', 'purvapat', '$2b$10$uMlQ9N9DIqKHKCk6fKfiwOR2Q0txKSlnCrRJDjTb.gxlDyfVl0S7G', 'Software Engineering', '3', 'user'),
(101000003, 'shreya.kamalakannan@ontariotechu.net', 'shreyakam', '$2b$10$6u.Nys8mUGM.DLfwWBRyX.xCTG9pWO6lRXgNqyJz9iThKBBinqroa', 'Software Engineering', '3', 'user'),
(101000004, 'madeline.mcgowan@ontariotechu.net', 'madelinemcg', '$2b$10$m.cx8wABok8ZZYQcSo3BKuvm8E1P//lvKJNovCfHJE01OqvGKoRAq', 'Software Engineering', '3', 'user'),
(101000005, 'john.smith@ontariotechu.net', 'johnsmi', '$2b$10$0dtXwbHtfeDimboS9rVHYeApd8zT80uxADHi9oDd2wyF79mW2l7/6', 'Software Engineering', '4', 'user'),
(101000006, 'adam.stevens@ontariotechu.net', 'adamste', '$2b$10$HKHFXaRnlk1idP7FU/wtaOQJHVnQw3gg03.4LzMb7Lw8cyZP5pCC.', 'Software Engineering', '3', 'user'),
(101000007, 'seonghwa.park@ontariotechu.net', 'seonghwapar', '$2b$10$Hinvzptod0EuTkDSG31R/e4Rxs0kUuSimrbOPqNXIUyJNg0tLIqUO', 'Software Engineering', '3', 'user'),
(101000008, 'daniel.padilla@ontariotechu.net', 'danielpad', '$2b$10$orT9/dcV1DvJkt.1ykv7eO3Vou.fCPnmUJZCdenklD3KP0HhGIvMC', 'Software Engineering', '2', 'user');

SELECT studentID, email, role FROM STUDENT;
