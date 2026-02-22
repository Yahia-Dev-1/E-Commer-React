// Normalize a product document to the local app model
export function normalizeProduct(item) {
  const parsePrice = (p) => {
    if (p === null || p === undefined) return 0
    const num =
      typeof p === 'number'
        ? p
        : parseFloat(String(p).replace(/,/g, ''))
    return Number.isFinite(num) ? num : 0
  }

  return {
    id: item?.id,
    title: item?.title || item?.name || '',
    description: item?.description || '',
    price: parsePrice(item?.price),
    quantity: Number(item?.quantity ?? item?.stock ?? 1),
    category: item?.category || 'other',
    image: item?.image || item?.img || item?.imageUrl || '',
    createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
  }
}
