import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import * as db from '../db';
import * as gcs from '../gcs';
import { AuthenticatedRequest } from '../middleware/auth';

// POST /api/media/upload
export const uploadMedia = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // In a real app, you'd use middleware like 'multer' for multipart/form-data.
    // For this mock, we expect a base64 encoded string.
    const { file, fileName, fileType } = req.body;
    
    if (!file || !fileName || !fileType) {
        return res.status(400).json({ message: 'File data, file name, and file type are required.' });
    }
    
    const allowedTypes = ['profile_photo', 'package_photo'];
    if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({ message: 'Invalid file type.' });
    }
    
    try {
        const buffer = Buffer.from(file, 'base64');
        const destination = `${fileType}/${userId}/${uuidv4()}-${fileName}`;
        
        // "Upload" the file to our mock GCS service
        const publicUrl = await gcs.uploadFile(buffer, destination);
        
        // Save the public URL in our database.
        const newMediaRecord = db.createMediaRecord({ 
            userId, 
            fileType, 
            fileName,
            url: publicUrl // Use the real GCS URL
        });
        
        // If it's a profile photo, update the user's record with the new URL.
        if (fileType === 'profile_photo') {
            db.updateUser(userId, { profile_photo_url: newMediaRecord.url });
        }
        
        console.log(`[BACKEND] User ${userId} uploaded ${fileType} to GCS: ${newMediaRecord.url}`);
        
        res.status(201).json({
            message: 'File uploaded successfully.',
            media: newMediaRecord
        });

    } catch (error) {
        console.error('[BACKEND] Error during file upload:', error);
        res.status(500).json({ message: 'Failed to upload file.' });
    }
};

// DELETE /api/media/:id
export const deleteMedia = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id: mediaId } = req.params;
    const mediaRecord = db.findMediaById(mediaId);
    
    if (!mediaRecord) {
        return res.status(404).json({ message: 'Media not found.' });
    }
    
    // Security check: Ensure the user owns the media they are trying to delete.
    if (mediaRecord.user_id !== userId) {
        return res.status(403).json({ message: 'You do not have permission to delete this file.' });
    }
    
    try {
        // Extract the file path from the full GCS URL
        // e.g., https://storage.googleapis.com/bucket-name/profile_photo/user_id/file.jpg -> profile_photo/user_id/file.jpg
        const urlParts = new URL(mediaRecord.url);
        const gcsPath = urlParts.pathname.substring(urlParts.pathname.indexOf('/', 1) + 1);

        // Delete from GCS first
        await gcs.deleteFile(gcsPath);
        
        // If deleting the current profile photo, unlink it from the user record.
        const user = db.findUserById(userId);
        if (user && user.profile_photo_url === mediaRecord.url) {
            db.updateUser(userId, { profile_photo_url: null });
        }
        
        // Then delete the record from our database
        db.deleteMediaRecord(mediaId);
        
        console.log(`[BACKEND] User ${userId} deleted media from GCS and DB: ${mediaId}`);
        
        res.status(204).send();

    } catch (error) {
        console.error(`[BACKEND] Failed to delete media ${mediaId}:`, error);
        res.status(500).json({ message: 'Failed to delete file.' });
    }
};