import { Request, Response } from 'express';
import * as db from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserStats } from '../../types';
import { addAnalyticsJobToQueue } from '../queues';

// GET /api/analytics/user-stats
export const getUserStats = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const analytics = db.getUserAnalytics(userId);

    if (!analytics) {
        // Return a default/zeroed out response if no analytics exist yet
        const defaultStats: UserStats = {
            totalOrders: 0,
            totalSpent: 0,
            averageRatingGiven: null,
            lastOrderDate: null,
        };
        return res.status(200).json(defaultStats);
    }

    // Map DbUserAnalytics to the UserStats DTO (Data Transfer Object) for the frontend
    const userStats: UserStats = {
        totalOrders: analytics.total_orders,
        totalSpent: analytics.total_spent,
        averageRatingGiven: analytics.average_rating_given,
        lastOrderDate: analytics.last_order_at ? analytics.last_order_at.toISOString() : null,
    };
    
    res.status(200).json(userStats);
};

// POST /api/analytics/events
export const trackEvent = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { eventType, payload } = req.body;
    if (!eventType) {
        return res.status(400).json({ message: 'Event type is required.' });
    }

    // NEW: Offload event processing to a background queue for better performance and scalability.
    addAnalyticsJobToQueue({
        userId,
        eventType,
        payload: payload || {},
    });
    
    res.status(202).json({ message: 'Event tracked successfully.' });
};
