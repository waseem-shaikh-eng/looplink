import { useState } from 'react';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

function toLocalDatetime(utcStr) {
  if (!utcStr) return '';
  const d = new Date(utcStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LifecycleButtons({ campaign, onSchedule, onLaunch, onEnd, loading, defaultStartsAt }) {
  const [scheduleDate, setScheduleDate] = useState(() => toLocalDatetime(defaultStartsAt));
  const [showSchedule, setShowSchedule] = useState(false);
  const actions = campaign?.allowed_actions || [];

  return (
    <div>
      <div className="lifecycle-buttons" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {actions.includes('schedule') && !showSchedule && (
          <Button variant="primary" onClick={() => setShowSchedule(true)} icon="📅" tooltip="Schedule a future start date">
            Schedule
          </Button>
        )}

        {actions.includes('launch') && (
          <Button variant="success" disabled={loading} onClick={onLaunch} icon="🚀" tooltip="Launch campaign immediately">
            {loading ? 'Launching...' : 'Launch'}
          </Button>
        )}

        {actions.includes('end') && (
          <Button variant="danger" disabled={loading} onClick={onEnd} icon="⏹" tooltip="End this campaign">
            {loading ? 'Ending...' : 'End Campaign'}
          </Button>
        )}
      </div>

      {showSchedule && (
        <div style={{
          marginTop: 16, padding: 20,
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <label style={{
            display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8,
            color: 'var(--color-text)',
          }}>
            Set Start Date & Time
          </label>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
            Choose when the campaign should go live.
          </p>
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
              marginBottom: 12,
              boxSizing: 'border-box',
              background: 'var(--color-surface)',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="success"
              disabled={!scheduleDate || loading}
              loading={loading}
              onClick={() => {
                onSchedule(new Date(scheduleDate).toISOString());
                setShowSchedule(false);
              }}
              tooltip="Set the campaign to scheduled"
            >
              Confirm Schedule
            </Button>
            <Button variant="ghost" onClick={() => setShowSchedule(false)} tooltip="Discard changes">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
