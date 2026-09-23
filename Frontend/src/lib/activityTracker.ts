export type ActivityEvent = {
  eventName: string;
  timestamp: string;
  meta?: Record<string, string | number | boolean>;
};

const STORAGE_KEY = 'you-matter-activity-log';

export function trackEvent(
  eventName: string,
  meta?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return;

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ActivityEvent[];
    const events = Array.isArray(stored) ? stored : [];
    events.push({ eventName, timestamp: new Date().toISOString(), meta });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-200)));
    window.dispatchEvent(new Event('youmatter:activity-updated'));
  } catch {
    // Local activity tracking should never interrupt the main workflow.
  }
}

export function loadActivityLog(): ActivityEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ActivityEvent[];
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}