import dotenv from 'dotenv';
import pool from './db/pool.js';
import { fetchNewCollections } from './scanner/opensea.js';
import { matchCollectionToX } from './scanner/xmatcher.js';
import { normalizeCollection } from './scanner/normalizer.js';
dotenv.config();

const SCAN_INTERVAL_MS = Number(process.env.SCAN_INTERVAL_MS) || 120000;

async function scanAndStore() {
  console.log('🔄 Scanning OpenSea...');
  try {
    const collections = await fetchNewCollections(['ethereum', 'arbitrum'], 20);
    for (const raw of collections) {
      const normalized = normalizeCollection(raw, 'ethereum');
      const social = await matchCollectionToX(raw);
      await pool.query(`
        INSERT INTO collections 
        (chain, contract_address, name, slug, creator_address, created_date, floor_price, external_link, twitter_handle, confidence, match_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (chain, contract_address) 
        DO UPDATE SET twitter_handle = EXCLUDED.twitter_handle, confidence = EXCLUDED.confidence, match_method = EXCLUDED.match_method
      `, [
        normalized.chain, normalized.contract_address, normalized.name, normalized.slug,
        normalized.creator_address, normalized.created_date, normalized.floor_price,
        normalized.external_link, social.twitter_handle, social.confidence, social.match_method
      ]);
    }
    console.log(`✅ Stored ${collections.length} collections.`);
  } catch (err) {
    console.error('❌ Worker error:', err);
  }
}

scanAndStore();
setInterval(scanAndStore, SCAN_INTERVAL_MS);
