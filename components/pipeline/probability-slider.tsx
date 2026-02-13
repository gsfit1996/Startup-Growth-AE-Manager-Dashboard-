"use client";

type ProbabilitySliderProps = {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
};

export function ProbabilitySlider({ label, hint, value, onChange }: ProbabilitySliderProps) {
  return (
    <label className="space-y-2 rounded-lg border border-[color:var(--border)] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{label}</span>
        <span className="text-sm font-medium text-[color:var(--foreground)]">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[color:var(--accent-teal)]"
      />
      <p className="text-xs text-[color:var(--muted)]">{hint}</p>
    </label>
  );
}

