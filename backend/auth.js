// auth.js - checks who is allowed to open a page or use an API route

// Must be logged in (any role, including guest)
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Must be logged in AND have one of the listed roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).send('<h1>403 - Access denied</h1><p>Your role cannot view this page.</p><a href="/home">Back to home</a>');
    }
    next();
  };
}

// For the JSON API: which roles may use each HTTP method.
// Example: apiAccess({ GET: ['admin','user','guest'], DELETE: ['admin'] })
// Not logged in -> 401, wrong role -> 403 (JSON, not a page)
function apiAccess(rules) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Please log in first.' });
    }
    const allowed = rules[req.method] || [];
    if (!allowed.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Your role (' + req.session.user.role + ') cannot do this.' });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole, apiAccess };
