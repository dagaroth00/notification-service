import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service.js';
import { success, error } from '../utils/response.js';

// POST /notifications
export const createNotifications = async (req: Request, res: Response) => {
	const { recipients, title, body, channel, data, templateId, priority } = req.body;
	const io = req.app.get('io');

	if (!io) return error(res, new Error('WebSocket server not available'), 500);

	if (!Array.isArray(recipients) || recipients.length === 0) {
		return error(res, new Error('recipients must be a non-empty array'), 400);
	}

	try {
		const results = await Promise.all(
			recipients.map(async (userId: string) => {
				let finalTitle = title;
				let finalBody = body;
				let finalChannel = channel;
				let usedTemplateId: number | null = null;

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

		return success(res, { notifications: results }, 'Notifications created');
	} catch (err: unknown) {
		console.error(err);
		const message = err instanceof Error ? err.message : String(err);
		return error(res, new Error(`Failed to create/send notification: ${message}`), 500);
	}
};

// GET /notifications
export const getAllNotifications = async (req: Request, res: Response) => {
	try {
		const notifications = await notificationService.getAll(req.query as any);
		return success(res, notifications);
	} catch (err: unknown) {
		return error(res, err as Error, 500);
	}
};

// GET /notifications/:id
export const getNotificationById = async (req: Request, res: Response) => {
	try {
		const notification = await notificationService.getById(req.params.id);
		if (!notification) return error(res, new Error('Notification not found'), 404);
		return success(res, notification);
	} catch (err: unknown) {
		return error(res, err as Error, 500);
	}
};

// PATCH /notifications/:id/read
export const markNotificationAsRead = async (req: Request, res: Response) => {
	try {
		const notification = await notificationService.markAsRead(req.params.id);
		return success(res, notification, 'Notification marked as read');
	} catch (err: unknown) {
		return error(res, err as Error, 500);
	}
};

// DELETE /notifications/:id
export const deleteNotification = async (req: Request, res: Response) => {
	try {
		await notificationService.remove(req.params.id);
		return success(res, null, 'Notification deleted');
	} catch (err: unknown) {
		return error(res, err as Error, 500);
	}
};

// GET /notifications/unread/count?userId=...
export const getUnreadCount = async (req: Request, res: Response) => {
	const { userId } = req.query;
	if (!userId || typeof userId !== 'string') return error(res, new Error('Missing userId'), 400);
	try {
		const count = await notificationService.getUnreadCount(userId);
		return success(res, { userId, unreadCount: count });
	} catch (err: unknown) {
		return error(res, err as Error, 500);
	}
};
