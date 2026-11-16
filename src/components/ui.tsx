import type { ReactNode } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { ReportStatus } from '../lib/types';
import { cn } from '../lib/utils';

const statusStyles: Record<ReportStatus, string> = {
  pending: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  'in-progress': 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  resolved: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium capitalize', statusStyles[status])}>
      {status.replace('-', ' ')}
    </span>
  );
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function SignInPrompt({ message }: { message: string }) {
  const { signIn } = useAuth();
  return (
    <div className="card flex flex-col items-start gap-3 p-6">
      <p className="text-sm text-muted">{message}</p>
      <button type="button" onClick={() => signIn().catch(console.error)} className="btn-primary">
        <LogIn className="size-4" aria-hidden="true" />
        Sign in with Google
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="card p-8 text-center text-sm text-muted">{children}</p>;
}
