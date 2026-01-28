import { createHonoApp } from '@/lib/hono';
import { sessionCheck } from '@/middlewares/auth';
import type { App } from '@/types';
import { createEmployeeRoute } from './create';


export function employeeRoutes(app: App) {
  const employeeRoute = createHonoApp();

  employeeRoute.use('*', sessionCheck);

  createEmployeeRoute(app, employeeRoute);
 

  return employeeRoute;
}