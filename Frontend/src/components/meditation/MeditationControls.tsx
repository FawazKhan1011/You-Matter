"use client";

type Props = {
  minutes: number;
  onMinutes: (value: number) => void;
  custom: string;
  onCustom: (value: string) => void;
  onStart: () => void;
  demo: boolean;
  canSkipCamera?: boolean;
};

export function MeditationControls({
  minutes,
  onMinutes,
  custom,
  onCustom,
  onStart,
  demo,
  canSkipCamera,
}: Props) {
  return (
    <div className="mindful-setup-panel">
      <p className="mindful-kicker">Choose a duration</p>
      <div className="mindful-pills">
        {[2, 5, 10].map((value) => (
          <button
            key={value}
            type="button"
            className={`mindful-pill ${minutes === value ? "active" : ""}`}
            onClick={() => onMinutes(value)}
          >
            {value} min
          </button>
        ))}
        <label className={`mindful-pill ${![2, 5, 10].includes(minutes) ? "active" : ""}`}>
          Custom
          <input
            type="number"
            min={1}
            max={45}
            value={custom}
            onChange={(event) => {
              onCustom(event.target.value);
              const next = Number(event.target.value);
              if (Number.isFinite(next) && next > 0) onMinutes(Math.min(45, Math.round(next)));
            }}
          />
        </label>
      </div>
      <button type="button" className="mindful-cta" onClick={onStart}>
        Prepare Your Space
      </button>
      {canSkipCamera && (
        <p className="mindful-fineprint">You can continue without a camera after calibration.</p>
      )}
      {demo && <p className="mindful-demo-tag">Demo Mode is available for a reliable walkthrough.</p>}
    </div>
  );
}
