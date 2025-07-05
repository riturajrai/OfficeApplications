const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/AuthenticationToken');
const database = require('../database/mysql');

// 1. Notification Counter (Unread Only)
router.get(
  '/notification-counter',
  authenticateToken,
  async (req, res) => {
    const user_id = req.user.id;
    try {
      const query = `SELECT COUNT(*) AS count FROM Notification WHERE user_id = ? AND status = 'unread'`;
      const [result] = await database.query(query, [user_id]);
      res.status(200).json({
        success: true,
        message: 'Successfully fetched unread notifications count',
        count: result[0].count,
      });
    } catch (error) {
      console.error('Error fetching notification count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notification count',
      });
    }
  }
);

// 2. Get All Notifications for Logged-in User (Latest First) with Pagination
router.get(
  '/getNotifications',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt().withMessage('Limit must be between 1 and 50'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user_id = req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 5; // Default to 5 notifications per page
    const offset = (page - 1) * limit;

    try {
      // Fixed SQL query: Removed quotes around LIMIT by ensuring numeric parameters
      const query = `
        SELECT id, type, message, status, created_at 
        FROM Notification 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      // Ensure limit and offset are integers
      const [notifications] = await database.query(query, [user_id, Number(limit), Number(offset)]);

      // Get total count of notifications
      const countQuery = `SELECT COUNT(*) AS total FROM Notification WHERE user_id = ?`;
      const [[{ total }]] = await database.query(countQuery, [user_id]);

      res.status(200).json({
        success: true,
        notifications,
        total,
        page,
        limit,
        hasMore: offset + notifications.length < total, // Indicate if more notifications are available
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load notifications',
      });
    }
  }
);

// 3. Update Status of Single Notification (read/unread)
router.post(
  '/notification/status/:id',
  authenticateToken,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid notification ID'),
    body('status')
      .isIn(['read', 'unread'])
      .withMessage('Status must be either "read" or "unread"'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const id = req.params.id;
    const user_id = req.user.id;
    const { status } = req.body;

    try {
      // Check if notification exists and belongs to the user
      const checkQuery = `SELECT id FROM Notification WHERE id = ? AND user_id = ?`;
      const [existing] = await database.query(checkQuery, [id, user_id]);

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found or unauthorized',
        });
      }

      // Update notification status
      const updateQuery = `UPDATE Notification SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`;
      const [result] = await database.query(updateQuery, [status, id, user_id]);

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          error: 'Failed to update notification status',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification status updated successfully',
      });
    } catch (error) {
      console.error('Error updating notification status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification status',
      });
    }
  }
);

// 4. Mark All Notifications as Read
router.put(
  '/notification-mark-read',
  authenticateToken,
  async (req, res) => {
    const user_id = req.user.id;
    try {
      const query = `UPDATE Notification SET status = 'read', updated_at = NOW() WHERE user_id = ? AND status = 'unread'`;
      const [result] = await database.query(query, [user_id]);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notifications as read',
      });
    }
  }
);

module.exports = router;