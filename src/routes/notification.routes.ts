import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

// POST /notifications - create and send notification
router.post('/', notificationController.createNotifications);

// GET /notifications?userId=...&isRead=...
router.get('/', notificationController.getAllNotifications);

// GET /notifications/:id
router.get('/:id', notificationController.getNotificationById);

// PATCH /notifications/:id/read
router.patch('/:id/read', notificationController.markNotificationAsRead);

// DELETE /notifications/:id
router.delete('/:id', notificationController.deleteNotification);

// GET /notifications/unread/count?userId=...
router.get('/unread/count', notificationController.getUnreadCount);

export default router;
