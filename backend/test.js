// test.js - checks login, logout and roles automatically.
// 1. Start the app in one terminal:   npm start
// 2. In a second terminal run:        npm test

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;

// A "browser" that remembers its own session cookie
function newBrowser() {
  let cookie = '';
  return async function request(method, path, form) {
    const res = await fetch(BASE + path, {
      method,
      redirect: 'manual', // so we can see where it redirects to
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form ? new URLSearchParams(form).toString() : undefined,
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    return { status: res.status, location: res.headers.get('location'), body: await res.text() };
  };
}

function check(name, ok) {
  if (ok) { passed++; console.log('  ✓ ' + name); }
  else    { failed++; console.log('  ✗ ' + name); }
}

async function run() {
  let r;

  console.log('\nNot logged in');
  let b = newBrowser();
  r = await b('GET', '/home');
  check('Home sends you to /login', r.status === 302 && r.location === '/login');
  r = await b('GET', '/admin');
  check('Admin page sends you to /login', r.status === 302 && r.location === '/login');

  console.log('\nLogin errors');
  r = await b('POST', '/login', { email: '', password: '' });
  check('Empty fields show an error', r.body.includes('Please enter your email and password.'));
  r = await b('POST', '/login', { email: 'purva.patel@ontariotechu.net', password: 'wrong' });
  check('Wrong password is rejected', r.body.includes('Invalid email or password.'));
  r = await b('POST', '/login', { email: "x' OR '1'='1", password: 'x' });
  check('SQL injection does not log in', r.body.includes('Invalid email or password.'));

  console.log('\nUser (purva)');
  b = newBrowser();
  r = await b('POST', '/login', { email: 'purva.patel@ontariotechu.net', password: 'Pass#1002' });
  check('Login goes to Home', r.status === 302 && r.location === '/home');
  r = await b('GET', '/home');
  check('Home shows role "user"', r.body.includes('<b>user</b>'));
  check('No Admin link in the nav', !r.body.includes('href="/admin"'));
  r = await b('GET', '/write-review');
  check('Can open Write a Review', r.status === 200);
  r = await b('GET', '/admin');
  check('Admin page is blocked (403)', r.status === 403);
  r = await b('POST', '/logout');
  check('Logout goes to /login', r.status === 302 && r.location === '/login');
  r = await b('GET', '/home');
  check('After logout, Home sends you to /login', r.status === 302 && r.location === '/login');

  console.log('\nAdmin (dhiya)');
  b = newBrowser();
  r = await b('POST', '/login', { email: 'dhiya.sathish@ontariotechu.net', password: 'Pass#1001' });
  check('Login goes to the Admin page', r.status === 302 && r.location === '/admin');
  r = await b('GET', '/admin');
  check('Can open the Admin page', r.status === 200);
  check('Admin page lists students', r.body.includes('purva.patel@ontariotechu.net'));
  check('Admin page does not show password hashes', !r.body.includes('$2b$'));
  r = await b('GET', '/write-review');
  check('Can open Write a Review', r.status === 200);

  console.log('\nGuest');
  b = newBrowser();
  r = await b('POST', '/guest');
  check('Guest login goes to Home', r.status === 302 && r.location === '/home');
  r = await b('GET', '/home');
  check('Home shows role "guest"', r.body.includes('<b>guest</b>'));
  r = await b('GET', '/write-review');
  check('Write a Review is blocked (403)', r.status === 403);
  r = await b('GET', '/admin');
  check('Admin page is blocked (403)', r.status === 403);

  console.log('\nAPI protected by role');
  let anon = newBrowser();
  r = await anon('GET', '/reviews');
  check('Not logged in: GET /reviews is blocked (401)', r.status === 401);
  let g = newBrowser();
  await g('POST', '/guest');
  r = await g('GET', '/reviews');
  check('Guest: can read reviews', r.status !== 401 && r.status !== 403);
  r = await g('POST', '/reviews', {});
  check('Guest: cannot add a review (403)', r.status === 403);
  let u = newBrowser();
  await u('POST', '/login', { email: 'purva.patel@ontariotechu.net', password: 'Pass#1002' });
  r = await u('POST', '/reviews', {});
  check('User: can add a review (passes the role check)', r.status !== 401 && r.status !== 403);
  r = await u('DELETE', '/reviews/999999');
  check('User: cannot delete a review (403)', r.status === 403);
  let a = newBrowser();
  await a('POST', '/login', { email: 'dhiya.sathish@ontariotechu.net', password: 'Pass#1001' });
  r = await a('DELETE', '/reviews/999999');
  check('Admin: can delete a review (passes the role check)', r.status !== 401 && r.status !== 403);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

run().catch(err => {
  console.log('\nCould not reach the app at ' + BASE + '. Is "npm start" running in another terminal (inside the backend folder)?');
  console.log(err.message);
  process.exit(1);
});
