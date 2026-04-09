const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/database');
const initSocket = require('./config/socket');

async function bootstrap() {
  await connectDatabase(env.mongoUri);

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
