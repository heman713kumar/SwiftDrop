// In a real application, this file would define the "Workers" or "Consumers".
// These would run in separate, scalable processes, listening for jobs on the message queues
// (e.g., BullMQ workers listening to Redis) and executing the business logic for each job.

import * as db from './db';
import { broadcast } from './websocket';
import { OrderAssignmentJob, NotificationJob, PaymentVerificationJob, AnalyticsJob } from './queues';

// ===================================================================================
// == WORKER PROCESS LOGIC
// ===================================================================================

/**
 * Worker process for the 'order-assignment' queue.
 * Finds the best partner for an order and assigns them.
 */
export const processOrderAssignment = async (job: OrderAssignmentJob) => {
    console.log(`[Worker] Processing 'order-assignment' job for order: ${job.orderId}`);
    
    // Simulate the time it takes to run the matching algorithm
    await new Promise(resolve => setTimeout(resolve, 2000));

    const order = db.findOrderById(job.orderId);
    if (!order || order.status !== 'Placed') {
        console.error(`[Worker] Order ${job.orderId} not found or not in 'Placed' state. Aborting assignment.`);
        return;
    }

    const availablePartners = db.findAvailablePartners();

    if (availablePartners.length === 0) {
        console.log(`[Worker] No available partners found for order ${job.orderId}. Will retry later.`);
        // In a real app, you might re-queue the job with a delay.
        return;
    }

    // Simple distance calculation (not geographically accurate, but fine for mock)
    const calculateDistance = (loc1: { lat?: number; lng?: number }, loc2: { lat: number; lng: number }): number => {
        if (loc1.lat === undefined || loc1.lng === undefined) return Infinity;
        const dx = loc1.lat - loc2.lat;
        const dy = loc1.lng - loc2.lng;
        return Math.sqrt(dx * dx + dy * dy);
    };

    let closestPartner = null;
    let minDistance = Infinity;

    for (const partner of availablePartners) {
        const distance = calculateDistance(order.pickup_location, { lat: partner.current_latitude, lng: partner.current_longitude });
        if (distance < minDistance) {
            minDistance = distance;
            closestPartner = partner;
        }
    }

    if (closestPartner) {
        db.assignPartnerToOrder(closestPartner.id, order.id);
        const etaMinutes = Math.round(minDistance * 200) + 5; // Mock ETA calculation
        
        console.log(`[Worker] Assigned partner ${closestPartner.name} to order ${order.id}.`);

        // Broadcast the result to the frontend via WebSocket
        broadcast({
            type: 'partner.assigned',
            payload: {
                orderId: order.id,
                partner: {
                    id: closestPartner.id,
                    name: closestPartner.name,
                    vehicle: closestPartner.vehicle_type,
                },
                etaMinutes,
            }
        });
    } else {
        console.log(`[Worker] Could not determine a suitable partner for order ${order.id}.`);
    }
};

/**
 * Worker process for the 'notification' queue.
 * Sends notifications to users via their preferred channels.
 */
export const processNotification = async (job: NotificationJob) => {
    console.log(`[Worker] Processing 'notification' job for user: ${job.userId}, title: ${job.title}`);
    
    // 1. Log the notification in the database for history
    db.createNotificationLog(job.userId, job.type, job.title, job.body);
    
    // 2. In a real app, you would fetch user's device tokens and notification preferences
    // const preferences = db.findNotificationPreferencesByUserId(job.userId);
    // const tokens = db.findDeviceTokensByUserId(job.userId);
    
    // 3. Then, send the notification via the appropriate service (FCM, Twilio, SendGrid, etc.)
    // For this mock, we just log that it would happen.
    console.log(`[Worker] Would send push/SMS/email for notification: "${job.body}"`);
    
    // We can also broadcast a WebSocket event for real-time in-app notifications
    broadcast({ type: 'notification.new', payload: job });
};

/**
 * Worker process for the 'payment-verification' queue.
 * Verifies a payment with a third-party gateway.
 */
export const processPaymentVerification = async (job: PaymentVerificationJob) => {
    console.log(`[Worker] Processing 'payment-verification' for order: ${job.orderId}`);
    
    // Simulate API call to payment gateway
    await new Promise(resolve => setTimeout(resolve, 3000));
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate

    if (isPaymentSuccessful) {
        console.log(`[Worker] Payment verified for order ${job.orderId}.`);
        // Add a notification job for the user
        const order = db.findOrderById(job.orderId);
        if(order) {
            processNotification({
                userId: order.customer_id,
                type: 'order_status',
                title: 'Payment Successful',
                body: `Your payment for order #${job.orderId.slice(6,12)} has been confirmed.`
            });
        }
    } else {
        console.error(`[Worker] Payment FAILED for order ${job.orderId}.`);
        // Handle payment failure logic (e.g., notify user, cancel order)
    }
};

/**
 * Worker process for the 'analytics' queue.
 * Logs analytics events to the database.
 */
export const processAnalyticsEvent = async (job: AnalyticsJob) => {
    console.log(`[Worker] Processing 'analytics' job for event: ${job.eventType}`);
    
    // This worker's job is to simply write the event to the database.
    // In a more complex system, it might aggregate data or forward it to a
    // dedicated analytics service like Google Analytics or Mixpanel.
    db.createEventLog(job.userId, job.eventType, job.payload);
};


// ===================================================================================
// == WORKER INITIALIZATION
// ===================================================================================

/**
 * Simulates the startup of all worker processes. In a real app, each worker
 * would be a separate Node.js process.
 */
export const initializeWorkers = () => {
    console.log('[Worker Host] Initializing and starting all background workers...');
    // In a real app using BullMQ, this is where you would instantiate the Worker classes:
    // new Worker('order-assignment', processOrderAssignment, { connection: redisConnection });
    // new Worker('notification', processNotification, { connection: redisConnection });
    // new Worker('payment-verification', processPaymentVerification, { connection: redisConnection });
    // new Worker('analytics', processAnalyticsEvent, { connection: redisConnection });
    console.log('[Worker Host] All workers are now listening for jobs.');
};
