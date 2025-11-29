import app from './app';
import config from './config/env';
import { connectDatabase } from './config/db';
import logger from './utils/logger';

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(config.port, () => {
      logger.info(`🚀 Serveur démarré sur le port ${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    logger.error('❌ Erreur fatale lors du démarrage du serveur', error);
    process.exit(1);
  }
};

startServer();
