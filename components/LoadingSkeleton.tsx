'use client';

/** Placeholder berdenyut untuk menunggu hasil AI tanpa layout melompat. */
export default function LoadingSkeleton({ lines = 4, label }: { lines?: number; label?: string }) {
  return (
    <div className="animate-pulse space-y-3" aria-busy="true" aria-live="polite">
      {label && <p className="text-sm text-textSecondary">{label}</p>}
      <div className="h-6 w-1/2 rounded bg-gray-200" />
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className="h-4 w-full rounded bg-gray-200" />
      ))}
    </div>
  );
}
