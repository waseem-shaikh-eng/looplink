const offerIcons = {
  product_percent_discount: '🏷️',
  cart_fixed_discount: '🛒',
  sticker_earn: '⭐',
};

export default function PublicOfferCard({ offer }) {
  const displayData = offer.display_data || {};
  const label = displayData.title || 'Special Offer';
  const icon = offerIcons[offer.type] || '🎁';
  const details = displayData.description || '';

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 20,
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      animation: 'fadeIn 0.3s ease',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: 52, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)',
        borderRadius: 'var(--radius-md)',
        fontSize: 24,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 15, color: 'var(--color-text)' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          {details}
        </p>
      </div>
    </div>
  );
}
