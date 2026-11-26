// set-password.js - change a student's password (it gets hashed automatically)
// Usage:  node set-password.js <email> <new password>
// Example: node set-password.js purva.patel@ontariotechu.net NewPass#2026
require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const db = require('./db');

async function main() {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword) {
    console.log('Usage: node set-password.js <email> <new password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 10);
  const [result] = await db.query('UPDATE STUDENT SET StudentPassword = ? WHERE email = ?', [hash, email]);

  if (result.affectedRows === 0) {
    console.log('No student found with email: ' + email);
  } else {
    console.log('Password changed for ' + email);
  }
  process.exit(0);
}

main().catch(err => {
  console.log('Error: ' + err.message);
  process.exit(1);
});
