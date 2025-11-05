import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service.js';
import { success, error } from '../utils/response.js';
import logger from '../utils/logger.js';
import { BadRequestError, NotFoundError } from '../errors/httpError.js';
import { getUserGuidByUserId } from '../services/auth.service.js';

// POST /notifications
export const createNotifications = async (req: Request, res: Response) => {
		const { recipients, title, body, channel, data, templateId, priority } = req.body;
		const io = req.app.get('io');

		if (!io) throw new BadRequestError('WebSocket server not available');
		if (!Array.isArray(recipients) || recipients.length === 0) {
			throw new BadRequestError('recipients must be a non-empty array');
		}

		const uniqueRecipients = Array.from(new Set(recipients));
		const recipientGuidPairs = await Promise.all(
			uniqueRecipients.map(async (userId: string) => {
				const { userGuid } = await getUserGuidByUserId(userId);
				return { userId, userGuid };
			})
		);
		const recipientGuidMap = new Map(recipientGuidPairs.map(({ userId, userGuid }) => [userId, userGuid]));

		// Example permission check: only authenticated users can create notifications.
		// req.user is populated by the auth middleware (Cognito token). If you want to
		// allow service-to-service calls you can use another mechanism (API key, etc.).
		const user = req.user as any;
		if (!user) {
			throw new BadRequestError('Unauthenticated request');
		}

		const results = await Promise.all(
			recipients.map(async (userId: string) => {
				let finalTitle = title;
				let finalBody = body;
				let finalChannel = channel;
				let usedTemplateId: number | null = null;
				const userGuid = recipientGuidMap.get(userId) ?? userId;

				if (templateId) {
					const templateMessage = await notificationService.getTemplateMessage(templateId, data);
					finalTitle = templateMessage.title;
					finalBody = templateMessage.body;
					finalChannel = templateMessage.channel;
					usedTemplateId = templateMessage.templateId;
				}

				const notification = await notificationService.create({
					userId: userGuid,
					title: finalTitle,
					body: finalBody,
					channel: finalChannel,
					status: 'pending',
					priority: priority || 'normal',
					metadata: data,
					templateId: usedTemplateId,
				});

				io.to(userGuid).emit('newNotification', notification);
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

		//TOO: uncomment this block to enable permission check
		// allow if the requester is the owner (sub) or is in admin group
		// const user = req.user as any;
		// const isAdmin = (user && (user['cognito:groups'] || []).includes('admin')) || false;
		// const isOwner = user && user.sub && notification.userId === user.sub;
		// if (!isAdmin && !isOwner) {
		// 	throw new BadRequestError('Forbidden: insufficient permissions');
		// }

		return success(res, notification);
};

// PATCH /notifications/:id/read
export const markNotificationAsRead = async (req: Request, res: Response) => {
		// Optional permission check: only owner or admin can mark as read
		const user = req.user as any;
		const notification = await notificationService.getById(req.params.id);
		if (!notification) throw new NotFoundError('Notification not found');

		//TOO: uncomment this block to enable permission check
		// const isAdmin = (user && (user['cognito:groups'] || []).includes('admin')) || false;
		// const isOwner = user && user.sub && notification.userId === user.sub;
		// if (!isAdmin && !isOwner) {
		// 	throw new BadRequestError('Forbidden: insufficient permissions');
		// }

		const updated = await notificationService.markAsRead(req.params.id);
		return success(res, updated, 'Notification marked as read');
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

// GET /notifications/users/:userId/guid
export const getUserGuid = async (req: Request, res: Response) => {
		const { userId } = req.params;
	const result = await getUserGuidByUserId(userId);
	return success(res, result, 'User GUID resolved');
};
