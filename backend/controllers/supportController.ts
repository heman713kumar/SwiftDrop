import { Request, Response } from 'express';
import * as db from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { SupportTicket, SupportMessage, FaqItem } from '../../types';

// POST /api/support/tickets
export const createTicket = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { subject, description } = req.body;
    if (!subject || !description) {
        return res.status(400).json({ message: 'Subject and description are required.' });
    }

    const newTicket = db.createSupportTicket(userId, subject, description);

    // Create an initial message from the user's description
    db.createSupportMessage(newTicket.id, userId, 'customer', description);

    res.status(201).json(newTicket);
};

// GET /api/support/tickets
export const listTickets = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const tickets = db.findSupportTicketsByUserId(userId);
    res.status(200).json(tickets);
};

// GET /api/support/tickets/:id
export const getTicketDetails = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: ticketId } = req.params;
    const ticket = db.findSupportTicketById(ticketId);

    if (!ticket || ticket.user_id !== userId) {
        return res.status(404).json({ message: 'Support ticket not found.' });
    }

    const messages = db.findSupportMessagesByTicketId(ticketId);
    
    // Combine ticket info with its messages
    const ticketDetails: SupportTicket = {
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at.toISOString(),
        updatedAt: ticket.updated_at.toISOString(),
        messages: messages.map(msg => ({
            id: msg.id,
            ticketId: msg.ticket_id,
            senderId: msg.sender_id,
            senderType: msg.sender_type,
            message: msg.message,
            timestamp: msg.timestamp.toISOString(),
        })),
    };

    res.status(200).json(ticketDetails);
};

// POST /api/support/tickets/:id/messages
export const addMessageToTicket = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: ticketId } = req.params;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    const ticket = db.findSupportTicketById(ticketId);
    if (!ticket || ticket.user_id !== userId) {
        return res.status(404).json({ message: 'Support ticket not found.' });
    }

    if (ticket.status === 'Closed') {
        return res.status(400).json({ message: 'Cannot add messages to a closed ticket.' });
    }
    
    // We assume the message is from the customer
    const newMessage = db.createSupportMessage(ticketId, userId, 'customer', message);
    
    // Mock an agent's reply after a short delay
    setTimeout(() => {
        db.createSupportMessage(ticketId, 'agent_01', 'agent', 'Thank you for your message. An agent will review your request and get back to you shortly.');
    }, 2000);

    const responseMessage: SupportMessage = {
        id: newMessage.id,
        ticketId: newMessage.ticket_id,
        senderId: newMessage.sender_id,
        senderType: newMessage.sender_type,
        message: newMessage.message,
        timestamp: newMessage.timestamp.toISOString(),
    };

    res.status(201).json(responseMessage);
};

// GET /api/support/faq
export const listFaqs = (req: Request, res: Response) => {
    const faqs = db.findAllFaqs();
    res.status(200).json(faqs);
};