const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role_id: user.role_id, role_name: user.role_name },
    process.env.JWT_SECRET || 'fallback_secret_for_dev',
    { expiresIn: '1d' }
  );
};

const registerUser = async (req, res) => {
  const { email, password, role_name } = req.body;

  try {
    // 1. Check if user exists
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    // 2. Get role ID
    const roleQuery = await pool.query('SELECT id FROM roles WHERE name = $1', [role_name || 'Fleet Manager']);
    if (roleQuery.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid role' });
    }
    const role_id = roleQuery.rows[0].id;

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Insert user
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, email, role_id',
      [email, password_hash, role_id]
    );

    const user = {
      id: newUser.rows[0].id,
      email: newUser.rows[0].email,
      role_id: newUser.rows[0].role_id,
      role_name: role_name || 'Fleet Manager'
    };

    const token = generateToken(user);
    res.status(201).json({ status: 'success', data: { user, token } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role_id, u.failed_login_attempts, u.account_locked_until, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = userQuery.rows[0];

    // Check if account is locked
    if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
      return res.status(403).json({ status: 'error', message: 'Invalid credential account locked after 5 failed attempt' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      if (attempts >= 5) {
        await pool.query("UPDATE users SET failed_login_attempts = $1, account_locked_until = CURRENT_TIMESTAMP + INTERVAL '15 minutes' WHERE id = $2", [attempts, user.id]);
        return res.status(403).json({ status: 'error', message: 'Invalid credential account locked after 5 failed attempt' });
      } else {
        await pool.query('UPDATE users SET failed_login_attempts = $1 WHERE id = $2', [attempts, user.id]);
        return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
      }
    }

    // Reset failed login attempts on successful login
    await pool.query('UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE id = $1', [user.id]);

    const token = generateToken(user);
    res.json({
      status: 'success',
      data: {
        user: { id: user.id, email: user.email, role_id: user.role_id, role_name: user.role_name },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    const userQuery = await pool.query(
      `SELECT u.id, u.email, u.role_id, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', data: { user: userQuery.rows[0] } });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
