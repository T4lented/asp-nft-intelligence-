import axios from 'axios';
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

export async function fetchNewCollections(chains: string[], limit = 20) {
  const chain = chains[0] || 'ethereum';
  try {
    const response = await axios.get(`https://api.opensea.io/api/v2/collections`, {
      headers: { 'X-API-KEY': OPENSEA_API_KEY },
      params: { chain, order_by: 'created_date', order_direction: 'desc', limit }
    });
    return response.data.collections.map((item: any) => ({
      contract_address: item.primary_asset_contracts?.[0]?.address || 'unknown',
      name: item.name,
      slug: item.slug,
      creator_address: item.creator?.address || null,
      created_date: item.created_date,
      floor_price: item.stats?.floor_price || null,
      external_link: item.external_link || null,
      twitter_username: item.twitter_username || null
    }));
  } catch (error) {
    console.error('OpenSea error:', error.message);
    throw error;
  }
}
