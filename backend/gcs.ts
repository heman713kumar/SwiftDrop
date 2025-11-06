// MOCK Google Cloud Storage service
// In a real application, this file would use the `@google-cloud/storage` library
// to interact with a real GCS bucket, authenticated with the key from gcsServiceAccountKey.json.

import { Buffer } from 'buffer';

// UPDATED: Using a bucket name that corresponds to your correct Google Cloud Project ID.
// IMPORTANT: You must CREATE this bucket manually in your 'sdrop-authentication-project' project.
// 1. Go to the Cloud Storage browser in your Google Cloud project.
// 2. Click "Create bucket".
// 3. Name it exactly: swiftdrop-bucket-sdrop-authentication-project
// 4. Choose a region (e.g., us-central1) and use the default settings.
const GCS_BUCKET_NAME = 'swiftdrop-bucket-sdrop-authentication-project';
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