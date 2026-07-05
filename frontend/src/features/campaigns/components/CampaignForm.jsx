import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { campaignFormSchema } from '../validators/campaignSchema';
import Button from '../../../shared/components/Button';
import FormField from '../../../shared/components/FormField';

function toLocalDatetime(utcStr) {
  if (!utcStr) return '';
  const d = new Date(utcStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowLocalDatetime() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CampaignForm({ defaultValues, onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: (function() {
      const vals = { name: '', description: '', starts_at: '', ends_at: '' };
      if (defaultValues) Object.assign(vals, defaultValues);
      vals.starts_at = defaultValues?.starts_at ? toLocalDatetime(defaultValues.starts_at) : '';
      vals.ends_at = defaultValues?.ends_at ? toLocalDatetime(defaultValues.ends_at) : '';
      return vals;
    })(),
  });

  const isEdit = !!defaultValues?.id;

  const handleFormSubmit = (data) => {
    const payload = {
      ...data,
      starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : undefined,
      ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : undefined,
    };
    if (!data.starts_at) delete payload.starts_at;
    if (!data.ends_at) delete payload.ends_at;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FormField label="Campaign Name" error={errors.name?.message} required>
        <input
          {...register('name')}
          style={inputStyle}
          placeholder="e.g., Summer Sale 2026"
        />
      </FormField>

      <FormField label="Description (optional)" error={errors.description?.message}>
        <textarea
          {...register('description')}
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
          placeholder="Describe the campaign's goal, audience, and key details..."
        />
      </FormField>

      <div className="date-fields" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        marginBottom: 8,
      }}>
        <FormField label="Start Date/Time (optional)" error={errors.starts_at?.message}>
          <input
            {...register('starts_at')}
            type="datetime-local"
            min={nowLocalDatetime()}
            style={inputStyle}
          />
        </FormField>

        <FormField label="End Date/Time (optional)" error={errors.ends_at?.message}>
          <input
            {...register('ends_at')}
            type="datetime-local"
            min={nowLocalDatetime()}
            style={inputStyle}
          />
        </FormField>
      </div>

      <div style={{ paddingTop: 8 }}>
        <Button type="submit" disabled={loading} loading={loading} tooltip={isEdit ? 'Save campaign changes' : 'Create a new campaign'}>
          {isEdit ? 'Save Changes' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
};
