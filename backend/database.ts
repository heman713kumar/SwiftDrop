// This file manages the connection to the PostgreSQL database.
import { Pool } from 'pg';

// These values are now read from environment variables, which will be set by Cloud Run Secrets.
// This is more secure and flexible than hardcoding them.
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST; // e.g., 'aws-1-eu-north-1.pooler.supabase.com'
const dbProjectRef = process.env.DB_PROJECT_REF; // e.g., 'mlisaewbgssgbumndiqc'

if (!dbPassword || !dbHost || !dbProjectRef) {
    console.error('[Database] Missing required database environment variables (DB_PASSWORD, DB_HOST, DB_PROJECT_REF).');
    // For local development, you would typically use a .env file.
    // In production on Cloud Run, these must be set.
}

// Constructs the connection string dynamically from environment variables.
const connectionString = `postgresql://postgres.${dbProjectRef}:${dbPassword}@${dbHost}:6543/postgres`;

export const pool = new Pool({
    connectionString: connectionString,
    // Supabase recommends these settings for the transaction pooler
    ssl: {
        rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('[Database] PostgreSQL connected successfully via pool.');
});

pool.on('error', (err) => {
    console.error('[Database] Unexpected error on idle PostgreSQL client', err);
    // FIX: Removed the triple-slash directive for node types which was causing a "Cannot find type definition file for 'node'" error.
    // Cast 'process' to 'any' to bypass the TypeScript error for the 'exit' property.
    (process as any).exit(-1);
});

// A helper function to easily query the database
export const query = (text: string, params?: any[]) => pool.query(text, params);