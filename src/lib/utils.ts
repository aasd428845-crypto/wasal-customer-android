export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatPrice = (price: number) => {
  return `${Number(price).toLocaleString('ar-YE')} ر.ي`;
};

export const isPromoScheduleActive = (item: any): boolean => {
  if (!item.promo_active) return false;
  if (item.promo_starts_at && new Date(item.promo_starts_at) > new Date()) return false;
  if (item.promo_ends_at && new Date(item.promo_ends_at) < new Date()) return false;
  if (item.promo_active_days) {
    const today = new Date().getDay();
    const days = item.promo_active_days.split(',').map((d: string) => parseInt(d.trim()));
    if (!days.includes(today)) return false;
  }
  return true;
};

export const computeItemPromo = (item: any) => {
  const originalPrice = Number(item.price || 0);
  let finalPrice = originalPrice;
  let hasPromo = false;
  let promoLabel = '';

  if (item.promo_active && item.promo_type) {
    hasPromo = true;
    if (item.promo_type === 'discount_percent' && item.promo_value) {
      finalPrice = originalPrice * (1 - item.promo_value / 100);
      promoLabel = `-${item.promo_value}%`;
    } else if (item.promo_type === 'fixed_price' && item.promo_value) {
      finalPrice = item.promo_value;
      promoLabel = 'عرض';
    } else if (item.discounted_price) {
      finalPrice = item.discounted_price;
    }
  }

  return { originalPrice, finalPrice: Math.round(finalPrice), hasPromo, promoLabel };
};

export const PROMO_SELECT =
  'id, name_ar, image_url, price, discounted_price, preparation_time, rating, total_ratings, restaurant_id, ' +
  'promo_type, promo_value, promo_text, promo_active, promo_starts_at, promo_ends_at, promo_active_days, promo_start_time, promo_end_time, ' +
  'restaurants(name_ar, estimated_delivery_time, delivery_company_id)';
