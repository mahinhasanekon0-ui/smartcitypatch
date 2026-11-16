import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { MapPin, Send } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { REPORT_CATEGORIES, REPORT_STATUSES, type Report } from '../lib/types';
import { timeAgo } from '../lib/utils';
import { EmptyState, PageHeader, SignInPrompt, StatusBadge } from '../components/ui';

function getLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 },
    );
  });
}

export default function Reports() {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const [category, setCategory] = useState<string>(REPORT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [shareLocation, setShareLocation] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'reports'), where('status', 'in', [...REPORT_STATUSES]));
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
        data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setReports(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? reports : reports.filter((r) => r.category === filter)),
    [reports, filter],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !description.trim()) return;
    setSubmitting(true);
    setFormMessage(null);
    try {
      const location = shareLocation ? await getLocation() : null;
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userName: profile?.name || user.displayName || 'Citizen',
        description: description.trim(),
        category,
        status: 'pending',
        createdAt: new Date().toISOString(),
        fileUrl: fileUrl.trim() || null,
        location,
      });
      setDescription('');
      setFileUrl('');
      setFormMessage('Report submitted. Thank you for helping your city.');
    } catch (err) {
      setFormMessage(err instanceof Error ? err.message : 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Community reports"
        description="Report emergencies and civic issues in your area. Updates appear in real time as responders act."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <section aria-labelledby="new-report">
          <h2 id="new-report" className="mb-3 text-lg font-semibold">
            New report
          </h2>
          {user ? (
            <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-5">
              <label className="flex flex-col gap-1.5 text-sm">
                Category
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {REPORT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Description
                <textarea
                  className="input min-h-28"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={4999}
                  required
                  placeholder="What happened, and where?"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Photo or file link (optional)
                <input
                  className="input"
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={shareLocation}
                  onChange={(e) => setShareLocation(e.target.checked)}
                  className="size-4 accent-[var(--color-accent)]"
                />
                Attach my current location
              </label>
              <button type="submit" className="btn-primary" disabled={submitting || !description.trim()}>
                <Send className="size-4" aria-hidden="true" />
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
              {formMessage && (
                <p role="status" className="text-sm text-muted">
                  {formMessage}
                </p>
              )}
            </form>
          ) : (
            <SignInPrompt message="Sign in to submit a report. Anyone can view existing reports." />
          )}
        </section>

        <section aria-labelledby="report-feed">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="report-feed" className="text-lg font-semibold">
              Latest reports
            </h2>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="sr-only">Filter by category</span>
              <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All categories</option>
                {REPORT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="mb-3 text-sm text-primary">{error}</p>}
          {loading ? (
            <EmptyState>Loading reports...</EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState>No reports yet.</EmptyState>
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((report) => (
                <li key={report.id} className="card flex flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{report.category}</span>
                    <StatusBadge status={report.status} />
                    <span className="ml-auto text-xs text-muted">{timeAgo(report.createdAt)}</span>
                  </div>
                  <p className="text-pretty text-sm leading-relaxed">{report.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span>By {report.userName}</span>
                    {report.location && (
                      <a
                        className="flex items-center gap-1 text-accent hover:underline"
                        href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MapPin className="size-3" aria-hidden="true" />
                        View location
                      </a>
                    )}
                    {report.fileUrl && (
                      <a className="text-accent hover:underline" href={report.fileUrl} target="_blank" rel="noreferrer">
                        Attachment
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
