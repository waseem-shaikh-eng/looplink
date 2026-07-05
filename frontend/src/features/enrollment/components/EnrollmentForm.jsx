import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../../shared/components/Button';
import FormField from '../../../shared/components/FormField';

const enrollmentSchema = z.object({
  identity: z.string().min(1, 'Phone or email is required'),
});

const TYPES = [
  { value: 'email', label: 'Email', placeholder: 'you@example.com' },
  { value: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000' },
];

export default function EnrollmentForm({ onSubmit, loading }) {
  const [identityType, setIdentityType] = useState('email');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { identity: '' },
  });

  const current = TYPES.find((t) => t.value === identityType);

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, identity_type: identityType });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setIdentityType(t.value)}
              data-tooltip={`Use ${t.label}`}
              style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${identityType === t.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: identityType === t.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: identityType === t.value ? 'var(--color-primary-text)' : 'var(--color-text-secondary)',
              fontWeight: identityType === t.value ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <FormField
        label={current?.label || 'Identity'}
        error={errors.identity?.message}
        required
      >
        <input
          {...register('identity')}
          type={identityType === 'email' ? 'email' : 'tel'}
          style={inputStyle}
          placeholder={current?.placeholder}
        />
      </FormField>

      <Button type="submit" disabled={loading} fullWidth size="lg" variant="success" loading={loading} tooltip="Submit your enrollment">
        {loading ? 'Enrolling...' : '🎉 Enroll Now'}
      </Button>
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
