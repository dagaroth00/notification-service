import { Router, Request, Response } from 'express';
import * as notificationService from '../services/notification.service.js';
const router = Router();

// POST /notifications - create and send notification
router.post('/', async (req: Request, res: Response) => {
  const { recipients, title, body, channel, data, templateId, priority } = req.body;
  const io = req.app.get('io');

  if (!io) {
    return res.status(500).json({ error: 'WebSocket server not available' });
  }

  try {
    const results = await Promise.all(
      recipients.map(async (userId: string) => {
        let finalTitle = title;
        let finalBody = body;
        let finalChannel = channel;
        let usedTemplateId = null;

        // 🔹 Fetch and apply template if given
        if (templateId) {
          const templateMessage = await notificationService.getTemplateMessage(templateId, data);
          finalTitle = templateMessage.title;
          finalBody = templateMessage.body;
          finalChannel = templateMessage.channel;
          usedTemplateId = templateMessage.templateId;
        }

        const notification = await notificationService.create({
          userId,
          title: finalTitle,
          body: finalBody,
          channel: finalChannel,
          status: 'pending',
          priority: priority || 'normal',
          metadata: data,
          templateId: usedTemplateId,
        });

        io.to(userId).emit('newNotification', notification);
        return notification;
      })
    );

    res.status(201).json({ success: true, notifications: results });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to create/send notification', details: message });
  }
});

// GET /notifications?userId=...&isRead=...
router.get('/', async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getAll(req.query);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err });
  }
});

// GET /notifications/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.getById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification', details: err });
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read', details: err });
  }
});

// DELETE /notifications/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await notificationService.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification', details: err });
  }
});

// GET /notifications/unread/count?userId=...
router.get('/unread/count', async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing userId' });
  }
  try {
    const count = await notificationService.getUnreadCount(userId);
    res.json({ userId, unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get unread count', details: err });
  }
});


export default router;
