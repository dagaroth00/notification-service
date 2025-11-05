import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middlewares/cognitoAuth.js';

const router = Router();

// POST /notifications - create and send notification (requires authenticated user)
router.post('/', requireAuth({ required: true }), notificationController.createNotifications);

// GET /notifications?userId=...&isRead=... (optional auth - useful for public fetching with query token)
router.get('/', requireAuth({ required: true }), notificationController.getAllNotifications);

// GET /notifications/users/:userId/guid (requires auth)
router.get('/users/:userId/guid', requireAuth({ required: true }), notificationController.getUserGuid);

// GET /notifications/:id (requires auth)
router.get('/:id', requireAuth({ required: true }), notificationController.getNotificationById);

// PATCH /notifications/:id/read (requires auth)
router.patch('/:id/read', requireAuth({ required: true }), notificationController.markNotificationAsRead);

// DELETE /notifications/:id (requires auth and admin role)
router.delete('/:id', requireAuth({ required: true, roles: ['admin'] }), notificationController.deleteNotification);

// GET /notifications/unread/count?userId=... (requires auth)
router.get('/unread/count', requireAuth({ required: true }), notificationController.getUnreadCount);

export default router;
