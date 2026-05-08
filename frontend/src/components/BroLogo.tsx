interface BroLogoProps {
  className?: string;
  compact?: boolean;
}

export function BroLogo({ className = '', compact = false }: BroLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-black/20 bg-[#ffd400] shadow-[0_12px_28px_rgba(255,212,0,0.35)]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.35),transparent_48%)]" />
        <span className="relative font-display text-2xl font-black text-black">B</span>
      </div>
      {!compact && (
        <div>
          <p className="font-display text-2xl font-bold leading-none tracking-tight">BroDoMyWork</p>
          <p className="mt-1 text-sm text-muted">Assignment studio with live handwritten preview</p>
        </div>
      )}
    </div>
  );
}
