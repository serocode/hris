export const POSTGRES_DB = process.env.POSTGRES_DB || 'hris';
export const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
export const POSTGRES_USER = process.env.POSTGRES_USER || 'hris_admin';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'hris_password';
export const API_PORT = process.env.API_PORT
  ? Number(process.env.API_PORT)
  : 3333;