import pool from './pool.js';

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        chain VARCHAR(20) NOT NULL,
        contract_address VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        creator_address VARCHAR(255),
        created_date TIMESTAMP NOT NULL,
        floor_price NUMERIC,
        twitter_handle VARCHAR(255),
        confidence VARCHAR(50),
        match_method VARCHAR(255),
        external_link TEXT,
        UNIQUE(chain, contract_address)
      );
      CREATE INDEX IF NOT EXISTS idx_collections_chain_created ON collections (chain, created_date DESC);
    `);
    console.log('✅ Migrations applied.');
  } finally {
    client.release();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().then(() => process.exit(0));
}
