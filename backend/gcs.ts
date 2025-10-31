// MOCK Google Cloud Storage service
// In a real application, this file would use the `@google-cloud/storage` library
// to interact with a real GCS bucket.

import { Buffer } from 'buffer';

// Assume this is set in your environment variables
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'swiftdrop-ghana-media';
const GCS_PUBLIC_URL_BASE = `https://storage.googleapis.com/${GCS_BUCKET_NAME}`;

/**
 * Simulates uploading a file buffer to Google Cloud Storage.
 * @param buffer The file content as a Buffer.
 * @param destination The path and filename in the bucket (e.g., 'profile_photos/user123/image.jpg').
 * @returns A promise that resolves with the public URL of the "uploaded" file.
 */
export const uploadFile = (buffer: Buffer, destination: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!buffer || !destination) {
            return reject(new Error('Buffer and destination are required for upload.'));
        }

        // Simulate the async nature of an upload
        setTimeout(() => {
            const publicUrl = `${GCS_PUBLIC_URL_BASE}/${destination}`;
            console.log(`[GCS MOCK] "Uploaded" ${buffer.length} bytes to gs://${GCS_BUCKET_NAME}/${destination}`);
            console.log(`[GCS MOCK] Public URL: ${publicUrl}`);
            resolve(publicUrl);
        }, 300); // Simulate a 300ms network delay
    });
};

/**
 * Simulates deleting a file from Google Cloud Storage.
 * @param filePath The full path of the file within the bucket (e.g., 'profile_photos/user123/image.jpg').
 * @returns A promise that resolves when the "deletion" is complete.
 */
export const deleteFile = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!filePath) {
            return reject(new Error('File path is required for deletion.'));
        }

        // Simulate async deletion
        setTimeout(() => {
            console.log(`[GCS MOCK] "Deleted" file from gs://${GCS_BUCKET_NAME}/${filePath}`);
            resolve();
        }, 200); // Simulate a 200ms network delay
    });
};