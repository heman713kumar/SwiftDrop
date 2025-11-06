// In a real application, this file would contain the "Producers" that add jobs
// to a message queue system like RabbitMQ or a Redis-based one like BullMQ.
// This allows the API to respond instantly to the user while the actual work
// is performed by a separate "Worker" process.

import { processOrderAssignment, processNotification, processAnalyticsEvent, processPaymentVerification } from './workers';

// ===================================================================================
// == QUEUE DEFINITIONS & JOB PAYLOADS
// ===================================================================================
// These would be instances of the BullMQ Queue class in a real app.
// const orderAssignmentQueue = new Queue('order-assignment', { connection: redisConnection });

// Define the shape of the data that each job will carry.
export interface OrderAssignmentJob {
    orderId: string;
}

export interface NotificationJob {
    userId: string;
    type: 'order_status' | 'promotion' | 'account' | 'chat_message';
    title: string;
    body: string;
}

export interface PaymentVerificationJob {
    orderId: string;
    paymentGateway: 'MTN' | 'Vodafone' | 'Stripe';
    transactionId: string;
}

export interface AnalyticsJob {
    userId: string;
    eventType: string;
    payload: object;
}


// ===================================================================================
// == JOB PRODUCER FUNCTIONS
// ===================================================================================
// These functions are called by the controllers to add new jobs to the queues.

/**
 * Adds an order to the queue for finding and assigning a delivery partner.
 * @param job The details of the order assignment job.
 */
export const addOrderToAssignmentQueue = (job: OrderAssignmentJob) => {
    console.log(`[Queue Producer] Adding job to 'order-assignment' queue for order: ${job.orderId}`);
    // In a real app: await orderAssignmentQueue.add('assign-partner', job);
    
    // For this mock, we directly call the worker function to simulate the job being processed.
    processOrderAssignment(job);
};

/**
 * Adds a notification to the queue to be sent to a user.
 * @param job The details of the notification job.
 */
export const addNotificationToQueue = (job: NotificationJob) => {
    console.log(`[Queue Producer] Adding job to 'notification' queue for user: ${job.userId}`);
    // In a real app: await notificationQueue.add('send-notification', job);
    
    // Simulate processing
    processNotification(job);
};

/**
 * Adds a payment to the queue for asynchronous verification.
 * @param job The details of the payment verification job.
 */
export const addPaymentToVerificationQueue = (job: PaymentVerificationJob) => {
    console.log(`[Queue Producer] Adding job to 'payment-verification' queue for order: ${job.orderId}`);
    // In a real app: await paymentVerificationQueue.add('verify-payment', job);

    // Simulate processing
    processPaymentVerification(job);
};

/**
 * Adds an analytics event to the queue for background processing.
 * @param job The details of the analytics job.
 */
export const addAnalyticsJobToQueue = (job: AnalyticsJob) => {
    console.log(`[Queue Producer] Adding job to 'analytics' queue for event: ${job.eventType}`);
    // In a real app: await analyticsQueue.add('process-event', job);
    
    // Simulate processing
    processAnalyticsEvent(job);
};
