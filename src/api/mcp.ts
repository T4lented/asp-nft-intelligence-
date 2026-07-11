import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import pool from '../db/pool.js';

export function setupMCP(fastify: any) {
  const server = new McpServer({ name: 'nft-intelligence-asp', version: '1.0.0' });

  server.tool(
    'scan_new_collections_with_socials',
    'Returns recently discovered NFT collections with pre-enriched X/Twitter handles.',
    {
      chains: z.array(z.enum(['ethereum', 'arbitrum'])).default(['ethereum']),
      limit: z.number().int().min(1).max(50).default(10),
    },
    async ({ chains, limit }) => {
      try {
        const placeholders = chains.map((_, i) => `$${i + 1}`).join(',');
        const res = await pool.query(
          `SELECT * FROM collections WHERE chain IN (${placeholders}) ORDER BY created_date DESC LIMIT $${chains.length + 1}`,
          [...chains, limit]
        );
        return { content: [{ type: 'text', text: JSON.stringify({ source: 'database', data: res.rows }) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  let transport: SSEServerTransport | null = null;
  fastify.get('/sse', async (req: any, reply: any) => {
    transport = new SSEServerTransport('/message', reply.raw);
    await server.connect(transport);
  });
  fastify.post('/message', async (req: any, reply: any) => {
    if (transport) await transport.handlePostMessage(req, reply);
    else reply.status(400).send('No active SSE connection');
  });
}
