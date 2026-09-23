'use client';

import { useEffect, useState, useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../components/theme-toggle';
import '../../styles/dashboard.css';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Bot, Book, Home, FileText, MessageSquare, User, Pencil, Music, Flower2 } from 'lucide-react';
import { loadMeditationStats, useMeditationStatsUpdater } from '@/lib/meditation/sessionStorage';
import type { MeditationStats } from '@/lib/meditation/types';
import { MeditationStatsCard } from './MeditationStatsCard';
import { WellnessInsights } from './WellnessInsights';
import { trackEvent } from '@/lib/activityTracker';


// Define interface for assessment data
interface Assessment {
  type: 'PHQ-9' | 'GAD-7';
  score: number;
  severity: string;
  created_at?: string;
}

interface WellnessTask {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'journal' | 'assessment' | 'resources' | 'custom';
  durationMinutes?: number;
  status: 'available' | 'in_progress' | 'completed';
  completed: boolean;
  externalLink?: string;
}

interface CoachPlan {
  text: string;
  tasks: WellnessTask[];
}

interface TaskRow {
  id: string | number;
  text: string;
  completed: boolean;
}

function EditableTasksCard({
  generatedTasks,
  onTaskExecute,
  onTasksChange,
}: {
  generatedTasks: WellnessTask[];
  onTaskExecute: (task: WellnessTask) => void;
  onTasksChange: (tasks: WellnessTask[]) => void;
}) {
  const [tasks, setTasks] = useState<TaskRow[]>([
    // { id: 1, text: '60s breathing', completed: false },
    // { id: 2, text: 'Drink a glass of water', completed: false },
    // { id: 3, text: '5-minute walk', completed: false },
  ]);

  const syncTasks = (nextTasks: TaskRow[]) => {
    setTasks(nextTasks);
    const persisted = nextTasks.map((task) => {
      const match = generatedTasks.find((generatedTask) => String(generatedTask.id) === String(task.id));
      return {
        ...(match ?? {
          id: String(task.id),
          title: task.text,
          description: task.text,
          type: 'custom' as const,
          status: 'available',
          completed: task.completed,
        }),
        id: String(task.id),
        title: task.text || match?.title || 'Wellness task',
        description: match?.description || task.text,
        type: match?.type || 'custom',
        durationMinutes: match?.durationMinutes,
        status: match?.status || 'available',
        completed: task.completed,
        externalLink: match?.externalLink,
      };
    });

    onTasksChange(persisted);
  };
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (generatedTasks.length === 0) return;

    setTasks((currentTasks) => [
      ...currentTasks.filter((task) => !generatedTasks.some((generatedTask) => generatedTask.id === String(task.id))),
      ...generatedTasks.map((task) => ({
        id: task.id,
        text: task.durationMinutes ? `${task.title} (${task.durationMinutes} min)` : task.title,
        completed: task.completed,
      })),
    ]);
  }, [generatedTasks]);

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const toggleComplete = (id: string | number) => {
    setTasks((prev) => {
      const task = prev.find((item) => item.id === id);
      const nextTasks = prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      if (task && !task.completed) trackEvent('task_completed', { task: task.text });
      syncTasks(nextTasks);
      return nextTasks;
    });
  };

  const startEditing = (id: string | number) => setEditingId(id);

  const saveTaskText = (id: string | number, text: string) => {
    setTasks((prev) => {
      const nextTasks = prev.map((task) =>
        task.id === id ? { ...task, text: text.trim() || task.text } : task
      );
      syncTasks(nextTasks);
      return nextTasks;
    });
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string | number) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const clearAll = () => {
    syncTasks([]);
  };

  const addTask = () => {
    const newId = `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const nextTasks = [...tasks, { id: newId, text: 'New task', completed: false }];
    syncTasks(nextTasks);
    setEditingId(newId);
  };

  return (
    <motion.section
      layout
      className="ya-card tasks-card"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35 }}
    >
      <CardHeader>
        <CardTitle>Today&apos;s Mini Tasks</CardTitle>
        <p className="card-sub">Small actions to feel better</p>
      </CardHeader>

      <CardContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '280px',
        }}
      >
        <ul
          className="tasks-list"
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            paddingLeft: 0,
            margin: 0,
            listStyle: 'none',
          }}
        >
          {tasks.map(({ id, text, completed }) => (
            <li
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={completed}
                onChange={() => toggleComplete(id)}
                aria-label={`Mark task ${text} as completed`}
              />
              {editingId === id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) =>
                    setTasks((prev) =>
                      prev.map((task) =>
                        task.id === id ? { ...task, text: e.target.value } : task
                      )
                    )
                  }
                  onBlur={(e) => saveTaskText(id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{ flex: 1 }}
                />
              ) : (
                <>
                  <span
                    onClick={() => startEditing(id)}
                    style={{
                      flex: 1,
                      textDecoration: completed ? 'line-through' : 'none',
                    }}
                  >
                    {text}
                  </span>
                  {typeof id === 'string' && !completed && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const task = generatedTasks.find((generatedTask) => generatedTask.id === id);
                        if (task) onTaskExecute(task);
                      }}
                    >
                      {generatedTasks.find((generatedTask) => generatedTask.id === id)?.externalLink ? 'Open' : 'Start'}
                    </Button>
                  )}
                </>
              )}
            </li>
          ))}
          {tasks.length === 0 && (
            <li style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
              No tasks. Add some!
            </li>
          )}
        </ul>

        <div
          className="tasks-cta"
          style={{
            marginTop: '1rem',
            flexShrink: 0,
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="outline" onClick={clearAll} disabled={tasks.length === 0}>
            Clear All
          </Button>
          <Button onClick={addTask}>Add Task</Button>
        </div>
      </CardContent>
    </motion.section>
  );
}

function DashboardCoach({
  initialPlan,
  onPlanCreated,
}: {
  initialPlan: CoachPlan | null;
  onPlanCreated: (plan: CoachPlan) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [plan, setPlan] = useState<CoachPlan | null>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  const askCoach = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/genai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'orchestrator',
          messages: [{ role: 'user', content: message }],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'The wellness coach could not respond');

      const nextPlan: CoachPlan = { text: data.text, tasks: data.tasks || [] };
      setPlan(nextPlan);
      onPlanCreated(nextPlan);
      setInput('');
    } catch (coachError) {
      console.error('Dashboard orchestrator error:', coachError);
      setError('The coach could not create a plan right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`dashboard-coach ${expanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="dashboard-coach-orb"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse wellness coach' : 'Open wellness coach'}
      >
        <Bot size={30} />
      </button>
      <div className="dashboard-coach-heading">
        <span className="dashboard-coach-kicker">Your wellness guide</span>
        <strong>Talk through what is weighing on you</strong>
      </div>

      {expanded && (
        <div className="dashboard-coach-panel">
          <p className="dashboard-coach-hint">Share what is happening. The coach will suggest a few small next steps.</p>
          <div className="dashboard-coach-input-row">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') askCoach();
              }}
              placeholder="I am feeling stressed about..."
              disabled={loading}
              aria-label="Tell the wellness coach what is happening"
            />
            <Button onClick={askCoach} disabled={!input.trim() || loading}>
              {loading ? 'Thinking...' : 'Plan'}
            </Button>
          </div>
          {error && <p className="dashboard-coach-error" role="alert">{error}</p>}
          {plan && (
            <div className="dashboard-coach-result">
              <p>{plan.text}</p>
              {plan.tasks.length > 0 && (
                <div className="dashboard-coach-task-preview">
                  {plan.tasks.map((task) => (
                    <div key={task.id} className="dashboard-coach-task-preview-item">
                      <span>{task.title}</span>
                      <small>{task.type}{task.externalLink ? ' • external' : ''}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState<string>('Dashboard');
  const [coachPlan, setCoachPlan] = useState<CoachPlan | null>(null);
  const [coachTasks, setCoachTasks] = useState<WellnessTask[]>([]);
  const [meditationStats, setMeditationStats] = useState<MeditationStats>({
    sessionsCompleted: 0,
    averagePostureScore: 0,
    lastDuration: 0,
    lastPostureScore: 0,
    streakDays: 0,
    badges: [] as string[],
    totalMinutes: 0,
  });
  const statsUpdater = useMeditationStatsUpdater(user?.id);
  useEffect(() => {
    trackEvent('page_visit', { page: 'dashboard' });
  }, []);

  useEffect(() => {
    if (!user) return;

    try {
      const storedPlan = localStorage.getItem(`dashboard_coach_plan_${user.id}`);
      if (!storedPlan) return;

      const parsedPlan = JSON.parse(storedPlan) as CoachPlan;
      if (parsedPlan && Array.isArray(parsedPlan.tasks)) {
        setCoachPlan(parsedPlan);
        setCoachTasks(parsedPlan.tasks);
      }
    } catch (error) {
      console.warn('Unable to restore saved wellness plan:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !coachPlan) return;
    localStorage.setItem(`dashboard_coach_plan_${user.id}`, JSON.stringify(coachPlan));
  }, [coachPlan, user]);

  const handleTasksChange = (tasks: WellnessTask[]) => {
    setCoachTasks(tasks);
    setCoachPlan((currentPlan) => ({
      text: currentPlan?.text || 'Your saved wellness steps are ready.',
      tasks,
    }));
  };

  const executeTask = (task: WellnessTask) => {
    if (task.externalLink) {
      window.open(task.externalLink, '_blank', 'noopener,noreferrer');
      return;
    }

    if (task.type === 'meditation') {
      const durationSeconds = (task.durationMinutes || 5) * 60;
      router.push(`/meditation?duration=${durationSeconds}&autostart=true`);
      return;
    }

    if (task.type === 'journal') {
      const prompt = task.description || task.title;
      router.push(`/PrivateDiary?prompt=${encodeURIComponent(prompt)}`);
      return;
    }

    if (task.type === 'assessment') {
      router.push('/assessmentlist');
      return;
    }

    if (task.type === 'resources') {
      router.push('/resources');
    }
  };

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`assessment_${user.id}`) || '[]';
      const parsed: Assessment[] = JSON.parse(stored).map((item: Partial<Assessment>) => ({
        type: item.type === "PHQ-9" ? "PHQ-9" : "GAD-7",
        score: item.score ?? 0,
        severity: item.severity ?? "",
        created_at: item.created_at ?? new Date().toISOString()
      }));

      setAssessments(parsed);
      setMeditationStats(loadMeditationStats(user.id));
    } else {
      setMeditationStats(loadMeditationStats());
    }
  }, [user]);

  useEffect(() => {
    setMeditationStats(statsUpdater);
  }, [statsUpdater]);

  const lastAssessment = assessments[assessments.length - 1];

const modules = [
  { id: 'Dashboard', icon: <Home size={20} />, href: '/' },
  { id: 'Assessment Lists', icon: <FileText size={20} />, href: '/assessmentlist' },
  { id: 'AI Chat', icon: <MessageSquare size={20} />, href: '/ai' },
  { id: 'Meditation', icon: <Flower2 size={20} />, href: '/meditation' },
  { id: 'Personal Diary', icon: <Pencil size={20} />, href: '/PrivateDiary' },
  { id: 'Resources', icon: <Book size={20} />, href: '/resources' },
  { id: 'Relaxing Sounds', icon: <Music size={20} />, href: '/relaxation' },
  { id: 'Profile', icon: <User size={20} />, href: '/profile' },
];

  const handleModuleClick = (m: { id: string; href?: string }) => {
    setActiveModule(m.id);
    if (m.href) {
      window.location.assign(m.href);
    }
  };

  const MOTIVATIONS = [
    "Take one small step today — you matter.",
    "Breathe in calm — breathe out worry.",
    "Progress isn't linear. Be kind to yourself today.",
  ];
  const randomMot = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

  return (
    <div className="ya-dashboard">
      <aside className={`ya-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="ya-sidebar-top">
          <div className="ya-logo-text">{sidebarOpen ? 'You Matter' : 'YM'}</div>
        </div>

        <nav className="ya-nav">
          <ul>
            {modules.map((m) => (
              <li
                key={m.id}
                className={`ya-nav-item ${activeModule === m.id ? 'active' : ''}`}
                onClick={() => handleModuleClick(m)}
              >
                <span className="ya-nav-icon">{m.icon}</span>
                {sidebarOpen && <span className="ya-nav-label">{m.id}</span>}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ya-sidebar-bottom">
          <div className="ya-utilities">
            {/* <ThemeToggle /> */}
            {/* <UserButton /> */}
          </div>
        </div>
      </aside>

      <main className="ya-main">
        <header className="ya-header">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="ya-header-left"
          >
          </motion.div>

          <div className="ya-header-right flex items-center gap-4">
            <Button>
              <Link href="/assess">Start Quick Check</Link>
            </Button>
            <div className="userbutton">
              <UserButton />
            </div>
          </div>
        </header>

        <WellnessInsights userId={user?.id} />
        <section className="ya-grid">
          <motion.section
            layout
            className="ya-card profile-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="profile-top">
              <div className="profile-pic">
                {/* fallback avatar */}
                <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
                  <circle cx="20" cy="14" r="8" fill="var(--accent-gradient)"></circle>
                  <rect x="6" y="26" width="28" height="8" rx="4" fill="#f1f3f8"></rect>
                </svg>
              </div>
              <div className="profile-name">
                <strong>{user?.firstName}</strong>

                <div className="profile-sub">YouMatter member</div>
              </div>
            </div>

            <div className="profile-body">
              <div className="score-row">
                <div className="score-block">
                  <div className="score-label">Last Test</div>
                  <div className="score-value">
                    {lastAssessment ? `${lastAssessment.type}: ${lastAssessment.score}` : 'No tests yet'}
                  </div>
                  {lastAssessment && (
                    <div className="score-severity">{lastAssessment.severity}</div>
                  )}
                </div>

                <div className="progress-block">
                  <div className="progress-label">Wellness</div>
                  <Progress value={Math.min(100, (lastAssessment?.score ?? 6) * 10)} />
                </div>
              </div>

              <div className="motivation">
                <div className="mot-text">{randomMot}</div>
                <Button onClick={() => window.location.assign('/meditation')}>Do a 2-min breathing</Button>
              </div>
            </div>
          </motion.section>

          <motion.section
            layout
            className="ya-card chat-card dashboard-coach-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <DashboardCoach
              initialPlan={coachPlan}
              onPlanCreated={(plan) => {
                setCoachPlan(plan);
                setCoachTasks(plan.tasks);
                trackEvent('coach_plan_created', { taskCount: plan.tasks.length });
              }}
            />
          </motion.section>

          <motion.section
            layout
            className="ya-card meditation-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <MeditationStatsCard stats={meditationStats} />
          </motion.section>

          <motion.section
            layout
            className="ya-card resources-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <CardHeader style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Book className="book-icon" size={24} />
              <div>
                <CardTitle>Resources</CardTitle>
                <p className="card-sub">Curated articles, helplines & videos</p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="resource-detail-text" style={{ marginBottom: "1rem" }}>
                Articles and resources to support your wellness journey.
              </div>

              <div className="resource-cta" style={{ marginTop: '4rem' }}>
                <Button onClick={() => window.location.assign('/resources')}>
                  Open Library
                </Button>
              </div>
            </CardContent>
          </motion.section>

          <motion.section
  layout
  className="ya-card diary-card"
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.55, delay: 0.2 }}
>
<CardHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
  <CardTitle>Personal Diary</CardTitle>
</CardHeader>

  <CardContent style={{ textAlign: 'center', paddingTop: '1rem', paddingBottom: '1.5rem' }}>
    <center><Pencil color="black" size={48} style={{ marginBottom: '1rem' }} /></center>

    <p className="card-sub" style={{ marginBottom: '1.5rem', color: 'var(--muted-foreground)' }}>
      A private space to write your reflections, thoughts, and feelings.
    </p>

    <Button size="lg" onClick={() => router.push('/PrivateDiary')}>
      Start Writing
    </Button>
  </CardContent>
</motion.section>

          <motion.section
            layout
            className="ya-card crisis-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
          >
            <CardHeader>
              <CardTitle>Crisis & Safety</CardTitle>
              <p className="card-sub">Immediate help & hotlines</p>
            </CardHeader>
            <CardContent>
              <div className="crisis-box">
                <div className="crisis-text">
                  If you feel unsafe or are thinking of harming yourself, call your local emergency number immediately.
                </div>
                <div className="crisis-phones">
                  <div><strong>India:</strong> 112</div>
                  <div><strong>Global:</strong> See resources</div>
                </div>
                <div className="crisis-actions">
                  <Button
                    onClick={() => {
                      window.location.href = 'tel:112';
                    }}
                  >
                    Call Now
                  </Button>

                  <Button
                    onClick={() => router.push('/resources/crisis-help')}
                  >
                    Get Help
                  </Button>
                </div>
              </div>
            </CardContent>
          </motion.section>

          {/* New Editable Tasks Card */}
          <EditableTasksCard
            generatedTasks={coachTasks}
            onTaskExecute={executeTask}
            onTasksChange={handleTasksChange}
          />
        </section>
      </main>
    </div>
  );
}
