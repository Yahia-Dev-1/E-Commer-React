// Normalize a Strapi product document to the local app model
export function normalizeStrapiProduct(item) {
  const attributes = item?.attributes || {}

  // التعامل مع الصورة من Strapi + Cloudinary
  const imageAttrs = attributes?.img?.data?.attributes
  const rawUrl =
    imageAttrs?.url || // لو الرابط الأصلي موجود
    imageAttrs?.formats?.large?.url ||
    imageAttrs?.formats?.medium?.url ||
    imageAttrs?.formats?.small?.url

  // لو الرابط من Cloudinary أو أي رابط خارجي، سيبه زي ما هو
  // لو مش رابط كامل، ضيف عليه الـ localhost
  const image = rawUrl
    ? rawUrl.startsWith('http')
      ? rawUrl
      : `http://localhost:1337${rawUrl}`
    : ''

  const parsePrice = (p) => {
    if (p === null || p === undefined) return 0
    const num =
      typeof p === 'number'
        ? p
        : parseFloat(String(p).replace(/,/g, ''))
    return Number.isFinite(num) ? num : 0
  }

  return {
    id: item?.documentId || item?.id,
    strapiDocumentId: item?.documentId || undefined,
    title: attributes?.title || attributes?.titel || '', // دعم الاحتمالين
    description: attributes?.description || '',
    price: parsePrice(attributes?.price),
    quantity: Number(attributes?.stock ?? 1),
    category: attributes?.category || 'other',
    image,
    createdAt: attributes?.createdAt || new Date().toISOString(),
  }
}
