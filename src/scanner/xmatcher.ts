import axios from 'axios';
import * as cheerio from 'cheerio';

export async function matchCollectionToX(collection: any) {
  // Tier 1: Direct metadata
  if (collection.twitter_username) {
    return { twitter_handle: collection.twitter_username, confidence: 'verified_metadata', match_method: 'OpenSea metadata' };
  }
  // Tier 2: Scrape website link
  if (collection.external_link) {
    try {
      const html = await axios.get(collection.external_link, { timeout: 5000 });
      const $ = cheerio.load(html.data);
      let handle = $('meta[name="twitter:site"]').attr('content')?.replace('@', '') ||
                   $('a[href*="twitter.com"]').attr('href')?.split('/').pop();
      if (handle) {
        return { twitter_handle: handle, confidence: 'scraped_link', match_method: 'Found on website' };
      }
    } catch (e) { /* ignore */ }
  }
  // Tier 3: Fuzzy match
  return {
    twitter_handle: `@${collection.name.replace(/\s/g, '').toLowerCase()}`,
    confidence: 'low_confidence',
    match_method: 'Fuzzy name match (simulated)'
  };
}
