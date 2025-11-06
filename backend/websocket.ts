import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';
import * as jwt from './jwt';

let io: SocketIOServer;

export const initializeWebSocketServer = (server: Server) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*", // In production, restrict this to the frontend URL
            methods: ["GET", "POST"]
        }
    });

    // Optional: Middleware to authenticate connections
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        if (token) {
            const payload = jwt.verifyToken(token);
            if (payload && payload.userId) {
                // Attach user info to the socket for later use
                (socket as any).userId = payload.userId;
                return next();
            }
        }
        // Allows unauthenticated connections for now, but logs it
        console.log(`[Socket.io] Unauthenticated connection attempt from ${socket.id}.`);
        next();
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        if (userId) {
            console.log(`[Socket.io] Authenticated client connected: ${socket.id}, User: ${userId}`);
            // Join a room specific to the user for targeted messages
            socket.join(userId);
        } else {
            console.log(`[Socket.io] Anonymous client connected: ${socket.id}`);
        }

        socket.on('disconnect', () => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        });

        socket.on('error', (error) => {
            console.error('[Socket.io] Error:', error);
        });
    });

    console.log('[Socket.io] Server initialized and attached to HTTP server.');
};

/**
 * Broadcasts an event to all connected clients using a Pub/Sub model.
 * The 'type' field of the data object is used as the event name.
 * @param data An object with 'type' and 'payload' properties.
 */
export const broadcast = (data: { type: string, payload: any }) => {
    if (!io) {
        console.error('[Socket.io] Server not initialized. Cannot broadcast.');
        return;
    }

    const { type, payload } = data;
    io.emit(type, payload);
    console.log(`[Socket.io] Broadcasted event '${type}' to all clients.`);
};

/**
 * Sends a targeted event to a specific user.
 * @param userId The ID of the user to target.
 * @param event The event object with 'type' and 'payload'.
 */
export const sendToUser = (userId: string, event: { type: string, payload: any }) => {
    if (!io) {
        console.error('[Socket.io] Server not initialized. Cannot send targeted event.');
        return;
    }
    const { type, payload } = event;
    io.to(userId).emit(type, payload);
    console.log(`[Socket.io] Sent event '${type}' to user ${userId}.`);
};