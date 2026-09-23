"use client";

import { formatTime } from "@/lib/meditation/meditationUtils";
import type { MeditationSessionRecord } from "@/lib/meditation/types";

type Props = {
  session: MeditationSessionRecord;
  onDone: () => void;
  onAgain: () => void;
};

export function SessionSummary({ session, onDone, onAgain }: Props) {
  const consistency = Math.max(8, Math.min(100, session.consistency ?? session.postureScore));
  return (
    <div className="mindful-modal-backdrop">
      <div className="mindful-summary">
        <p className="mindful-kicker">Session complete</p>
        <h2>Meditation completed</h2>
        <div className="summary-time">{formatTime(session.meditationDuration)}</div>
        <div className="summary-block">
          <span>Posture</span>
          <strong>
            {session.postureScore} / 100
          </strong>
          <small>Average score — wellness observation only</small>
        </div>
        <div className="summary-block">
          <span>Session insights</span>
          <ul>
            {session.insights.map((insight) => (
              <li key={insight}>✓ {insight}</li>
            ))}
          </ul>
        </div>
                <div className="summary-block">
          <span>Consistency</span>
          <div className="summary-bar">
            <i style={{ width: `${consistency}%` }} />
          </div>
          <small>{consistency}%</small>
        </div>
        <div className="summary-block">
          <span>AI reflection</span>
          <p>{session.reflection}</p>
        </div>
        {session.badges.length > 0 && (
          <div className="summary-badges">
            {session.badges.map((badge) => (
              <em key={badge}>{badge}</em>
            ))}
          </div>
        )}
        <div className="mindful-inline-actions">
          <button type="button" className="mindful-ghost" onClick={onDone}>
            Done
          </button>
          <button type="button" className="mindful-cta" onClick={onAgain}>
            Start Another Session
          </button>
        </div>
      </div>
    </div>
  );
}
