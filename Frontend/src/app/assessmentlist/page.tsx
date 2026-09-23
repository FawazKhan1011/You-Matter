"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ExternalLink,
  History,
  LogOut,
  Plus,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "../../styles/assessmentlist.css";
import { trackEvent } from "@/lib/activityTracker";

interface AssessmentInfo {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  officialLink: string;
  sourceName: string;
  category: string;
  scoreMin: number;
  scoreMax: number;
  interpretation?: {
    min: number;
    max: number;
    label: string;
    tone: "low" | "mild" | "moderate" | "high" | "severe";
  }[];
}

interface AssessmentResult {
  id: string;
  score: number;
  date: string;
  note: string;
}

const assessments: AssessmentInfo[] = [
  {
    id: "phq9",
    shortTitle: "PHQ-9",
    title: "PHQ-9 — Patient Health Questionnaire-9",
    description:
      "A 9-item screening and severity measure for depressive symptoms over the previous two weeks.",
    officialLink: "https://www.nih.gov/node/19946",
    sourceName: "NIH",
    category: "Depression",
    scoreMin: 0,
    scoreMax: 27,
    interpretation: [
      { min: 0, max: 4, label: "Minimal", tone: "low" },
      { min: 5, max: 9, label: "Mild", tone: "mild" },
      { min: 10, max: 14, label: "Moderate", tone: "moderate" },
      { min: 15, max: 19, label: "Moderately severe", tone: "high" },
      { min: 20, max: 27, label: "Severe", tone: "severe" },
    ],
  },
  {
    id: "gad7",
    shortTitle: "GAD-7",
    title: "GAD-7 — Generalized Anxiety Disorder-7",
    description:
      "A 7-item screening and severity measure for anxiety symptoms.",
    officialLink: "https://www.hiv.uw.edu/page/mental-health-screening/gad-7",
    sourceName: "University of Washington",
    category: "Anxiety",
    scoreMin: 0,
    scoreMax: 21,
    interpretation: [
      { min: 0, max: 4, label: "Minimal", tone: "low" },
      { min: 5, max: 9, label: "Mild", tone: "mild" },
      { min: 10, max: 14, label: "Moderate", tone: "moderate" },
      { min: 15, max: 21, label: "Severe", tone: "severe" },
    ],
  },
  {
    id: "k10",
    shortTitle: "K10",
    title: "K10 — Kessler Psychological Distress Scale",
    description:
      "A 10-item measure designed to assess levels of psychological distress.",
    officialLink: "https://www.healthfocuspsychology.com.au/tools/k10/",
    sourceName: "Health Focus Psychology",
    category: "Distress",
    scoreMin: 10,
    scoreMax: 50,
  },
  {
    id: "pcl5",
    shortTitle: "PCL-5",
    title: "PCL-5 — PTSD Checklist for DSM-5",
    description:
      "A 20-item self-report measure assessing the symptoms associated with PTSD.",
    officialLink:
      "https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp",
    sourceName: "U.S. Department of Veterans Affairs",
    category: "Trauma",
    scoreMin: 0,
    scoreMax: 80,
  },
  {
    id: "dass21",
    shortTitle: "DASS-21",
    title: "DASS-21 — Depression, Anxiety and Stress Scale",
    description:
      "A 21-item self-report scale covering symptoms of depression, anxiety and stress.",
    officialLink:
      "https://www.icliniq.com/tool/dass-depression-anxiety-stress-scale-21",
    sourceName: "iCliniq",
    category: "Depression & Anxiety",
    scoreMin: 0,
    scoreMax: 63,
  },
  {
    id: "phq2",
    shortTitle: "PHQ-2",
    title: "PHQ-2 — Patient Health Questionnaire-2",
    description:
      "A brief two-item initial screen for depressive symptoms.",
    officialLink: "https://www.nih.gov/node/19946",
    sourceName: "NIH",
    category: "Depression",
    scoreMin: 0,
    scoreMax: 6,
  },
  {
    id: "epds",
    shortTitle: "EPDS",
    title: "EPDS — Edinburgh Postnatal Depression Scale",
    description:
      "A depression screening instrument designed primarily for pregnancy and the postpartum period.",
    officialLink:
      "https://www.ncbi.nlm.nih.gov/books/NBK592808/table/ch1.tab5/",
    sourceName: "NCBI / AHRQ",
    category: "Perinatal",
    scoreMin: 0,
    scoreMax: 30,
  },
  {
    id: "gds15",
    shortTitle: "GDS-15",
    title: "GDS-15 — Geriatric Depression Scale",
    description:
      "A short depression screening questionnaire developed for older adults.",
    officialLink:
      "https://www.ncbi.nlm.nih.gov/books/NBK592808/table/ch1.tab5/",
    sourceName: "NCBI / AHRQ",
    category: "Older Adults",
    scoreMin: 0,
    scoreMax: 15,
  },
  {
    id: "pss10",
    shortTitle: "PSS-10",
    title: "PSS-10 — Perceived Stress Scale",
    description:
      "A widely used measure of perceived stress and how unpredictable or overwhelming situations feel.",
    officialLink:
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC13316253/",
    sourceName: "Clinical guidance / literature",
    category: "Stress",
    scoreMin: 0,
    scoreMax: 40,
  },
  {
    id: "auditc",
    shortTitle: "AUDIT-C",
    title: "AUDIT-C — Alcohol Use Screening",
    description:
      "A brief three-item screen for potentially hazardous alcohol use.",
    officialLink:
      "https://www.ncbi.nlm.nih.gov/books/NBK565474/table/table-1/",
    sourceName: "NCBI",
    category: "Substance Use",
    scoreMin: 0,
    scoreMax: 12,
  },
  {
    id: "audit",
    shortTitle: "AUDIT",
    title: "AUDIT — Alcohol Use Disorders Identification Test",
    description:
      "A 10-item screening questionnaire for hazardous and harmful alcohol use.",
    officialLink:
      "https://iris.who.int/bitstream/handle/10665/353571/9789240043176-eng.pdf",
    sourceName: "World Health Organization",
    category: "Substance Use",
    scoreMin: 0,
    scoreMax: 40,
  },
  {
    id: "assist",
    shortTitle: "ASSIST",
    title: "ASSIST — Alcohol, Smoking and Substance Involvement Screening Test",
    description:
      "A WHO-developed screening tool covering alcohol, tobacco and other substance involvement.",
    officialLink:
      "https://iris.who.int/bitstream/handle/10665/353571/9789240043176-eng.pdf",
    sourceName: "World Health Organization",
    category: "Substance Use",
    scoreMin: 0,
    scoreMax: 100,
  },
  {
    id: "who5",
    shortTitle: "WHO-5",
    title: "WHO-5 — Well-Being Index",
    description:
      "A short self-report measure of current subjective psychological well-being.",
    officialLink: "https://www.who.int/",
    sourceName: "World Health Organization",
    category: "Wellbeing",
    scoreMin: 0,
    scoreMax: 25,
  },
  {
    id: "asrs5",
    shortTitle: "ASRS-5",
    title: "ASRS-5 — Adult ADHD Self-Report Scale",
    description:
      "A brief screening tool for ADHD symptoms in adults.",
    officialLink:
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC10486255/",
    sourceName: "Research literature",
    category: "ADHD",
    scoreMin: 0,
    scoreMax: 24,
  },
  {
    id: "ocir",
    shortTitle: "OCI-R",
    title: "OCI-R — Obsessive-Compulsive Inventory-Revised",
    description:
      "A self-report measure of obsessive-compulsive symptoms across several symptom domains.",
    officialLink: "https://www.ncbi.nlm.nih.gov/",
    sourceName: "NCBI",
    category: "OCD",
    scoreMin: 0,
    scoreMax: 72,
  },
  {
    id: "isi",
    shortTitle: "ISI",
    title: "ISI — Insomnia Severity Index",
    description:
      "A brief measure of perceived insomnia severity and its impact on daily functioning.",
    officialLink: "https://www.ncbi.nlm.nih.gov/",
    sourceName: "NCBI",
    category: "Sleep",
    scoreMin: 0,
    scoreMax: 28,
  },
  {
    id: "phq15",
    shortTitle: "PHQ-15",
    title: "PHQ-15 — Patient Health Questionnaire-15",
    description:
      "A questionnaire measuring the severity of common physical and somatic symptoms.",
    officialLink: "https://www.ncbi.nlm.nih.gov/",
    sourceName: "NCBI",
    category: "Somatic Symptoms",
    scoreMin: 0,
    scoreMax: 30,
  },
];

const STORAGE_KEY = "you-matter-assessment-results";

function getStoredResults(): AssessmentResult[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getInterpretation(
  assessment: AssessmentInfo,
  score: number
) {
  return assessment.interpretation?.find(
    (range) => score >= range.min && score <= range.max
  );
}

export default function AssessmentListPage() {
  useEffect(() => {
    trackEvent('page_visit', { page: 'assessmentlist' });
  }, []);

  const router = useRouter();

  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentInfo | null>(null);
  const [historyAssessment, setHistoryAssessment] =
    useState<AssessmentInfo | null>(null);
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    setResults(getStoredResults());

    const today = new Date().toISOString().split("T")[0];
    setDate(today);

  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(assessments.map((a) => a.category)))],
    []
  );

  const filteredAssessments = useMemo(() => {
    if (category === "All") return assessments;
    return assessments.filter((assessment) => assessment.category === category);
  }, [category]);

  const saveResults = (newResults: AssessmentResult[]) => {
    setResults(newResults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newResults));
  };

  const submitScore = () => {
    if (!selectedAssessment) return;

    const numericScore = Number(score);

    if (
      score === "" ||
      Number.isNaN(numericScore) ||
      numericScore < selectedAssessment.scoreMin ||
      numericScore > selectedAssessment.scoreMax
    ) {
      return;
    }

    const newResult: AssessmentResult = {
      id: selectedAssessment.id,
      score: numericScore,
      date,
      note: note.trim(),
    };

    saveResults([...results, newResult]);

    setSelectedAssessment(null);
    setScore("");
    setNote("");

  };

  const getAssessmentResults = (assessmentId: string) =>
    results
      .filter((result) => result.id === assessmentId)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

  const getLatestResult = (assessmentId: string) =>
    getAssessmentResults(assessmentId)[0];

  const totalTracked = results.length;

  return (<main className="ya-page ya-assessment-list"> <div className="assessment-topbar">
    <Button
      onClick={() => router.push("/dashboard")}
      className="exit-btn"
      aria-label="Exit assessments and return to dashboard"
    > <LogOut className="btn-icon-small" />
      Exit </Button> </div>

    <header className="page-header">
      <div className="assessment-hero-icon">
        <ClipboardCheck size={28} />
      </div>

      <span className="assessment-eyebrow">
        PERSONAL WELLNESS CHECK-IN
      </span>

      <h1>Mental Health Assessments</h1>

      <p className="page-subtitle">
        Explore established screening and wellbeing questionnaires from
        recognised medical and public-health sources. Complete them on their
        official websites, then optionally record your score here to monitor
        your own history.
      </p>

      <div className="assessment-disclaimer">
        <CheckCircle2 size={17} />
        <span>
          These questionnaires are screening tools, not diagnoses.
        </span>
      </div>
    </header>

    <section className="tracking-summary" aria-label="Assessment tracking summary">
      <div className="summary-icon">
        <TrendingUp size={21} />
      </div>

      <div>
        <strong>{totalTracked}</strong>
        <span>score{totalTracked === 1 ? "" : "s"} recorded</span>
      </div>

      <div className="summary-info">
        Your results are stored locally in this browser.
      </div>
    </section>

    <section className="assessment-filter-section">
      <div>
        <span className="assessment-eyebrow">EXPLORE</span>
        <h2>Choose an assessment</h2>
      </div>

      <div className="category-filters" role="group" aria-label="Filter assessments by category">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`category-filter ${category === item ? "active" : ""
              }`}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </section>

    <section className="assessment-cards-container">
      {filteredAssessments.map((assessment) => {
        const latest = getLatestResult(assessment.id);
        const interpretation = latest
          ? getInterpretation(assessment, latest.score)
          : undefined;

        return (
          <Card key={assessment.id} className="assessment-card">
            <CardHeader>
              <div className="assessment-card-heading">
                <div className="assessment-card-icon">
                  <ClipboardCheck size={20} />
                </div>

                <div>
                  <span className="assessment-category">
                    {assessment.category}
                  </span>
                  <CardTitle>{assessment.title}</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="assessment-description">
                {assessment.description}
              </p>

              <div className="assessment-meta">
                <span>
                  Score range:{" "}
                  <strong>
                    {assessment.scoreMin}–{assessment.scoreMax}
                  </strong>
                </span>

                {latest && (
                  <span className="latest-score">
                    Latest: <strong>{latest.score}</strong>
                  </span>
                )}
              </div>

              {latest && (
                <div className={`score-result ${interpretation?.tone || ""}`}>
                  <div>
                    <span>Latest recorded score</span>
                    <strong>{latest.score}</strong>
                  </div>

                  {interpretation && (
                    <span className="score-label">
                      {interpretation.label}
                    </span>
                  )}

                  <span className="score-date">
                    {new Date(latest.date).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="assessment-footer">
                <a
                  href={assessment.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="official-link"
                >
                  <ExternalLink size={15} />
                  Official source
                </a>

                <div className="assessment-actions">
                  {latest && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryAssessment(assessment)}
                    >
                      <History size={15} />
                      History
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      setScore("");
                      setNote("");
                      setDate(new Date().toISOString().split("T")[0]);
                    }}
                  >
                    <Plus size={15} />
                    Record score
                  </Button>

                  <a
                    href={assessment.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="take-assessment-button"
                  >
                    Take assessment
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>

    <section className="assessment-note">
      <div className="assessment-note-icon">
        <CalendarDays size={20} />
      </div>

      <div>
        <h2>Track change, not perfection</h2>
        <p>
          If you use the same questionnaire again, record each result rather
          than replacing the previous one. This lets you see how your
          self-reported scores change over time.
        </p>
      </div>
    </section>

    {selectedAssessment && (
      <div
        className="assessment-modal-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setSelectedAssessment(null);
          }
        }}
      >
        <div
          className="assessment-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-score-title"
        >
          <button
            type="button"
            className="modal-close"
            onClick={() => setSelectedAssessment(null)}
            aria-label="Close record score dialog"
          >
            <X size={20} />
          </button>

          <span className="assessment-eyebrow">TRACK RESULT</span>

          <h2 id="record-score-title">
            Record {selectedAssessment.shortTitle}
          </h2>

          <p>
            Enter the score shown by the official assessment. This is
            self-reported information and is stored locally in your browser.
          </p>

          <label htmlFor="assessment-score">
            Score
            <input
              id="assessment-score"
              type="number"
              min={selectedAssessment.scoreMin}
              max={selectedAssessment.scoreMax}
              value={score}
              onChange={(event) => setScore(event.target.value)}
              placeholder={`${selectedAssessment.scoreMin}–${selectedAssessment.scoreMax}`}
            />
          </label>

          <label htmlFor="assessment-date">
            Date completed
            <input
              id="assessment-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <label htmlFor="assessment-note">
            Optional note
            <textarea
              id="assessment-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="For example: completed after a stressful week."
              rows={3}
            />
          </label>

          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedAssessment(null)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={submitScore}
              disabled={
                score === "" ||
                Number(score) < selectedAssessment.scoreMin ||
                Number(score) > selectedAssessment.scoreMax
              }
            >
              <CheckCircle2 size={16} />
              Save score
            </Button>
          </div>
        </div>
      </div>
    )}

    {historyAssessment && (
      <div
        className="assessment-modal-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setHistoryAssessment(null);
          }
        }}
      >
        <div
          className="assessment-modal history-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-history-title"
        >
          <button
            type="button"
            className="modal-close"
            onClick={() => setHistoryAssessment(null)}
            aria-label="Close assessment history"
          >
            <X size={20} />
          </button>

          <span className="assessment-eyebrow">YOUR HISTORY</span>

          <h2 id="assessment-history-title">
            {historyAssessment.shortTitle} history
          </h2>

          <div className="history-list">
            {getAssessmentResults(historyAssessment.id).map(
              (result, index) => {
                const interpretation = getInterpretation(
                  historyAssessment,
                  result.score
                );

                return (
                  <div className="history-item" key={`${result.date}-${index}`}>
                    <div className="history-score">
                      <strong>{result.score}</strong>

                      {interpretation && (
                        <span className={`history-label ${interpretation.tone}`}>
                          {interpretation.label}
                        </span>
                      )}
                    </div>

                    <div className="history-details">
                      <span>
                        {new Date(result.date).toLocaleDateString()}
                      </span>

                      {result.note && <p>{result.note}</p>}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    )}
  </main>

  );
}
