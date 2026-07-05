import { useState } from 'react';
import Button from '../../../shared/components/Button';

const OFFER_TYPES = [
  { value: 'product_percent_discount', label: '% Off Product', icon: '🏷️' },
  { value: 'cart_fixed_discount', label: 'Fixed $ Off Cart', icon: '🛒' },
  { value: 'sticker_earn', label: 'Earn Stickers', icon: '⭐' },
];

function OfferForm({ type, params, onChange, onRemove }) {
  const fields = getOfferFields(type);
  const offerType = OFFER_TYPES.find((t) => t.value === type);

  return (
    <div style={{
      background: 'var(--color-bg)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      padding: 16,
      marginBottom: 12,
      position: 'relative',
      animation: 'fadeIn 0.2s ease',
    }}>
      <button
        onClick={onRemove}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 18, color: 'var(--color-text-muted)',
          padding: '4px 8px', borderRadius: 4, lineHeight: 1,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-danger-light)'; e.currentTarget.style.color = 'var(--color-danger)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
      >
        ×
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span>{offerType?.icon || '🎁'}</span>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>
          {offerType?.label || type}
        </p>
      </div>

      {fields.map((field) => (
        <div key={field.key} style={{ marginBottom: 10 }}>
          <label style={{
            display: 'block', fontSize: 12, marginBottom: 4,
            color: 'var(--color-text-secondary)', fontWeight: 500,
          }}>
            {field.label} {field.required ? <span style={{ color: 'var(--color-danger)' }}>*</span> : null}
          </label>
          <input
            type={field.type}
            value={params[field.key] || ''}
            placeholder={field.placeholder || ''}
            onChange={(e) => onChange(type, { ...params, [field.key]: field.coerce ? parseFloat(e.target.value) || e.target.value : e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
              background: 'var(--color-surface)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function getOfferFields(type) {
  switch (type) {
    case 'product_percent_discount':
      return [
        { key: 'percent', label: 'Discount %', type: 'number', required: true, placeholder: 'e.g. 20', coerce: true },
        { key: 'applies_to', label: 'Applies To (SKU list / label)', type: 'text', required: false, placeholder: 'e.g. Summer Collection' },
      ];
    case 'cart_fixed_discount':
      return [
        { key: 'amount_off', label: 'Amount Off ($)', type: 'number', required: true, placeholder: 'e.g. 15', coerce: true },
        { key: 'min_basket', label: 'Min Basket ($)', type: 'number', required: false, placeholder: 'e.g. 50', coerce: true },
      ];
    case 'sticker_earn':
      return [
        { key: 'stickers', label: 'Stickers Earned', type: 'number', required: true, placeholder: 'e.g. 5', coerce: true },
        { key: 'per_amount', label: 'Per $ Spent', type: 'number', required: false, placeholder: 'e.g. 25', coerce: true },
      ];
    default:
      return [];
  }
}

export default function OfferBuilder({ offers = [], onChange, readOnly }) {
  const [nextType, setNextType] = useState('product_percent_discount');

  const handleParamChange = (index, type, params) => {
    const updated = [...offers];
    updated[index] = { type, parameters: params };
    onChange(updated);
  };

  const handleRemove = (index) => {
    onChange(offers.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...offers, { type: nextType, parameters: {} }]);
  };

  return (
    <div>
      {offers.length === 0 && (
        <div style={{
          textAlign: 'center', padding: 24,
          background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--color-border)',
          marginBottom: 16,
        }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 4px' }}>
            No offers yet.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: 0 }}>
            Add a discount or reward offer below. A campaign needs at least one offer to launch.
          </p>
        </div>
      )}

      {offers.map((offer, i) => (
        <OfferForm
          key={i}
          type={offer.type}
          params={offer.parameters}
          onChange={(type, params) => handleParamChange(i, type, params)}
          onRemove={() => handleRemove(i)}
        />
      ))}

      {!readOnly && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <select
            value={nextType}
            onChange={(e) => setNextType(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          >
            {OFFER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
          <Button onClick={handleAdd} variant="outline" size="sm">
            + Add Offer
          </Button>
        </div>
      )}
    </div>
  );
}
