import { Request, Response } from 'express';
import * as db from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcast } from '../websocket';

// POST /api/chat/send
export const sendChatMessage = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { orderId, message } = req.body;
    if (!orderId || !message) {
        return res.status(400).json({ message: 'Order ID and message are required.' });
    }

    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found or you do not have permission to chat for this order.' });
    }
    
    // In a real app, you'd check if the sender is the customer or the assigned partner.
    // Here, we assume the sender is the customer.
    const newMessage = db.createChatMessage(orderId, userId, 'customer', message);

    // Broadcast the new message event
    broadcast({
        type: 'chat.message.new',
        payload: newMessage,
    });
    
    console.log(`[BACKEND] User ${userId} sent message for order ${orderId}: "${message}"`);
    res.status(201).json(newMessage);
};

// GET /api/chat/:order_id/messages
export const getChatMessages = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { order_id: orderId } = req.params;
    const order = db.findOrderById(orderId);
    if (!order || order.customer_id !== userId) {
        return res.status(404).json({ message: 'Order not found or you do not have permission to view this chat.' });
    }
    
    const messages = db.findChatMessagesByOrderId(orderId);
    res.status(200).json(messages);
};