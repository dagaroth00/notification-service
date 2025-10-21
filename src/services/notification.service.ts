import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new notification
export const create = async (data: any) => {
  return prisma.notifications.create({ data });
};

// Get all notifications, optionally filtered by userId and read status
export const getAll = async (query: { userId?: string; isRead?: string }) => {
  const { userId, isRead } = query;
  return prisma.notifications.findMany({
    where: {
      userId: userId || undefined,
      readAt: typeof isRead === 'string' ? (isRead === 'true' ? { not: null } : null) : undefined,
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Get a notification by ID
export const getById = async (id: string) => {
  return prisma.notifications.findUnique({ where: { id } });
};

// Mark a notification as read (set readAt to now)
export const markAsRead = async (id: string) => {
  return prisma.notifications.update({
    where: { id },
    data: { readAt: new Date() },
  });
};

// Delete a notification
export const remove = async (id: string) => {
  return prisma.notifications.delete({ where: { id } });
};

// Get unread notification count for a user
export const getUnreadCount = async (userId: string) => {
  return prisma.notifications.count({
    where: { userId, readAt: null },
  });
};


export const applyTemplate = (template: string, data: Record<string, any> = {}) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = data[key.trim()];
    return value !== undefined ? value : '';
  });
};

export const getTemplateMessage = async (templateId: number, data: Record<string, any> = {}) => {
  const template = await prisma.notificationTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error(`Notification template with ID ${templateId} not found`);
  }

  const title = applyTemplate(template.title, data);
  const body = applyTemplate(template.body, data);

  return {
    title,
    body,
    channel: template.channel,
    templateId: template.id,
  };
};