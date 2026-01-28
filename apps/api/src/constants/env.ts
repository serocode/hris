
export const API_PORT = process.env.API_PORT
  ? Number(process.env.API_PORT)
  : 3333;
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'https://api.hris.localhost';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Redis Configuration
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT
  ? Number(process.env.REDIS_PORT)
  : 6379;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'hris-master-password';
export const REDIS_USERNAME = process.env.REDIS_USERNAME || 'default';
export const REDIS_DB = process.env.REDIS_DB
  ? Number(process.env.REDIS_DB)
  : 0;

// Postgres Configuration
export const POSTGRES_DB = process.env.POSTGRES_DB || 'hris';
export const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
export const POSTGRES_USER = process.env.POSTGRES_USER || 'hris_admin';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'hris_password';

// SMTP Configuration
export const SMTP_HOST = process.env.SMTP_HOST ?? 'localhost';
export const SMTP_PORT = Number(process.env.SMTP_PORT);