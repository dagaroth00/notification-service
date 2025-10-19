import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const create = async (data: any) => {
  return prisma.notification.create({ data });
};

export const getAll = async (query: any) => {
  const { userId, type, isRead } = query;
  return prisma.notification.findMany({
    where: {
      userId: userId || undefined,
      type: type || undefined,
      isRead: isRead ? isRead === "true" : undefined,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: string) => {
  return prisma.notification.findUnique({ where: { id } });
};

export const markAsRead = async (id: string) => {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const remove = async (id: string) => {
  return prisma.notification.delete({ where: { id } });
};

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};
