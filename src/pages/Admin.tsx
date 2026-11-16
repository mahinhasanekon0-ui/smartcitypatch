import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { REPORT_STATUSES, type Donor, type Report, type ReportStatus } from '../lib/types';
import { timeAgo } from '../lib/utils';
import { EmptyState, PageHeader, SignInPrompt, StatusBadge } from '../components/ui';

function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubReports = onSnapshot(
      collection(db, 'reports'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
        data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setReports(data);
      },
      (err) => setError(err.message),
    );
    const unsubDonors = onSnapshot(
      collection(db, 'donors'),
      (snap) => setDonors(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Donor)),
      (err) => setError(err.message),
    );
    return () => {
      unsubReports();
      unsubDonors();
    };
  }, []);

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(REPORT_STATUSES.map((s) => [s, 0])) as Record<ReportStatus, number>;
    const byCategory: Record<string, number> = {};
    for (const r of reports) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    }
    return {
      byStatus,
      categories: Object.entries(byCategory).map(([name, count]) => ({ name, count })),
    };
  }, [reports]);

  const statCards = [
    { label: 'Total reports', value: reports.length },
    { label: 'Pending', value: stats.byStatus.pending },
    { label: 'In progress', value: stats.byStatus['in-progress'] },
    { label: 'Available donors', value: donors.filter((d) => d.availability).length },
  ];

  return (
    <div className="flex flex-col gap-8">
      {error && <p className="text-sm text-primary">{error}</p>}

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value }) => (
          <div key={label} className="card p-5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="by-category" className="card p-5">
        <h2 id="by-category" className="mb-4 font-semibold">
          Reports by category
        </h2>
        {stats.categories.length === 0 ? (
          <p className="text-sm text-muted">No data yet.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categories}>
                <XAxis dataKey="name" stroke="#93a1b8" fontSize={12} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#93a1b8" fontSize={12} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(45,212,191,0.08)' }}
                  contentStyle={{ background: '#121a2b', border: '1px solid #22304a', borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section aria-labelledby="manage-reports">
        <h2 id="manage-reports" className="mb-3 text-lg font-semibold">
          Manage reports
        </h2>
        {reports.length === 0 ? (
          <EmptyState>No reports to manage.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li key={report.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{report.category}</span>
                    <StatusBadge status={report.status} />
                    <span className="text-xs text-muted">
                      {report.userName} &middot; {timeAgo(report.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{report.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`status-${report.id}`}>
                    Status
                  </label>
                  <select
                    id={`status-${report.id}`}
                    className="input w-auto"
                    value={report.status}
                    onChange={(e) =>
                      updateDoc(doc(db, 'reports', report.id), { status: e.target.value }).catch((err) =>
                        setError(err.message),
                      )
                    }
                  >
                    {REPORT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-secondary px-3"
                    aria-label="Delete report"
                    onClick={() => {
                      if (confirm('Delete this report?')) {
                        deleteDoc(doc(db, 'reports', report.id)).catch((err) => setError(err.message));
                      }
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();

  return (
    <div>
      <PageHeader title="Admin dashboard" description="Monitor city activity and update the status of reports." />
      {loading ? (
        <EmptyState>Loading...</EmptyState>
      ) : !user ? (
        <SignInPrompt message="Sign in with an admin account to access the dashboard." />
      ) : !isAdmin ? (
        <EmptyState>You do not have permission to view this page.</EmptyState>
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}
