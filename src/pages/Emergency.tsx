import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, HeartPulse, Info, LocateFixed, Phone, ShieldAlert, Siren } from 'lucide-react';
import { PageHeader } from '../components/ui';

const hotlines = [
  { number: '999', label: 'National Emergency', detail: 'Police, fire service, and ambulance', icon: Siren, primary: true },
  { number: '16263', label: 'Health Helpline', detail: 'Shasthya Batayon, 24/7 medical advice', icon: HeartPulse },
  { number: '109', label: 'Women & Child Helpline', detail: 'Violence against women and children', icon: ShieldAlert },
  { number: '333', label: 'National Info Service', detail: 'Government information and services', icon: Info },
];

export default function Emergency() {
  const [locating, setLocating] = useState(false);
  const [mapLink, setMapLink] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function locate() {
    if (!navigator.geolocation) {
      setStatus('Location is not supported on this device.');
      return;
    }
    setLocating(true);
    setStatus(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMapLink(`https://www.google.com/maps?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`);
        setLocating(false);
      },
      () => {
        setStatus('Could not get your location. Please allow location access.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function shareLocation() {
    if (!mapLink) return;
    const text = `I need help. My location: ${mapLink}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Emergency location', text });
      } else {
        await navigator.clipboard.writeText(text);
        setStatus('Location link copied to clipboard.');
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <div>
      <PageHeader
        title="Emergency access"
        description="Tap a hotline to call immediately. Share your live location so responders and family can find you."
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        {hotlines.map(({ number, label, detail, icon: Icon, primary }) => (
          <li key={number}>
            <a
              href={`tel:${number}`}
              className={
                primary
                  ? 'flex items-center gap-4 rounded-xl bg-primary p-5 text-white transition-colors hover:bg-primary-strong'
                  : 'card flex items-center gap-4 p-5 transition-colors hover:border-accent/60'
              }
            >
              <span
                className={
                  primary
                    ? 'flex size-12 items-center justify-center rounded-lg bg-white/15'
                    : 'flex size-12 items-center justify-center rounded-lg bg-accent/10 text-accent'
                }
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{label}</span>
                <span className={primary ? 'block text-sm text-white/80' : 'block text-sm text-muted'}>{detail}</span>
              </span>
              <span className="flex items-center gap-2 text-2xl font-bold tabular-nums">
                <Phone className="size-5" aria-hidden="true" />
                {number}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <section aria-labelledby="share-location" className="card mt-8 flex flex-col gap-4 p-6">
        <div>
          <h2 id="share-location" className="text-lg font-semibold">
            Share my location
          </h2>
          <p className="text-sm text-muted">Get a map link to your exact position and send it to anyone.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={locate} className="btn-secondary" disabled={locating}>
            <LocateFixed className="size-4" aria-hidden="true" />
            {locating ? 'Locating...' : mapLink ? 'Refresh location' : 'Find my location'}
          </button>
          {mapLink && (
            <>
              <button type="button" onClick={shareLocation} className="btn-primary">
                <Copy className="size-4" aria-hidden="true" />
                Share location
              </button>
              <a href={mapLink} target="_blank" rel="noreferrer" className="btn-secondary">
                Open map
              </a>
            </>
          )}
        </div>
        {status && (
          <p role="status" className="text-sm text-muted">
            {status}
          </p>
        )}
      </section>

      <p className="mt-6 text-sm text-muted">
        Not urgent?{' '}
        <Link to="/reports" className="text-accent hover:underline">
          Submit a report
        </Link>{' '}
        or{' '}
        <Link to="/donors" className="text-accent hover:underline">
          find a blood donor
        </Link>
        .
      </p>
    </div>
  );
}
