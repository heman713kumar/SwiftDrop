
import { Request, Response } from 'express';
import * as db from '../db';
import { TrackingPoint } from '../../types';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcast } from '../websocket';
import { addNotificationToQueue } from '../queues';

// FIX: Use standard express types for req and res.
export const createOrder = (req: Request, res: Response) => {
    // FIX: Cast req to AuthenticatedRequest to access custom 'user' property.
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        // FIX: .status and .json are now available on express.Response.
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // FIX: .body is now available on express.Request.
    const orderDetails = req.body;
    if (!orderDetails.serviceType || !orderDetails.pickupLocation || !orderDetails.deliveryLocation || !orderDetails.priceBreakdown) {
        return res.status(400).json({ message: 'Missing required order details.' });
    }

    const newOrder = db.createOrder(userId, orderDetails);
    console.log(`[BACKEND] Created new order ${newOrder.id} for user ${userId}`);

    // NEW: Instead of broadcasting synchronously, add a notification job to the queue.
    // This makes the API response faster and the notification system more resilient.
    addNotificationToQueue({
        userId: newOrder.customer_id,
        type: 'order_status',
        title: `Order #${newOrder.id.slice(6, 12)} Placed`,
        body: `Your ${newOrder.service_type} order has been successfully placed. We are now finding a delivery partner.`
    });

    res.status(201).json({ id: newOrder.id });
};

// FIX: Use standard express types for req and res.
export const listOrders = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const orders = db.findOrdersByUserId(userId);
    res.status(200).json(orders);
};

// FIX: Use standard express types for req and res.
export const getOrderDetails = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    // FIX: .params is now available on express.Request.
    const { id: orderId } = req.params;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json(order);
};

// FIX: Use standard express types for req and res.
export const cancelOrder = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { id: orderId } = req.params;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Completed') {
        return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}.` });
    }

    db.updateOrderStatus(orderId, 'Cancelled');
    console.log(`[BACKEND] Cancelled order ${orderId} for user ${userId}`);

    res.status(200).json({ message: 'Order cancelled successfully.' });
};

// FIX: Use standard express types for req and res.
export const getTracking = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { id: orderId } = req.params;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    // Simulate tracking events if none exist
    if (db.findOrderTrackingHistory(orderId).length === 0) {
        db.addOrderTrackingEvent(orderId, order.pickup_location.lat || 6.69, order.pickup_location.lng || -1.62, 'Rider Assigned');
        db.addOrderTrackingEvent(orderId, 6.70, -1.63, 'On The Way');
    }

    const history = db.findOrderTrackingHistory(orderId);
    const trackingHistory: TrackingPoint[] = history.map(h => ({
        latitude: h.latitude,
        longitude: h.longitude,
        status: h.status,
        timestamp: h.timestamp.toISOString()
    }));
    
    const trackingData = {
        orderId: order.id,
        status: order.status,
        rider: {
            name: "Kofi Mensah",
            vehicle: "Honda Motorbike - GE-123-23",
        },
        history: trackingHistory,
    };

    res.status(200).json(trackingData);
};

// FIX: Use standard express types for req and res.
export const rateOrder = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { id: orderId } = req.params;
    const { rating, review } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }
    
    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found.' });
    }
    
    if (order.status !== 'Delivered' && order.status !== 'Completed') {
        return res.status(400).json({ message: 'Can only rate delivered orders.' });
    }
    
    if (!order.partner_id) {
        return res.status(400).json({ message: 'Cannot rate an order with no assigned partner.' });
    }

    db.createOrderRating(orderId, userId, order.partner_id, rating, review || null);
    db.updateOrderStatus(orderId, 'Completed');
    console.log(`[BACKEND] User ${userId} rated order ${orderId} with ${rating} stars.`);
    
    res.status(200).json({ message: 'Thank you for your feedback!' });
};

// FIX: Use standard express types for req and res.
export const disputeOrder = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { id: orderId } = req.params;
    const { reason, description } = req.body;
     if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!reason) {
        return res.status(400).json({ message: 'A reason for the dispute is required.' });
    }
    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found.' });
    }
    
    db.createOrderDispute(orderId, userId, reason, description || '');
    console.log(`[BACKEND] User ${userId} created dispute for order ${orderId} with reason: ${reason}`);

    res.status(200).json({ message: 'Dispute logged successfully. Our team will contact you shortly.' });
};

export const simulateOrderProgress = (req: Request, res: Response) => {
    const { id: orderId } = req.params;
    const order = db.findOrderById(orderId);

    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }
    if (!order.partner_id) {
        return res.status(400).json({ message: 'No partner assigned to this order yet.' });
    }

    const partner = db.findPartnerById(order.partner_id);

    switch (order.status) {
        case 'Assigned':
            broadcast({ type: 'partner.arriving_pickup', payload: { orderId } });
            db.updateOrderStatus(orderId, 'On The Way');
            broadcast({ 
                type: 'partner.on_the_way', 
                payload: { orderId, message: `Your rider, ${partner?.name}, is heading to the pickup location.` } 
            });
            console.log(`[Simulator] Order ${orderId} progressed to: On The Way to pickup.`);
            res.status(200).json({ message: 'Order progressed to: On The Way to pickup.' });
            break;

        case 'On The Way':
            broadcast({ type: 'pickup.completed', payload: { orderId } });
            db.updateOrderStatus(orderId, 'Delivered');
            broadcast({
                type: 'delivery.completed',
                payload: { orderId, message: 'Your order has been delivered successfully!' }
            });
            console.log(`[Simulator] Order ${orderId} progressed to: Delivered.`);
            res.status(200).json({ message: 'Order progressed to: Delivered.' });
            break;
            
        default:
            res.status(400).json({ message: `Order is already in a final state (${order.status}) and cannot be progressed.` });
    }
};