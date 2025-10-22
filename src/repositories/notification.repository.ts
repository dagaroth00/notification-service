import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createNotification = async (data: any) => {
	return prisma.notifications.create({ data });
};

export const findNotifications = async (query: { userId?: string; isRead?: string }) => {
	const { userId, isRead } = query;
	return prisma.notifications.findMany({
		where: {
			userId: userId || undefined,
			readAt: typeof isRead === 'string' ? (isRead === 'true' ? { not: null } : null) : undefined,
		},
		orderBy: { createdAt: 'desc' },
	});
};

export const findNotificationById = async (id: string) => {
	return prisma.notifications.findUnique({ where: { id } });
};

export const updateNotification = async (id: string, data: any) => {
	return prisma.notifications.update({ where: { id }, data });
};

export const deleteNotification = async (id: string) => {
	return prisma.notifications.delete({ where: { id } });
};

export const countUnread = async (userId: string) => {
	return prisma.notifications.count({ where: { userId, readAt: null } });
};

export const findTemplateById = async (id: number) => {
	return prisma.notificationTemplate.findUnique({ where: { id } });
};

// Export Prisma instance for advanced queries if needed
export { prisma };
