import { Router, Request, Response } from 'express';

const router = Router();

// POST /notifications
router.post('/', async (req: Request, res: Response) => {
  const { recipients, message, type, data } = req.body;

  // Save to DB (coming later)
  // Send over WebSocket
  recipients.forEach((userId: string) => {
    req.app.get('io').to(userId).emit('newNotification', {
      type,
      message,
      data,
    });
  });

  // Trigger FCM push (coming later)

  res.status(200).json({ success: true });
});

export default router;
