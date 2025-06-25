const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const pool = require('../database/mysql');
const authenticateToken = require('../middleware/AuthenticationToken');
const transporter = require('../database/Nodemailer');
const validator = require('validator');
const geoip = require('geoip-lite');

// Validate JWT secrets
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in .env');
}

// Helper function to check if IP is localhost
const isLocalhost = (ip) => ip === '::1' || ip === '127.0.0.1' || ip === 'localhost';

// Helper function to manage IP addresses (max 3)
const updateIpAddresses = (existingIps, newIp) => {
  let ipArray = existingIps ? JSON.parse(existingIps) : [];
  if (!ipArray.includes(newIp)) {
    ipArray.unshift(newIp);
    ipArray = ipArray.slice(0, 3);
  }
  return JSON.stringify(ipArray);
};

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, ip } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Name, email, and password are required',
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email',
      message: 'Please provide a valid email address',
    });
  }

  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Password must be at least 6 characters long',
    });
  }

  try {
    const sanitizedName = validator.escape(name.trim());
    const sanitizedEmail = validator.normalizeEmail(email);
    const clientIp = ip || req.ip;

    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [sanitizedEmail]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        error: 'Email exists',
        message: 'This email is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let city = 'Unknown';
    let country = 'Unknown';
    let region = 'Unknown';
    if (!isLocalhost(clientIp)) {
      try {
        const response = await axios.get(`http://ip-api.com/json/${clientIp}`, { timeout: 5000 });
        if (response.data.status === 'success') {
          city = response.data.city || 'Unknown';
          country = response.data.country || 'Unknown';
          region = response.data.regionName || 'Unknown';
        } else {
          const geo = geoip.lookup(clientIp);
          if (geo) {
            city = geo.city || 'Unknown';
            country = geo.country || 'Unknown';
            region = geo.region || 'Unknown';
          }
        }
      } catch (geoError) {
        console.warn('Geolocation lookup failed:', geoError.message);
        const geo = geoip.lookup(clientIp);
        if (geo) {
          city = geo.city || 'Unknown';
          country = geo.country || 'Unknown';
          region = geo.region || 'Unknown';
        }
      }
    } else {
      city = 'Localhost';
      country = 'Localhost';
      region = 'Localhost';
    }

    const ipAddresses = updateIpAddresses(null, clientIp);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, ip_addresses, city, country, region, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [sanitizedName, sanitizedEmail, hashedPassword, ipAddresses, city, country, region]
    );

    const token = jwt.sign({ id: result.insertId, email: sanitizedEmail }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    const refreshToken = jwt.sign({ id: result.insertId, email: sanitizedEmail }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });

    await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, result.insertId]);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        token,
        refresh_token: refreshToken,
        user: {
          id: result.insertId,
          name: sanitizedName,
          email: sanitizedEmail,
          ip_addresses: JSON.parse(ipAddresses),
          city,
          region,
          country,
        },
      },
    });
  } catch (error) {
    console.error('Signup Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to register user',
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password, ip } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Email and password are required',
    });
  }

  try {
    const sanitizedEmail = validator.normalizeEmail(email);
    const clientIp = ip || req.ip;

    const [users] = await pool.query('SELECT id, name, email, password, ip_addresses FROM users WHERE email = ?', [
      sanitizedEmail,
    ]);
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    const updatedIpAddresses = updateIpAddresses(user.ip_addresses, clientIp);
    await pool.query('UPDATE users SET ip_addresses = ? WHERE id = ?', [updatedIpAddresses, user.id]);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });

    await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    res.status(200).json({
      message: 'Login successful',
      data: {
        token,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          ip_addresses: JSON.parse(updatedIpAddresses),
        },
      },
    });
  } catch (error) {
    console.error('Login Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to log in. Please try again later.',
    });
  }
});

// Refresh Token Route
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Missing token',
      message: 'Refresh token is required',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const [users] = await pool.query('SELECT id, email FROM users WHERE refresh_token = ? AND id = ?', [
      refreshToken,
      decoded.id,
    ]);
    if (users.length === 0) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Refresh token is invalid',
      });
    }

    const user = users[0];
    const newToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Token refreshed successfully',
      data: { token: newToken },
    });
  } catch (error) {
    console.error('Refresh Token Error:', { message: error.message, stack: error.stack });
    res.status(403).json({
      error: 'Invalid token',
      message: 'Failed to refresh token',
    });
  }
});

// Logout Route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [req.user.id]);
    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to log out. Please try again.',
    });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Email is required',
    });
  }

  try {
    const sanitizedEmail = validator.normalizeEmail(email);
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [sanitizedEmail]);
    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'This email is not registered',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query('UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?', [
      otp,
      otpExpires,
      sanitizedEmail,
    ]);

    const mailOptions = {
      from: '"VocalHeart Infotech Pvt. Ltd." <vocalheart.tech@gmail.com>',
      to: sanitizedEmail,
      subject: 'Your Password Reset Code',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e8e8; border-radius: 4px; color: #333;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://i.ibb.co/gbPrfVSB/Whats-App-Image-2025-03-03-at-17-45-28-b944d3a4-removebg-preview-1.png" alt="VocalHeart Logo" style="height: 40px;">
          </div>
          <h1 style="font-size: 18px; font-weight: 500; color: #2d3748; margin-bottom: 16px;">Password Reset Request</h1>
          <p style="font-size: 12px; line-height: 1.5; margin-bottom: 16px;">
            We received a request to reset your password. Please use the following verification code:
          </p>
          <div style="background: #f7fafc; border: 1px dashed #e2e8f0; border-radius: 4px; padding: 16px; text-align: center; margin: 24px 0;">
            <span style="font-size: 24px; letter-spacing: 2px; font-weight: 600; color: #2d3748;">${otp}</span>
          </div>
          <p style="font-size: 12px; line-height: 1.5; margin-bottom: 16px;">
            This code will expire in <strong>10 minutes</strong>. For security reasons, please do not share this code with anyone.
          </p>
          <p style="font-size: 12px; line-height: 1.5; margin-bottom: 24px;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
          <div style="border-top: 1px solid #e8e8e8; padding-top: 16px;">
            <p style="font-size: 11px; color: #718096; margin-bottom: 8px;">
              Need help? <a href="https://vocalheart.com/support" style="color: #4299e1; text-decoration: none;">Contact our support team</a>
            </p>
            <p style="font-size: 11px; color: #718096; margin: 0;">
              © ${new Date().getFullYear()} VocalHeart Infotech. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: 'Verification code sent',
      data: { details: 'A 6-digit verification code has been sent to your email.' },
    });
  } catch (error) {
    console.error('Forgot Password Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to send verification code. Please try again later.',
    });
  }
});

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Email and OTP are required',
    });
  }

  try {
    const sanitizedEmail = validator.normalizeEmail(email);
    const [users] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND otp = ? AND otp_expires > ?',
      [sanitizedEmail, otp, new Date()]
    );
    if (users.length === 0) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'The OTP is invalid or has expired',
      });
    }

    res.status(200).json({
      message: 'OTP verified successfully',
      data: { email: sanitizedEmail },
    });
  } catch (error) {
    console.error('OTP Verification Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify OTP. Please try again.',
    });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Email, OTP, and password are required',
    });
  }

  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Password must be at least 6 characters long',
    });
  }

  try {
    const sanitizedEmail = validator.normalizeEmail(email);
    const [users] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND otp = ? AND otp_expires > ?',
      [sanitizedEmail, otp, new Date()]
    );
    if (users.length === 0) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'The OTP is invalid or has expired',
      });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('UPDATE users SET password = ?, otp = NULL, otp_expires = NULL WHERE id = ?', [
      hashedPassword,
      user.id,
    ]);

    res.status(200).json({
      message: 'Password reset successfully',
      data: { email: sanitizedEmail },
    });
  } catch (error) {
    console.error('Reset Password Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to reset password. Please try again.',
    });
  }
});

// User Profile Route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, ip_addresses FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
      });
    }
    const user = users[0];
    user.ip_addresses = JSON.parse(user.ip_addresses || '[]');
    res.status(200).json({
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    console.error('Profile Fetch Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch user profile.',
    });
  }
});

// Admin List Route
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, created_at, ip_addresses, city, country, region FROM users'
    );
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      ip_addresses: JSON.parse(user.ip_addresses || '[]'),
      city: user.city,
      region: user.region,
      country: user.country,
    }));
    res.status(200).json({
      message: 'Users fetched successfully',
      data: formattedUsers,
    });
  } catch (error) {
    console.error('Admin Fetch Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch users',
    });
  }
});

// Delete Admin Route
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
      });
    }
    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete User Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete user',
    });
  }
});

// Edit Admin Route
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Name and email are required',
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email',
      message: 'Please provide a valid email address',
    });
  }

  try {
    const sanitizedName = validator.escape(name.trim());
    const sanitizedEmail = validator.normalizeEmail(email);

    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [
      sanitizedEmail,
      req.params.id,
    ]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        error: 'Email exists',
        message: 'This email is already registered',
      });
    }

    let updateQuery = 'UPDATE users SET name = ?, email = ?';
    const queryParams = [sanitizedName, sanitizedEmail];

    if (password) {
      if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Password must be at least 6 characters long',
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(req.params.id);

    const [result] = await pool.query(updateQuery, queryParams);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
      });
    }

    res.status(200).json({
      message: 'User updated successfully',
      data: { id: req.params.id, name: sanitizedName, email: sanitizedEmail },
    });
  } catch (error) {
    console.error('Edit User Error:', { message: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update user',
    });
  }
});

module.exports = router;