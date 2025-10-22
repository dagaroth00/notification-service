import * as repository from '../repositories/notification.repository.js';
import logger from '../utils/logger.js';
import { NotFoundError, ServiceError } from '../errors/httpError.js';

// Create a new notification
export const create = async (data: any) => {
  return repository.createNotification(data);
};

// Get all notifications, optionally filtered by userId and read status
export const getAll = async (query: { userId?: string; isRead?: string }) => {
  return repository.findNotifications(query);
};

// Get a notification by ID
export const getById = async (id: string) => {
  return repository.findNotificationById(id);
};

// Mark a notification as read (set readAt to now)
export const markAsRead = async (id: string) => {
  return repository.updateNotification(id, { readAt: new Date() });
};

// Delete a notification
export const remove = async (id: string) => {
  return repository.deleteNotification(id);
};

// Get unread notification count for a user
export const getUnreadCount = async (userId: string) => {
  return repository.countUnread(userId);
};


export const applyTemplate = (template: string, data: Record<string, any> = {}) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = data[key.trim()];
    return value !== undefined ? value : '';
  });
};

export const getTemplateMessage = async (templateId: number, data: Record<string, any> = {}) => {
  const template = await repository.findTemplateById(templateId);

  if (!template) {
    logger.warn(`Template ${templateId} not found`);
    throw new NotFoundError(`Notification template with ID ${templateId} not found`);
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