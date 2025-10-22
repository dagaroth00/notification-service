import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service.js';
import { success, error } from '../utils/response.js';
import logger from '../utils/logger.js';
import { BadRequestError, NotFoundError } from '../errors/httpError.js';

// POST /notifications
export const createNotifications = async (req: Request, res: Response) => {
	const { recipients, title, body, channel, data, templateId, priority } = req.body;
	const io = req.app.get('io');

		if (!io) throw new BadRequestError('WebSocket server not available');

		if (!Array.isArray(recipients) || recipients.length === 0) {
			throw new BadRequestError('recipients must be a non-empty array');
		}

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
};

// GET /notifications
export const getAllNotifications = async (req: Request, res: Response) => {
	const notifications = await notificationService.getAll(req.query as any);
	return success(res, notifications);
};

// GET /notifications/:id
export const getNotificationById = async (req: Request, res: Response) => {
	const notification = await notificationService.getById(req.params.id);
	if (!notification) throw new NotFoundError('Notification not found');
	return success(res, notification);
};

// PATCH /notifications/:id/read
export const markNotificationAsRead = async (req: Request, res: Response) => {
	const notification = await notificationService.markAsRead(req.params.id);
	return success(res, notification, 'Notification marked as read');
};

// DELETE /notifications/:id
export const deleteNotification = async (req: Request, res: Response) => {
	await notificationService.remove(req.params.id);
	return success(res, null, 'Notification deleted');
};

// GET /notifications/unread/count?userId=...
export const getUnreadCount = async (req: Request, res: Response) => {
		const { userId } = req.query;
		if (!userId || typeof userId !== 'string') throw new BadRequestError('Missing userId');
	const count = await notificationService.getUnreadCount(userId);
	return success(res, { userId, unreadCount: count });
};
