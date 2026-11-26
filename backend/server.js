
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const reviewRoutes = require('./routes/reviews');
const courseRoutes = require('./routes/courses');
const weatherRoutes = require('./routes/weather');
const db = require('./db');
const { requireLogin, requireRole, apiAccess } = require('./auth');


const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');                     // pages in views/*.ejs
app.use(express.json());
app.use(express.urlencoded({ extended: false }));  // HTML form data (login form)
app.use(express.static('public'));                 // style.css (login pages)
app.use(express.static(path.join(__dirname, '..', 'frontend')));   // teammate's demo frontend

// ---------- Sessions (Step 2: login) ----------
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,           // browser JavaScript can't read the cookie
        sameSite: 'lax',          // other websites can't send it with their forms
        maxAge: 30 * 60 * 1000,   // session ends after 30 minutes
    },
}));

// Lets every page use "user" (null if not logged in)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Registers routes
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
});

// ---------- API routes, protected by role (Step 2) ----------
// GET = any logged-in role; changes need user/admin; deletes are admin-only
app.use('/reviews', apiAccess({ GET: ['admin', 'user', 'guest'], POST: ['admin', 'user'], PUT: ['admin', 'user'], DELETE: ['admin'] }), reviewRoutes);
app.use('/courses', apiAccess({ GET: ['admin', 'user', 'guest'], POST: ['admin'], PUT: ['admin'], DELETE: ['admin'] }), courseRoutes);
app.use('/weather', apiAccess({ GET: ['admin', 'user', 'guest'], POST: ['admin'], DELETE: ['admin'] }), weatherRoutes);

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.send('MySQL connection successful!');
    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).json({ error: 'Database connection failed.' });
    }
});

// ---------- Login / logout (Step 2) ----------
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { error: 'Please enter your email and password.' });
    }

    try {
        // "?" = prepared statement, protects against SQL injection
        const [rows] = await db.query('SELECT * FROM STUDENT WHERE email = ?', [email]);
        const student = rows[0];

        // Compare the typed password with the bcrypt hash in the database
        if (!student || !(await bcrypt.compare(password, student.StudentPassword))) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        // New session ID on login (prevents session fixation), then save the user
        req.session.regenerate(() => {
            req.session.user = { id: student.studentID, name: student.displayName, role: student.role };
            res.redirect(student.role === 'admin' ? '/admin' : '/home');
        });
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Database is unavailable. Please try again later.' });
    }
});

// Guest = no account, view-only
app.post('/guest', (req, res) => {
    req.session.regenerate(() => {
        req.session.user = { id: null, name: 'Guest', role: 'guest' };
        res.redirect('/home');
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// ---------- Pages, protected by role (Step 2) ----------
// Everyone who is logged in (admin, user, guest)
app.get('/home', requireLogin, (req, res) => {
    res.render('home');
});

// Users and admins only. Guests get 403.
app.get('/write-review', requireRole('admin', 'user'), (req, res) => {
    res.render('write_review');
});

// Admins only. Users and guests get 403.
app.get('/admin', requireRole('admin'), async (req, res) => {
    const [students] = await db.query('SELECT studentID, email, displayName, role FROM STUDENT');
    res.render('admin', { students });
});

app.listen(PORT, (err) => {
    if (err) {
        // e.g. EADDRINUSE = another copy of the app is already using this port
        console.error('Could not start on port ' + PORT + ': ' + err.message);
        process.exit(1);
    }
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login`);
});
