/**
 * AddSpotModal — floating form to add a new meditation pin.
 * Appears after clicking the map in add-pin mode.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TECHNIQUES = ['box', '4-7-8', 'wim-hof', 'coherent', 'belly', 'alternate', 'other'];

interface AddPinData {
  lat:         number;
  lng:         number;
  city:        string;
  country:     string;
  title:       string;
  note:        string;
  technique:   string;
  sessionLink: string;
  photoUrl:    string;
}

interface Props {
  open:      boolean;
  lat:       number;
  lng:       number;
  onSubmit:  (data: AddPinData) => Promise<void>;
  onCancel:  () => void;
}

export default function AddSpotModal({ open, lat, lng, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    city: '', country: '', title: '', note: '',
    technique: 'box', sessionLink: '', photoUrl: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ lat, lng, ...form });
      setForm({ city: '', country: '', title: '', note: '', technique: 'box', sessionLink: '', photoUrl: '' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    background:   'rgba(255,255,255,0.07)',
    border:       '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding:      '8px 11px',
    color:        '#e8eaf0',
    fontSize:     13,
    outline:      'none',
    boxSizing:    'border-box',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
            }}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.22 }}
            style={{
              position:   'fixed',
              top:        '50%',
              left:       '50%',
              transform:  'translate(-50%, -50%)',
              zIndex:     1001,
              background: 'rgba(10, 15, 35, 0.97)',
              border:     '1px solid rgba(0, 212, 255, 0.25)',
              borderRadius: 16,
              padding:    '24px 24px 20px',
              width:      'min(420px, calc(100vw - 32px))',
              maxHeight:  '90vh',
              overflowY:  'auto',
              color:      '#e8eaf0',
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
              {t('globe.addModal.title')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 18 }}>
              {lat.toFixed(4)}°, {lng.toFixed(4)}°
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  placeholder={t('globe.addModal.cityPlaceholder')}
                  value={form.city}
                  onChange={set('city')}
                  style={inputStyle}
                />
                <input
                  placeholder={t('globe.addModal.countryPlaceholder')}
                  value={form.country}
                  onChange={set('country')}
                  style={inputStyle}
                />
              </div>

              <input
                placeholder={t('globe.addModal.titlePlaceholder')}
                value={form.title}
                onChange={set('title')}
                required
                style={inputStyle}
              />

              <select
                value={form.technique}
                onChange={set('technique')}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {TECHNIQUES.map(t => (
                  <option key={t} value={t} style={{ background: '#0a0f1e' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)} breathing
                  </option>
                ))}
              </select>

              <textarea
                placeholder={t('globe.addModal.notePlaceholder')}
                value={form.note}
                onChange={set('note')}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />

              <input
                placeholder={t('globe.addModal.photoPlaceholder')}
                value={form.photoUrl}
                onChange={set('photoUrl')}
                style={inputStyle}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onCancel}
                  style={{
                    flex:         1,
                    padding:      '10px',
                    borderRadius: 10,
                    border:       '1px solid rgba(255,255,255,0.15)',
                    background:   'transparent',
                    color:        'rgba(255,255,255,0.6)',
                    fontSize:     14,
                    cursor:       'pointer',
                  }}
                >
                  {t('globe.addModal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex:          2,
                    padding:       '10px',
                    borderRadius:  10,
                    border:        'none',
                    background:    'linear-gradient(135deg, #007acc, #00d4ff)',
                    color:         '#fff',
                    fontSize:      14,
                    fontWeight:    600,
                    cursor:        saving ? 'wait' : 'pointer',
                    opacity:       saving ? 0.7 : 1,
                  }}
                >
                  {saving ? t('globe.addModal.pinning') : t('globe.addModal.submit')}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
