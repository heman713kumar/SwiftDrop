import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcast } from '../websocket';

// POST /api/calls/initiate
export const initiateCall = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required to initiate a call.' });
    }

    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found or you do not have permission to call for this order.' });
    }

    if (!order.partner_id) {
        return res.status(400).json({ message: 'Cannot initiate call: no partner is assigned to this order yet.' });
    }
    
    const callId = `call_${uuidv4()}`;

    // NEW: Log the call initiation in the database
    db.createCallLog(orderId, userId, order.partner_id);

    // In a real app with WebRTC, this would involve signaling servers.
    // For our mock, we just broadcast an event that the frontend can use to show a call UI.
    broadcast({
        type: 'call.initiated',
        payload: {
            callId,
            orderId,
            from: userId,
            to: order.partner_id,
        },
    });

    console.log(`[BACKEND] User ${userId} initiated call ${callId} for order ${orderId}`);

    res.status(200).json({ 
        message: 'Call initiated successfully.',
        callId,
    });
};