import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { MapPin, Phone, Search } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, type BloodGroup, type Donor } from '../lib/types';
import { cn, timeAgo } from '../lib/utils';
import { EmptyState, PageHeader, SignInPrompt } from '../components/ui';

function DonorForm() {
  const { user, profile } = useAuth();
  const [existing, setExisting] = useState<Donor | null>(null);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [phone, setPhone] = useState('');
  const [locationName, setLocationName] = useState('');
  const [availability, setAvailability] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'donors', user.uid), (snap) => {
      if (!snap.exists()) {
        setExisting(null);
        return;
      }
      const data = { id: snap.id, ...snap.data() } as Donor;
      setExisting(data);
      setBloodGroup(data.bloodGroup);
      setPhone(data.phone);
      setLocationName(data.locationName ?? '');
      setAvailability(data.availability);
    });
  }, [user]);

  if (!user) return <SignInPrompt message="Sign in to register as a blood donor." />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      await setDoc(doc(db, 'donors', user.uid), {
        userId: user.uid,
        name: profile?.name || user.displayName || 'Donor',
        bloodGroup,
        phone: phone.trim(),
        availability,
        locationName: locationName.trim(),
        updatedAt: new Date().toISOString(),
      });
      if (profile && profile.role === 'receiver') {
        await updateDoc(doc(db, 'users', user.uid), { role: 'donor' });
      }
      setMessage(existing ? 'Donor profile updated.' : 'You are now registered as a donor. Thank you.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save donor profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!user) return;
    await deleteDoc(doc(db, 'donors', user.uid));
    setMessage('Donor profile removed.');
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm">Blood group</legend>
        <div className="grid grid-cols-4 gap-2">
          {BLOOD_GROUPS.map((group) => (
            <button
              type="button"
              key={group}
              onClick={() => setBloodGroup(group)}
              aria-pressed={bloodGroup === group}
              className={cn(
                'rounded-lg border py-2 text-sm font-semibold transition-colors',
                bloodGroup === group ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted hover:text-foreground',
              )}
            >
              {group}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 text-sm">
        Phone number
        <input
          className="input"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          minLength={6}
          required
          placeholder="+880 1XXX XXXXXX"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Area
        <input
          className="input"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. Dhanmondi, Dhaka"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={availability}
          onChange={(e) => setAvailability(e.target.checked)}
          className="size-4 accent-[var(--color-accent)]"
        />
        Available to donate now
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary flex-1" disabled={saving}>
          {saving ? 'Saving...' : existing ? 'Update profile' : 'Register as donor'}
        </button>
        {existing && (
          <button type="button" className="btn-secondary" onClick={handleRemove}>
            Remove
          </button>
        )}
      </div>
      {message && (
        <p role="status" className="text-sm text-muted">
          {message}
        </p>
      )}
    </form>
  );
}

export default function Donors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<BloodGroup | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'donors'), where('availability', '==', true));
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Donor);
        data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setDonors(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return donors.filter(
      (d) =>
        (group === 'all' || d.bloodGroup === group) &&
        (!term || d.locationName?.toLowerCase().includes(term) || d.name.toLowerCase().includes(term)),
    );
  }, [donors, group, search]);

  return (
    <div>
      <PageHeader
        title="Blood donor network"
        description="Find available donors near you by blood group, or register so others can reach you in an emergency."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <section aria-labelledby="become-donor">
          <h2 id="become-donor" className="mb-3 text-lg font-semibold">
            Your donor profile
          </h2>
          <DonorForm />
        </section>

        <section aria-labelledby="donor-list">
          <h2 id="donor-list" className="mb-3 text-lg font-semibold">
            Available donors
          </h2>
          <div className="mb-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <label htmlFor="donor-search" className="sr-only">
                Search by name or area
              </label>
              <input
                id="donor-search"
                className="input pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or area"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by blood group">
              {(['all', ...BLOOD_GROUPS] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGroup(g)}
                  aria-pressed={group === g}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    group === g ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted hover:text-foreground',
                  )}
                >
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mb-3 text-sm text-primary">{error}</p>}
          {loading ? (
            <EmptyState>Loading donors...</EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState>No available donors match your filters.</EmptyState>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {visible.map((donor) => (
                <li key={donor.id} className="card flex items-center gap-4 p-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-bold text-primary">
                    {donor.bloodGroup}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{donor.name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      {donor.locationName || 'Area not set'} &middot; {timeAgo(donor.updatedAt)}
                    </p>
                  </div>
                  <a href={`tel:${donor.phone}`} className="btn-secondary px-3" aria-label={`Call ${donor.name}`}>
                    <Phone className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
