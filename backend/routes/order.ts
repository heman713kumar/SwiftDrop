import express from 'express';
import { 
    createOrder,
    listOrders,
    getOrderDetails,
    cancelOrder,
    getTracking,
    rateOrder,
    disputeOrder,
    simulateOrderProgress,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protect all order-related routes
// FIX: Middleware is now compatible due to signature change in middleware/auth.ts
router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/cancel', cancelOrder);
router.get('/:id/tracking', getTracking);
router.post('/:id/rate', rateOrder);
router.post('/:id/dispute', disputeOrder);
router.post('/:id/simulate-progress', simulateOrderProgress);

export default router;