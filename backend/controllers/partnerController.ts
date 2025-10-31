import { Request, Response } from 'express';
import * as db from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/partners/:id/info
export const getPartnerInfo = (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: partnerId } = req.params;
    
    const partner = db.findPartnerById(partnerId);
    if (!partner) {
        return res.status(404).json({ message: 'Partner not found.' });
    }
    
    // Security Check: Ensure this partner is actually assigned to one of the user's active orders.
    // This prevents any authenticated user from looking up any partner's details.
    const isAssigned = db.isPartnerAssignedToUser(partnerId, userId);
    if (!isAssigned) {
        return res.status(404).json({ message: 'Partner not found or not assigned to your active order.' });
    }

    // Return a subset of public-facing information
    const partnerInfo = {
        id: partner.id,
        name: partner.name,
        vehicle: partner.vehicle_type,
        rating: partner.rating,
    };
    
    res.status(200).json(partnerInfo);
};

// GET /api/partners/:id/ratings
export const getPartnerRatings = (req: Request, res: Response) => {
    const { id: partnerId } = req.params;

    const partner = db.findPartnerById(partnerId);
    if (!partner) {
        return res.status(404).json({ message: 'Partner not found.' });
    }

    const ratings = db.findRatingsByPartnerId(partnerId);

    res.status(200).json(ratings);
};