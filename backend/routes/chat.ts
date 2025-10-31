import express from 'express';
import { 
    sendChatMessage,
    getChatMessages,
} from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protect all chat routes
router.use(authMiddleware);

router.post('/send', sendChatMessage);
router.get('/:order_id/messages', getChatMessages);

export default router;