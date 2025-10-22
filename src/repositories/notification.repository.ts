import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';
import { ServiceError } from '../errors/httpError.js';

const prisma = new PrismaClient();

export const createNotification = async (data: any) => {
	try {
		return await prisma.notifications.create({ data });
	} catch (err) {
		logger.error('createNotification DB error', err);
		throw new ServiceError('Failed to create notification', err);
	}
};

export const findNotifications = async (query: { userId?: string; isRead?: string }) => {
	try {
		const { userId, isRead } = query;
		return await prisma.notifications.findMany({
			where: {
				userId: userId || undefined,
				readAt: typeof isRead === 'string' ? (isRead === 'true' ? { not: null } : null) : undefined,
			},
			orderBy: { createdAt: 'desc' },
		});
	} catch (err) {
		logger.error('findNotifications DB error', err);
		throw new ServiceError('Failed to fetch notifications', err);
	}
};

export const findNotificationById = async (id: string) => {
	try {
		return await prisma.notifications.findUnique({ where: { id } });
	} catch (err) {
		logger.error('findNotificationById DB error', err);
		throw new ServiceError('Failed to fetch notification', err);
	}
};

export const updateNotification = async (id: string, data: any) => {
	try {
		return await prisma.notifications.update({ where: { id }, data });
	} catch (err) {
		logger.error('updateNotification DB error', err);
		throw new ServiceError('Failed to update notification', err);
	}
};

export const deleteNotification = async (id: string) => {
	try {
		return await prisma.notifications.delete({ where: { id } });
	} catch (err) {
		logger.error('deleteNotification DB error', err);
		throw new ServiceError('Failed to delete notification', err);
	}
};

export const countUnread = async (userId: string) => {
	try {
		return await prisma.notifications.count({ where: { userId, readAt: null } });
	} catch (err) {
		logger.error('countUnread DB error', err);
		throw new ServiceError('Failed to count unread notifications', err);
	}
};

export const findTemplateById = async (id: number) => {
	try {
		return await prisma.notificationTemplate.findUnique({ where: { id } });
	} catch (err) {
		logger.error('findTemplateById DB error', err);
		throw new ServiceError('Failed to fetch template', err);
	}
};

// Export Prisma instance for advanced queries if needed
export { prisma };
