import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Import all schemas
export * from './schema/patients';
export * from './schema/dental';
export * from './schema/inpatient';
export * from './schema/icu';
export * from './schema/pediatrics';
export * from './schema/physicalTherapy';
export * from './schema/billing';
export * from './schema/auth';
export * from './schema/communication';

// Database configuration
let dbInstance: ReturnType<typeof drizzle>;

try {
  const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  dbInstance = drizzle(pool);
  console.log('✅ Database connected successfully');
} catch (error) {
  console.warn('⚠️  Database connection failed - running in demo mode without database');
  console.warn('To enable full functionality, configure PostgreSQL and update .env file');
  console.warn('Connection error:', error);
  
  // Create a mock database instance for demo purposes
  dbInstance = {} as ReturnType<typeof drizzle>;
}

// Export db instance
export const db = dbInstance;
export default db;