import express from 'express';
import {
    createTicket,
    listTickets,
    getTicketDetails,
    addMessageToTicket,
    listFaqs,
} from '../controllers/supportController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public endpoint, no auth required
router.get('/faq', listFaqs);

// All subsequent routes require a user to be logged in
router.use(authMiddleware);

router.post('/tickets', createTicket);
router.get('/tickets', listTickets);
router.get('/tickets/:id', getTicketDetails);
router.post('/tickets/:id/messages', addMessageToTicket);

export default router;