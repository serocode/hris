import { createHonoApp } from '@/lib/hono';
import type { App } from '@/types';
import { employeeRoutes } from './employees';

export function v1Routes(app: App) {
  const v1 = createHonoApp();

  v1.route('/employees', employeeRoutes(app));
  
  return v1;
}