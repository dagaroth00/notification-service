import { Router, Request, Response } from 'express';

const router = Router();

// POST /notifications
router.post('/', async (req: Request, res: Response) => {
  const { recipients, message, type, data } = req.body;

  // Save to DB (coming later)
  // Send over WebSocket
    const io = req.app.get('io');

  if (!io) {
    return res.status(500).json({ error: 'WebSocket server not available' });
  }
  recipients.forEach((userId: string) => {
    io.to(userId).emit('newNotification', {
      type,
      message,
      data,
    });
  });

  // Trigger FCM push (coming later)

  res.status(200).json({ success: true });
});

export default router;
