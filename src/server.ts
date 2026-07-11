import fastify from 'fastify';
import dotenv from 'dotenv';
import { runMigrations } from './db/migrate.js';
import { setupMCP } from './api/mcp.js';
dotenv.config();

const app = fastify({ logger: true });

app.get('/health', async () => ({ status: 'ok' }));
setupMCP(app);

await runMigrations();

const PORT = process.env.PORT || 3000;
app.listen({ port: Number(PORT), host: '0.0.0.0' }, (err) => {
  if (err) process.exit(1);
  console.log(`🚀 ASP running on port ${PORT}`);
});
