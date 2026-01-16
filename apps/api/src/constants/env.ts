export const POSTGRES_DB = process.env.POSTGRES_DB || 'hris';
export const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
export const POSTGRES_USER = process.env.POSTGRES_USER || 'hris_admin';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'hris_password';
export const API_PORT = process.env.API_PORT
  ? Number(process.env.API_PORT)
  : 3333;
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'https://api.hris.localhost';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
export const NODE_ENV = process.env.NODE_ENV || 'development';