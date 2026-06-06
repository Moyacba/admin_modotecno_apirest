export const normalizeProduct = (product) => {
  if (!product) return product;

  const normalized = {
    ...product,
    promoPrice: product.promoPrice === 0 ? null : product.promoPrice,
    percentPrice: product.percentPrice === 0 ? null : product.percentPrice,
  };

  if (normalized.variants && Array.isArray(normalized.variants)) {
    normalized.variants = normalized.variants.map(variant => ({
      ...variant,
      promoPrice: variant.promoPrice === 0 ? null : variant.promoPrice,
      percentPrice: variant.percentPrice === 0 ? null : variant.percentPrice,
    }));
  }

  return normalized;
};

export const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return products;
  return products.map(normalizeProduct);
};