import { Link } from 'react-router-dom';
import { ArrowRight, Droplet, FileWarning, Phone, Siren } from 'lucide-react';

const features = [
  {
    to: '/reports',
    icon: FileWarning,
    title: 'Real-time reports',
    description: 'Report accidents, hazards, and civic issues. Track every report from pending to resolved.',
  },
  {
    to: '/donors',
    icon: Droplet,
    title: 'Blood donor network',
    description: 'Find available donors by blood group and area, or register yourself as a donor.',
  },
  {
    to: '/emergency',
    icon: Siren,
    title: 'One-click emergency',
    description: 'Call emergency hotlines instantly and share your exact location with responders.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6 pt-6">
        <span className="w-fit rounded-full border border-border bg-surface px-3 py-1 text-xs text-accent">
          Community safety and healthcare
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          A smarter, safer city starts with the people in it.
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted">
          Smart City Patch connects citizens, blood donors, and responders in one place, so help arrives faster when it
          matters most.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/emergency" className="btn-primary px-5 py-3">
            <Phone className="size-4" aria-hidden="true" />
            Get emergency help
          </Link>
          <Link to="/reports" className="btn-secondary px-5 py-3">
            Submit a report
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="flex flex-col gap-4">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ to, icon: Icon, title, description }) => (
            <Link key={to} to={to} className="card group flex flex-col gap-3 p-6 transition-colors hover:border-accent/60">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{description}</p>
              <span className="mt-auto flex items-center gap-1 text-sm text-accent">
                Open
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card flex flex-col items-start justify-between gap-4 border-primary/40 bg-primary/10 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">Life-threatening emergency?</h2>
          <p className="text-sm text-muted">National Emergency Service: police, fire, and ambulance.</p>
        </div>
        <a href="tel:999" className="btn-primary px-6 py-3 text-base">
          <Phone className="size-4" aria-hidden="true" />
          Call 999
        </a>
      </section>
    </div>
  );
}
