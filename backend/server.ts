import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeWebSocketServer, broadcast } from './websocket';
import * as db from './db';
import { initializeWorkers } from './workers';
import { initializeFirebaseAdmin } from './firebaseAdmin';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import orderRoutes from './routes/order';
import matchingRoutes from './routes/matching';
import partnerRoutes from './routes/partner';
import chatRoutes from './routes/chat';
import callRoutes from './routes/call';
import notificationRoutes from './routes/notification';
import settingsRoutes from './routes/settings';
import mediaRoutes from './routes/media';
import analyticsRoutes from './routes/analytics';
import supportRoutes from './routes/support';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

// --- Production Database Connection ---
// In a real-world application, the database connection would be established here.
// A connection pool (e.g., using the 'pg' library's Pool) would be created
// to efficiently manage connections to the PostgreSQL database.
//
// Example:
// import { Pool } from 'pg';
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });
// pool.connect().then(() => console.log('PostgreSQL connected...'));
//
// The Redis client would also be initialized here.
// import { createClient } from 'redis';
// const redisClient = createClient({ url: process.env.REDIS_URL });
// redisClient.on('error', err => console.log('Redis Client Error', err));
// redisClient.connect().then(() => console.log('Redis connected...'));
// ---

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportRoutes);


// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('SwiftDrop Backend is running!');
});

const httpServer = createServer(app);
initializeWebSocketServer(httpServer); // Initialize WebSocket server

const startPartnerLocationSimulator = () => {
    setInterval(() => {
        const activeOrders = db.findActiveOrders();
        if (activeOrders.length === 0) return;
        
        for (const order of activeOrders) {
            if (order.partner_id) {
                const partner = db.findPartnerById(order.partner_id);
                if (partner) {
                    // Jiggle location slightly to simulate movement
                    const newLat = partner.current_latitude + (Math.random() - 0.5) * 0.001;
                    const newLng = partner.current_longitude + (Math.random() - 0.5) * 0.001;
                    
                    db.updatePartnerLocation(partner.id, newLat, newLng);
                    
                    broadcast({
                        type: 'location.updated',
                        payload: {
                            orderId: order.id,
                            partnerId: partner.id,
                            lat: newLat,
                            lng: newLng,
                        }
                    });
                }
            }
        }
    }, 3000); // Broadcast an update every 3 seconds
    console.log('[Simulator] Partner location simulator started.');
};


httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  initializeWorkers(); // NEW: Start the background job processors.
  startPartnerLocationSimulator();
});