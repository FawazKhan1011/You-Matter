"use client";

import { useState } from "react";
import { Lock, ShieldCheck, X } from "lucide-react";

export function PrivacyIndicator() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="mindful-chip" type="button" onClick={() => setOpen(true)}>
        <Lock size={14} />
        Local Processing
      </button>
      {open && (
        <div className="mindful-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mindful-modal">
            <div className="mindful-modal-head">
              <h3>Privacy</h3>
              <button type="button" className="mindful-icon-btn" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <p>Your camera feed is processed locally and is not uploaded.</p>
            <ul className="mindful-privacy-list">
              <li>
                <ShieldCheck size={16} /> Camera processed locally
              </li>
              <li>
                <ShieldCheck size={16} /> No video stored
              </li>
              <li>
                <ShieldCheck size={16} /> Pose landmarks used only for session feedback
              </li>
              <li>
                <ShieldCheck size={16} /> Session statistics stored separately
              </li>
            </ul>
            <p className="mindful-fineprint">
              Posture guidance is a wellness observation, not a medical diagnosis.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
