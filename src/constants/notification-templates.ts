/**
 * Central mapping of notification templates to the legacy system identifiers.
 * The intent is to keep an authoritative list that can be shared by any
 * service (REST, WebSocket, background workers, etc.) that needs to trigger
 * email/push notifications.
 */
export enum NotificationTemplate {
  WorkOrderInProgress = 2,
  WorkOrderJeopardy = 3,
  WorkOrderCompleted = 4,
  WorkOrderAssigned = 5,
  ChildWorkOrder = 6,
  ScheduleCreated = 7,
  ScheduleUpdated = 8,
  ScheduleAssigned = 9,
  BookingCreated = 10,
  BookingUpdated = 11,
  BookingRescheduled = 12,
  BookingCancelled = 13,
  WorkOrderDueReminder = 14,
  ScheduleStartReminder = 15,
  BookingReminder = 16,
  WorkOrderQaInReview = 17,
  WorkOrderQaAccepted = 18,
  WorkOrderQaRejected = 19,
}

export enum NotificationChannel {
  Email = 'email',
  Push = 'push',
  Sms = 'sms',
  InApp = 'in_app',
}

export type NotificationCategoryKind = 'notification' | 'reminder';

export interface NotificationTemplateDefinition {
  readonly id: NotificationTemplate;
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly categoryId: number;
  readonly categoryName: string;
  readonly notificationType: NotificationCategoryKind;
  readonly channels: readonly NotificationChannel[];
  readonly dataFields: readonly string[];
}

const CHANNEL_EMAIL_ONLY: readonly NotificationChannel[] = [NotificationChannel.Email];
const CHANNEL_EMAIL_PUSH: readonly NotificationChannel[] = [NotificationChannel.Email, NotificationChannel.Push];

const WORK_ORDER_NOTIFICATION_FIELDS = [
  'woCode',
  'woType',
  'priority',
  'quantity',
  'supervisor',
  'notes',
  'technician',
  'woStatus',
  'qaStatus',
  'address',
  'releasedDate',
  'preferredEndTime',
  'woId',
] as const;

const WORK_ORDER_REMINDER_FIELDS = [
  'woCode',
  'woId',
  'woType',
  'woStatus',
  'subStatus',
  'priority',
  'quantity',
  'supervisor',
  'technician',
  'notes',
  'releasedDate',
  'preferredEndTime',
] as const;

const SCHEDULE_FIELDS = [
  'eventName',
  'workOrderCode',
  'eventLocation',
  'eventDuration',
  'eventDescription',
  'scheduleType',
  'scheduleStartDate',
  'scheduleEndDate',
] as const;

const BOOKING_FIELDS = [
  'eventName',
  'personName',
  'eventLocation',
  'eventDescription',
  'eventDuration',
  'bookingDateTime',
  'unitNo',
  'ownerOrTenant',
  'additionalInfo',
  'cancellationUrl',
  'rescheduleUrl',
  'editUrl',
] as const;

const SCHEDULE_REMINDER_FIELDS = [
  'eventName',
  'eventLocation',
  'workOrderCode',
  'assignToUserName',
  'eventDescription',
  'eventDuration',
  'scheduleStartDate',
  'scheduleEndDate',
] as const;

const BOOKING_REMINDER_FIELDS = [
  'eventName',
  'eventDescription',
  'eventLocation',
  'eventDuration',
  'bookingDateTime',
  'workOrderCode',
  'assignToUserName',
  'personName',
  'phoneNo',
  'userEmail',
  'unitNo',
  'ownerOrTenant',
  'additionalInfo',
] as const;

const TEMPLATE_DEFINITIONS: NotificationTemplateDefinition[] = [
  {
    id: NotificationTemplate.WorkOrderInProgress,
    key: 'work-order-in-progress',
    name: 'Work Order In Progress',
    description: 'Triggered when a work order moves to the In Progress state.',
    categoryId: 5,
    categoryName: 'InProgressWorkOrder',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_PUSH,
    dataFields: WORK_ORDER_NOTIFICATION_FIELDS,
  },
  {
    id: NotificationTemplate.WorkOrderJeopardy,
    key: 'work-order-jeopardy',
    name: 'Work Order Jeopardy',
    description: 'Triggered when a work order status changes to Jeopardy.',
    categoryId: 6,
    categoryName: 'JeopardyWorkOrder',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_PUSH,
    dataFields: WORK_ORDER_NOTIFICATION_FIELDS,
  },
  {
    id: NotificationTemplate.WorkOrderCompleted,
    key: 'work-order-completed',
    name: 'Work Order Completed',
    description: 'Triggered when a work order is completed.',
    categoryId: 7,
    categoryName: 'CompleteWorkOrder',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_PUSH,
    dataFields: WORK_ORDER_NOTIFICATION_FIELDS,
  },
  {
    id: NotificationTemplate.WorkOrderAssigned,
    key: 'work-order-assigned',
    name: 'Work Order Assigned',
    description: 'Triggered when a work order gets assigned to a technician.',
    categoryId: 8,
    categoryName: 'AssignWorkOrder',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_PUSH,
    dataFields: WORK_ORDER_NOTIFICATION_FIELDS,
  },
  {
    id: NotificationTemplate.ChildWorkOrder,
    key: 'child-work-order',
    name: 'Child Work Order',
    description: 'Triggered for child work orders linked to parent work orders.',
    categoryId: 9,
    categoryName: 'ChildWorkOrder',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_PUSH,
    dataFields: WORK_ORDER_NOTIFICATION_FIELDS,
  },
  {
    id: NotificationTemplate.ScheduleCreated,
    key: 'schedule-created',
    name: 'Schedule Created',
    description: 'Triggered when a new schedule is created.',
    categoryId: 10,
    categoryName: 'NewSchedule',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: SCHEDULE_FIELDS,
  },
  {
    id: NotificationTemplate.ScheduleUpdated,
    key: 'schedule-updated',
    name: 'Schedule Updated',
    description: 'Triggered when an existing schedule is updated.',
    categoryId: 11,
    categoryName: 'EditSchedule',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: SCHEDULE_FIELDS,
  },
  {
    id: NotificationTemplate.ScheduleAssigned,
    key: 'schedule-assigned',
    name: 'Schedule Assigned',
    description: 'Triggered when a schedule is assigned to a user.',
    categoryId: 12,
    categoryName: 'AssignSchedule',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: SCHEDULE_FIELDS,
  },
  {
    id: NotificationTemplate.BookingCreated,
    key: 'booking-created',
    name: 'Booking Created',
    description: 'Triggered when a new booking is created.',
    categoryId: 13,
    categoryName: 'NewBooking',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: BOOKING_FIELDS,
  },
  {
    id: NotificationTemplate.BookingUpdated,
    key: 'booking-updated',
    name: 'Booking Updated',
    description: 'Triggered when booking details are updated.',
    categoryId: 14,
    categoryName: 'EditBooking',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: BOOKING_FIELDS,
  },
  {
    id: NotificationTemplate.BookingRescheduled,
    key: 'booking-rescheduled',
    name: 'Booking Rescheduled',
    description: 'Triggered when a booking is rescheduled.',
    categoryId: 15,
    categoryName: 'RescheduleBooking',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: BOOKING_FIELDS,
  },
  {
    id: NotificationTemplate.BookingCancelled,
    key: 'booking-cancelled',
    name: 'Booking Cancelled',
    description: 'Triggered when a booking is cancelled.',
    categoryId: 16,
    categoryName: 'CancelBooking',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: BOOKING_FIELDS,
  },
  {
    id: NotificationTemplate.WorkOrderDueReminder,
    key: 'work-order-due-reminder',
    name: 'Work Order Due Reminder',
    description: 'Reminder sent prior to a work order due date.',
    categoryId: 17,
    categoryName: 'OnDueWorkOrder',
    notificationType: 'reminder',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: WORK_ORDER_REMINDER_FIELDS,
  },
  {
    id: NotificationTemplate.ScheduleStartReminder,
    key: 'schedule-start-reminder',
    name: 'Schedule Start Reminder',
    description: 'Reminder sent prior to a schedule start time.',
    categoryId: 18,
    categoryName: 'OnStartSchedule',
    notificationType: 'reminder',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: SCHEDULE_REMINDER_FIELDS,
  },
  {
    id: NotificationTemplate.BookingReminder,
    key: 'booking-reminder',
    name: 'Booking Reminder',
    description: 'Reminder sent ahead of a booking.',
    categoryId: 19,
    categoryName: 'PriorBooking',
    notificationType: 'reminder',
    channels: CHANNEL_EMAIL_ONLY,
    dataFields: BOOKING_REMINDER_FIELDS,
  },
  {
    id: NotificationTemplate.WorkOrderQaInReview,
    key: 'work-order-qa-in-review',
    name: 'Work Order QA In Review',
    description: 'Triggered when a work order moves to QA in review.',
    categoryId: 20,
    categoryName: 'WoQaInReview',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_PUSH,
    dataFields: WORK_ORDER_NOTIFICATION_FIELDS,
  },
  {
    id: NotificationTemplate.WorkOrderQaAccepted,
    key: 'work-order-qa-accepted',
    name: 'Work Order QA Accepted',
    description: 'Triggered when QA accepts a work order.',
    categoryId: 21,
    categoryName: 'WoQaAccepted',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_PUSH,
    dataFields: WORK_ORDER_NOTIFICATION_FIELDS,
  },
  {
    id: NotificationTemplate.WorkOrderQaRejected,
    key: 'work-order-qa-rejected',
    name: 'Work Order QA Rejected',
    description: 'Triggered when QA rejects a work order.',
    categoryId: 22,
    categoryName: 'WoQaRejected',
    notificationType: 'notification',
    channels: CHANNEL_EMAIL_PUSH,
    dataFields: WORK_ORDER_NOTIFICATION_FIELDS,
  },
];

type TemplateDictionary = Record<NotificationTemplate, NotificationTemplateDefinition>;

const frozenDefinitions = TEMPLATE_DEFINITIONS.reduce<TemplateDictionary>((acc, template) => {
  acc[template.id] = Object.freeze({
    ...template,
    channels: Object.freeze([...template.channels]) as readonly NotificationChannel[],
    dataFields: Object.freeze([...template.dataFields]) as readonly string[],
  });
  return acc;
}, {} as TemplateDictionary);

export const NOTIFICATION_TEMPLATE_DEFINITIONS: Readonly<TemplateDictionary> = Object.freeze(frozenDefinitions);

export const NOTIFICATION_TEMPLATE_BY_ID: Readonly<Record<number, NotificationTemplateDefinition>> = NOTIFICATION_TEMPLATE_DEFINITIONS;

export const getNotificationTemplateDefinition = (
  templateId: number,
): NotificationTemplateDefinition | undefined => NOTIFICATION_TEMPLATE_BY_ID[templateId];

export const isNotificationTemplate = (templateId: number): templateId is NotificationTemplate =>
  Object.prototype.hasOwnProperty.call(NOTIFICATION_TEMPLATE_BY_ID, templateId);
