
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeWebSocketServer, broadcast } from './websocket';
import * as db from './db';
import { initializeWorkers } from './workers';
import { initializeFirebaseAdmin } from './firebaseAdmin';
import { pool } from './database'; // Import the pool to initialize it
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
// The connection pool is now managed in 'database.ts' and imported here.
// The mock data store in 'db.ts' is still used for business logic, but the
// foundation for a real database connection is now in place.
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('[Database] Connection test failed.', err.stack);
    } else {
        console.log('[Database] Connection test successful. Current time:', res.rows[0].now);
    }
});
// ---

// Middleware
// Fix: Use namespace-qualified express types to avoid global type conflicts.
// FIX: Import Request, Response, NextFunction from express to fix type errors
app.use((req: Request, res: Response, next: NextFunction) => {
    // This header helps prevent the "Cross-Origin-Opener-Policy policy would block the window.closed call" error
    // by allowing popups (like the Google Sign-In window) to interact with the main window.
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});
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
// Fix: Use namespace-qualified express types to avoid global type conflicts.
// FIX: Import Request and Response from express to fix type errors
app.get('/', (req: Request, res: Response) => {
  res.send('SwiftDrop Backend is running!');
});

const httpServer = createServer(app);
initializeWebSocketServer(httpServer); // Initialize WebSocket server

const startPartnerLocationSimulator = () => {
    setInterval(() => {
        // FIX: Implemented findActiveOrders in db.ts
        const activeOrders = db.findActiveOrders();
        if (activeOrders.length === 0) return;
        
        for (const order of activeOrders) {
            if (order.partner_id) {
                // FIX: Implemented findPartnerById in db.ts
                const partner = db.findPartnerById(order.partner_id);
                if (partner) {
                    // Jiggle location slightly to simulate movement
                    const newLat = partner.current_latitude + (Math.random() - 0.5) * 0.001;
                    const newLng = partner.current_longitude + (Math.random() - 0.5) * 0.001;
                    
                    // FIX: Implemented updatePartnerLocation in db.ts
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
