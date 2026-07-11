export function normalizeCollection(raw: any, chain: string) {
  return {
    chain,
    contract_address: raw.contract_address?.toLowerCase() || 'unknown',
    name: raw.name?.trim() || 'Unnamed',
    slug: raw.slug || null,
    creator_address: raw.creator_address?.toLowerCase() || null,
    created_date: raw.created_date ? new Date(raw.created_date) : new Date(),
    floor_price: raw.floor_price ? parseFloat(raw.floor_price) : null,
    external_link: raw.external_link || null,
  };
}
