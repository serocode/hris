import { getLogger } from '@/middlewares/logger';

type Service = {
  name: string;
  shutdown: () => Promise<void>;
};

const logger = getLogger();

// A singleton that holds all dependencies that are being used throughout the app
// This will allow for a graceful shutdown or drain when the service stops/restarts
export function services() {
  const serviceList: Service[] = [];

  function addService(svc: Service) {
    serviceList.push(svc);
    logger.info(`[${svc.name}] - service registered`);
  }

  async function shutdown() {
    logger.info('Starting graceful shutdown of all services...');
    
    for (const svc of serviceList) {
      try {
        logger.info(`[${svc.name}] - gracefully shutting down...`);
        await svc.shutdown();
        logger.info(`[${svc.name}] - shutdown complete!`);
      } catch (error) {
        logger.error({
          error: error instanceof Error ? error.message : 'Unknown error',
          service: svc.name,
        }, `[${svc.name}] - shutdown failed`);
      }
    }
    
    logger.info('All services have been shut down');
  }

  return {
    add: addService,
    shutdown,
  };
}