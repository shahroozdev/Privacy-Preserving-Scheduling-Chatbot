interface AccessibilityPageProps {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  fontScale: number;
  setFontScale: (value: number) => void;
}

export function AccessibilityPage({
  highContrast,
  setHighContrast,
  fontScale,
  setFontScale,
}: AccessibilityPageProps) {
  return (
    <div className="max-w-5xl space-y-6 mx-auto">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold">
          Accessibility & Inclusivity Settings
        </h3>
        <p className="mt-2 text-sm md:text-base text-slate-600">
          Tune reading comfort and visual accessibility. These controls are
          applied instantly for the active session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">
                Visual Contrast
              </p>
              <h4 className="text-lg font-semibold mt-1">High Contrast Mode</h4>
              <p className="mt-2 text-sm text-slate-600">
                Increases foreground/background contrast for users with low
                vision sensitivity.
              </p>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="mt-1"
            />
          </div>
        </label>

        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Readable Typography
          </p>
          <h4 className="text-lg font-semibold mt-1">Font Size ({fontScale}%)</h4>
          <p className="mt-2 text-sm text-slate-600">
            Adjust global text scale for easier readability across chat and
            dashboard cards.
          </p>
          <input
            type="range"
            min={90}
            max={125}
            step={5}
            value={fontScale}
            onChange={(e) => setFontScale(Number(e.target.value))}
            className="mt-4 w-full"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition-all duration-300 hover:shadow-md">
        <h4 className="font-semibold text-emerald-900">Inclusivity Reminder</h4>
        <p className="mt-2 text-sm text-emerald-900/90">
          When users request accessibility requirements (for example:
          wheelchair access), matching logic enforces strict feature filtering
          and excludes non-compliant rooms.
        </p>
      </div>
    </div>
  );
}
