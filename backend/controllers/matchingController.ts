
import { Request, Response } from 'express';
import * as db from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcast } from '../websocket';
import { addOrderToAssignmentQueue } from '../queues';


// POST /api/matching/find-partner
export const findPartner = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required.' });
    }

    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found or does not belong to user.' });
    }

    if (order.status !== 'Placed') {
        return res.status(400).json({ message: 'A partner has already been assigned or this order is not in a findable state.' });
    }

    // NEW: Instead of synchronously finding a partner, add a job to the queue.
    // The worker will handle the matching process asynchronously.
    addOrderToAssignmentQueue({ orderId: order.id });

    // Return an immediate response to the client.
    // The client will be updated via WebSocket when a partner is found.
    res.status(202).json({ 
        message: 'Partner search initiated. You will be notified shortly.' 
    });
};
