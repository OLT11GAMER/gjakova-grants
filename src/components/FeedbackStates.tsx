import { AlertTriangle, Inbox, LoaderCircle, RotateCcw } from "lucide-react";

export function LoadingState({ label = "Duke ngarkuar…" }: { label?: string }) {
  return (
    <div className="feedback-state" role="status" aria-live="polite">
      <LoaderCircle className="spin" aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="feedback-state feedback-state--compact">
      <Inbox aria-hidden="true" />
      <strong>{title}</strong>
      <span>{message}</span>
      {actionLabel && onAction ? (
        <button className="button button--secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="feedback-state" role="alert">
      <AlertTriangle aria-hidden="true" />
      <strong>Nuk mund të përfundohej veprimi.</strong>
      <span>{message}</span>
      <button className="button button--primary" type="button" onClick={onRetry}>
        <RotateCcw size={18} aria-hidden="true" />
        Provo përsëri
      </button>
    </div>
  );
}
