'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Feather,
  LogOut,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import '../../styles/privateDiary.css';
import { trackEvent } from '@/lib/activityTracker';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'you-matter-private-diary';
 

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyEntry(): DiaryEntry {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: 'Untitled reflection',
    content: '',
    reflection: '',
    createdAt: now,
    updatedAt: now,
  };
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export default function PrivateDiary() {
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent('page_visit', { page: 'private-diary' });
  }, []);

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [diaryText, setDiaryText] = useState('');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const activeEntry = useMemo(
    () => entries.find((entry) => entry.id === activeId),
    [entries, activeId]
  );

  /*
   * Load saved diary entries.
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: DiaryEntry[] = JSON.parse(stored);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          setActiveId(parsed[0].id);
          setTitle(parsed[0].title);
          setDiaryText(parsed[0].content);
          setReflection(parsed[0].reflection);
          setLoaded(true);
          return;
        }
      }
    } catch (error) {
      console.error('Unable to load diary:', error);
    }

    const newEntry = createEmptyEntry();

    setEntries([newEntry]);
    setActiveId(newEntry.id);
    setTitle(newEntry.title);
    setDiaryText(newEntry.content);
    setReflection(newEntry.reflection);
    setLoaded(true);
  }, []);

  /*
   * Handle prompt coming from another part of the application.
   */
  useEffect(() => {
    const prompt = searchParams?.get('prompt');

    if (!prompt || !loaded) return;

    setDiaryText((current) =>
      current.trim() ? current : `${prompt}\n\n`
    );
  }, [searchParams, loaded]);

  /*
   * Keep localStorage synchronized.
   */
  useEffect(() => {
    if (!loaded || entries.length === 0) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, loaded]);

  const loadEntry = (entry: DiaryEntry) => {
    setActiveId(entry.id);
    setTitle(entry.title);
    setDiaryText(entry.content);
    setReflection(entry.reflection);
    setError('');
  };

  const handleNewEntry = () => {
    const newEntry = createEmptyEntry();

    setEntries((current) => [newEntry, ...current]);
    setActiveId(newEntry.id);
    setTitle(newEntry.title);
    setDiaryText('');
    setReflection('');
    setError('');
  };

  const handleSave = () => {
    if (!diaryText.trim() && !title.trim()) return;

    setSaving(true);

    const now = new Date().toISOString();

    setEntries((current) =>
      current.map((entry) =>
        entry.id === activeId
          ? {
              ...entry,
              title: title.trim() || 'Untitled reflection',
              content: diaryText,
              reflection,
              updatedAt: now,
            }
          : entry
      )
    );

    window.setTimeout(() => {
      setSaving(false);
    }, 350);
  };

  const handleDelete = () => {
    if (!activeId) return;

    const remaining = entries.filter((entry) => entry.id !== activeId);

    if (remaining.length === 0) {
      const newEntry = createEmptyEntry();

      setEntries([newEntry]);
      setActiveId(newEntry.id);
      setTitle(newEntry.title);
      setDiaryText('');
      setReflection('');
      return;
    }

    const nextEntry = remaining[0];

    setEntries(remaining);
    loadEntry(nextEntry);
  };

  const handleReflection = async () => {
    if (!diaryText.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const systemPrompt = `
You are "You Matter AI", a compassionate and thoughtful wellness companion.

Read the user's private diary entry and provide a gentle reflection.

Your response should:
- acknowledge what the person experienced
- notice emotions or themes without diagnosing them
- recognize positive moments or strengths when present
- offer one or two gentle observations
- suggest a small, realistic next step when appropriate
- avoid judgment
- avoid pretending to be a therapist
- avoid diagnosing mental-health conditions
- never make the user feel guilty

Keep the reflection warm, human and concise.
Do not simply repeat the diary entry.
      `;

      const response = await fetch('/api/genai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptType: 'reflection',
          diaryText: diaryText.trim(),
          systemPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'Failed to generate reflection'
        );
      }

      const generatedReflection =
        data.text ||
        'I could not generate a reflection right now. Please try again.';

      setReflection(generatedReflection);

      /*
       * Save the AI reflection into the current record too.
       * This means reopening the diary entry later restores
       * both the user's writing and the AI response.
       */
      setEntries((current) =>
        current.map((entry) =>
          entry.id === activeId
            ? {
                ...entry,
                title: title.trim() || 'Untitled reflection',
                content: diaryText,
                reflection: generatedReflection,
                updatedAt: new Date().toISOString(),
              }
            : entry
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        'Something went wrong while creating your reflection. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const exitToDashboard = () => {
    window.location.assign('/dashboard');
  };

  const characterCount = diaryText.length;

  return (
    <main className="diary-shell">
      {/* SIDEBAR */}

      <aside
        className={`diary-sidebar ${
          sidebarOpen ? 'diary-sidebar-open' : 'diary-sidebar-closed'
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">
            <BookOpen size={19} />
          </div>

          {sidebarOpen && (
            <div>
              <strong>You Matter</strong>
              <span>Private Diary</span>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <>
            <Button
              className="new-entry-button"
              onClick={handleNewEntry}
            >
              <Plus size={17} />
              New entry
            </Button>

            <div className="sidebar-section-label">
              <span>Your reflections</span>
              <span>{entries.length}</span>
            </div>

            <div className="diary-entry-list">
              {entries.map((entry) => {
                const selected = entry.id === activeId;

                return (
                  <button
                    key={entry.id}
                    className={`diary-entry ${
                      selected ? 'diary-entry-active' : ''
                    }`}
                    onClick={() => loadEntry(entry)}
                  >
                    <div className="entry-date">
                      <span>{formatDate(entry.updatedAt)}</span>

                      {entry.reflection && (
                        <Sparkles size={12} />
                      )}
                    </div>

                    <strong>
                      {entry.title || 'Untitled reflection'}
                    </strong>

                    <p>
                      {entry.content.trim()
                        ? entry.content.trim().slice(0, 70)
                        : 'Start writing about your day...'}
                    </p>

                    <span className="entry-time">
                      {formatTime(entry.updatedAt)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="sidebar-bottom">
              <div className="privacy-note">
                <div className="privacy-dot" />

                <div>
                  <strong>Private space</strong>
                  <span>Your entries stay on this device.</span>
                </div>
              </div>

              <button
                className="sidebar-exit"
                onClick={exitToDashboard}
              >
                <LogOut size={16} />
                Exit to dashboard
              </button>
            </div>
          </>
        )}

        <button
          className="sidebar-collapse"
          onClick={() => setSidebarOpen((current) => !current)}
          aria-label="Toggle diary sidebar"
        >
          {sidebarOpen ? (
            <ChevronLeft size={17} />
          ) : (
            <ChevronRight size={17} />
          )}
        </button>
      </aside>

      {/* MAIN WORKSPACE */}

      <section className="diary-workspace">
        <header className="diary-header">
          <div className="header-left">
            <div className="header-icon">
              <Feather size={18} />
            </div>

            <div>
              <span className="header-eyebrow">
                PRIVATE REFLECTION
              </span>
              <h1>My diary</h1>
            </div>
          </div>

          <div className="header-actions">
            <span className="saved-indicator">
              <Clock3 size={14} />
              {saving ? 'Saving...' : 'Saved locally'}
            </span>

            <Button
              variant="outline"
              className="delete-button"
              onClick={handleDelete}
              title="Delete this entry"
            >
              <Trash2 size={16} />
            </Button>

            <Button
              className="save-button"
              onClick={handleSave}
              disabled={!diaryText.trim() || saving}
            >
              <Save size={16} />
              {saving ? 'Saving' : 'Save'}
            </Button>
          </div>
        </header>

        <div className="notebook">
          <div className="notebook-top">
            <div className="date-label">
              {activeEntry
                ? formatDate(activeEntry.updatedAt)
                : 'Today'}
            </div>

            <div className="paper-status">
              <span />
              Private
            </div>
          </div>

          <input
            className="diary-title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give this moment a title..."
            maxLength={100}
          />

          <textarea
            className="diary-writing-area"
            value={diaryText}
            onChange={(event) => setDiaryText(event.target.value)}
            placeholder={`What's on your mind today?

You can write freely here. There is no right way to keep a diary.

Talk about what happened, how you felt, something you're grateful for, something that challenged you — or simply let your thoughts out.`}
            spellCheck
          />

          <div className="writing-footer">
            <span>
              {characterCount.toLocaleString()} characters
            </span>

            <span>
              Write honestly. This space is yours.
            </span>
          </div>
        </div>

        {/* AI REFLECTION */}

        <section className="ai-reflection-panel">
          <div className="ai-reflection-heading">
            <div className="ai-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <span>YOU MATTER AI</span>
              <h2>Reflect with me</h2>
            </div>

            <Button
              className="reflection-button"
              onClick={handleReflection}
              disabled={!diaryText.trim() || loading}
            >
              <Sparkles size={16} />
              {loading ? 'Reflecting...' : 'Reflect on my day'}
            </Button>
          </div>

          {!reflection && !loading && (
            <div className="reflection-empty">
              <p>
                When you&apos;re ready, let AI gently reflect on what
                you&apos;ve written.
              </p>
              <span>
                It will look for themes, emotions and small moments
                worth noticing.
              </span>
            </div>
          )}

          {loading && (
            <div className="reflection-loading">
              <div className="loading-orb">
                <Sparkles size={18} />
              </div>

              <div>
                <strong>Taking a moment to reflect...</strong>
                <span>
                  Looking at your words with care.
                </span>
              </div>
            </div>
          )}

          {reflection && !loading && (
            <div className="reflection-content">
              <div className="reflection-label">
                <Sparkles size={13} />
                Your reflection
              </div>

              <p>{reflection}</p>
            </div>
          )}

          {error && (
            <div className="diary-error">
              {error}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
