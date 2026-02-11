import { createHonoApp } from '@/lib/hono';
import type { App } from '@/types';
import { employeeRoutes } from './employees';
import { meRoutes } from './me';

export function v1Routes(app: App) {
  const v1 = createHonoApp();

  v1.route('/employees', employeeRoutes(app));
  v1.route('/me', meRoutes(app));
  
  return v1;
}