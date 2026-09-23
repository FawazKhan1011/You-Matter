'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Check,
  GraduationCap,
  Heart,
  Info,
  Lock,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import '../../styles/profile.css';

interface UserProfile {
  name: string;
  age: string;
  pronouns: string;

  college: string;
  course: string;
  year: string;

  height: string;
  weight: string;

  disability: string;
  accessibilityNeeds: string;

  sleepHours: string;
  activityLevel: string;

  wellnessGoals: string;
  currentChallenges: string;
  thingsThatHelp: string;

  aiPersonalization: boolean;
}

const defaultProfile: UserProfile = {
  name: '',
  age: '',
  pronouns: '',

  college: '',
  course: '',
  year: '',

  height: '',
  weight: '',

  disability: '',
  accessibilityNeeds: '',

  sleepHours: '',
  activityLevel: '',

  wellnessGoals: '',
  currentChallenges: '',
  thingsThatHelp: '',

  aiPersonalization: true,
};

const PROFILE_STORAGE_KEY = 'you-matter-user-profile';

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);

      if (stored) {
        setProfile({
          ...defaultProfile,
          ...JSON.parse(stored),
        });
      }
    } catch (error) {
      console.error('Could not load profile:', error);
    }
  }, []);

  const updateField = (
    field: keyof UserProfile,
    value: string | boolean
  ) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error('Could not save profile:', error);
    }
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear your profile information?'
    );

    if (!confirmed) return;

    localStorage.removeItem(PROFILE_STORAGE_KEY);
    setProfile(defaultProfile);
    setSaved(false);
  };

  return (
    <main className="profile-page">
      {/* Top navigation */}
      <header className="profile-topbar">
        <Button
          variant="ghost"
          className="profile-back-button"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft size={18} />
          Dashboard
        </Button>

        <div className="privacy-badge">
          <Lock size={14} />
          Private profile
        </div>
      </header>

      {/* Hero */}
      <section className="profile-hero">
        <div className="profile-hero-icon">
          <User size={27} />
        </div>

        <div>
          <span className="profile-eyebrow">
            YOUR PERSONAL SPACE
          </span>

          <h1>Profile & Personalization</h1>

          <p>
            Tell You Matter a little about yourself so your wellness
            experience can feel more relevant to you.
          </p>
        </div>
      </section>

      {/* AI explanation */}
      <section className="personalization-banner">
        <div className="personalization-icon">
          <Sparkles size={21} />
        </div>

        <div>
          <strong>Make your AI guidance more personal</strong>

          <p>
            When personalization is enabled, selected profile details can
            be included as context when You Matter AI responds to you.
            You remain in control of this setting.
          </p>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={profile.aiPersonalization}
            onChange={(event) =>
              updateField(
                'aiPersonalization',
                event.target.checked
              )
            }
          />

          <span className="toggle-slider" />
        </label>
      </section>

      <div className="profile-layout">
        {/* Main form */}
        <section className="profile-form">
          {/* About you */}
          <div className="profile-section">
            <div className="section-heading">
              <div className="section-icon purple">
                <User size={19} />
              </div>

              <div>
                <h2>About you</h2>
                <p>Basic information you would like to share.</p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="Name"
                value={profile.name}
                placeholder="What should we call you?"
                onChange={(value) =>
                  updateField('name', value)
                }
              />

              <FormField
                label="Age"
                value={profile.age}
                placeholder="e.g. 20"
                type="number"
                onChange={(value) =>
                  updateField('age', value)
                }
              />

              <FormField
                label="Pronouns"
                value={profile.pronouns}
                placeholder="e.g. he/him, she/her, they/them"
                onChange={(value) =>
                  updateField('pronouns', value)
                }
              />
            </div>
          </div>

          {/* Education */}
          <div className="profile-section">
            <div className="section-heading">
              <div className="section-icon blue">
                <GraduationCap size={19} />
              </div>

              <div>
                <h2>Education</h2>
                <p>Useful context about your student life.</p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="College / University"
                value={profile.college}
                placeholder="e.g. Your college name"
                onChange={(value) =>
                  updateField('college', value)
                }
              />

              <FormField
                label="Course / Field of study"
                value={profile.course}
                placeholder="e.g. Computer Science"
                onChange={(value) =>
                  updateField('course', value)
                }
              />

              <FormField
                label="Year / Semester"
                value={profile.year}
                placeholder="e.g. 3rd year"
                onChange={(value) =>
                  updateField('year', value)
                }
              />
            </div>
          </div>

          {/* Physical / lifestyle */}
          <div className="profile-section">
            <div className="section-heading">
              <div className="section-icon teal">
                <Heart size={19} />
              </div>

              <div>
                <h2>Health & lifestyle</h2>
                <p>Optional information that may help personalize guidance.</p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="Height"
                value={profile.height}
                placeholder="e.g. 175 cm"
                onChange={(value) =>
                  updateField('height', value)
                }
              />

              <FormField
                label="Weight"
                value={profile.weight}
                placeholder="e.g. 68 kg"
                onChange={(value) =>
                  updateField('weight', value)
                }
              />

              <FormField
                label="Typical sleep"
                value={profile.sleepHours}
                placeholder="e.g. 7–8 hours"
                onChange={(value) =>
                  updateField('sleepHours', value)
                }
              />

              <div className="form-field">
                <label>Activity level</label>

                <select
                  value={profile.activityLevel}
                  onChange={(event) =>
                    updateField(
                      'activityLevel',
                      event.target.value
                    )
                  }
                >
                  <option value="">Select one</option>
                  <option value="Mostly sedentary">
                    Mostly sedentary
                  </option>
                  <option value="Lightly active">
                    Lightly active
                  </option>
                  <option value="Moderately active">
                    Moderately active
                  </option>
                  <option value="Very active">
                    Very active
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="profile-section">
            <div className="section-heading">
              <div className="section-icon orange">
                <ShieldCheck size={19} />
              </div>

              <div>
                <h2>Accessibility & support needs</h2>
                <p>
                  Share only what you are comfortable storing.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <TextAreaField
                label="Disability or condition"
                value={profile.disability}
                placeholder="Optional — share only if you want to."
                onChange={(value) =>
                  updateField('disability', value)
                }
              />

              <TextAreaField
                label="Accessibility needs"
                value={profile.accessibilityNeeds}
                placeholder="Anything that helps you use or navigate the app?"
                onChange={(value) =>
                  updateField(
                    'accessibilityNeeds',
                    value
                  )
                }
              />
            </div>
          </div>

          {/* Wellness */}
          <div className="profile-section">
            <div className="section-heading">
              <div className="section-icon pink">
                <Brain size={19} />
              </div>

              <div>
                <h2>Wellness context</h2>
                <p>
                  This is particularly useful for personalized AI
                  conversations.
                </p>
              </div>
            </div>

            <div className="form-stack">
              <TextAreaField
                label="Wellness goals"
                value={profile.wellnessGoals}
                placeholder="What would you like to improve? For example: better sleep, managing college stress, building confidence..."
                onChange={(value) =>
                  updateField(
                    'wellnessGoals',
                    value
                  )
                }
              />

              <TextAreaField
                label="Current challenges"
                value={profile.currentChallenges}
                placeholder="What has been difficult recently?"
                onChange={(value) =>
                  updateField(
                    'currentChallenges',
                    value
                  )
                }
              />

              <TextAreaField
                label="Things that help you"
                value={profile.thingsThatHelp}
                placeholder="What usually makes you feel calmer, motivated or supported?"
                onChange={(value) =>
                  updateField(
                    'thingsThatHelp',
                    value
                  )
                }
              />
            </div>
          </div>

          {/* Privacy note */}
          <div className="privacy-note">
            <Info size={18} />

            <div>
              <strong>Your information is yours.</strong>

              <p>
                These fields are optional. Avoid entering passwords,
                financial information, government identification numbers,
                or other information you would not want stored.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <Button
              variant="outline"
              onClick={handleClear}
              className="clear-profile-button"
            >
              <X size={17} />
              Clear profile
            </Button>

            <Button
              onClick={handleSave}
              className="save-profile-button"
            >
              {saved ? (
                <>
                  <Check size={18} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save profile
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Right side preview */}
        <aside className="profile-sidebar">
          <div className="ai-preview-card">
            <div className="ai-preview-top">
              <div className="ai-preview-icon">
                <Sparkles size={19} />
              </div>

              <span>AI PERSONALIZATION</span>
            </div>

            <h3>
              A little context can make guidance feel more relevant.
            </h3>

            <p>
              Instead of repeatedly explaining your situation, You Matter
              AI can receive a compact version of the information you
              choose to share.
            </p>

            <div className="context-preview">
              <span>Example AI context</span>

              <p>
                Student studying Computer Science, currently focused on
                managing academic stress and improving sleep. Prefers
                practical, gentle suggestions.
              </p>
            </div>

            <div className="ai-preview-footer">
              <ShieldCheck size={15} />
              <span>
                Only used when personalization is enabled.
              </span>
            </div>
          </div>

          <div className="profile-tips-card">
            <h3>Profile tips</h3>

            <ul>
              <li>
                <Check size={15} />
                You don't need to complete every field.
              </li>

              <li>
                <Check size={15} />
                Keep information general where possible.
              </li>

              <li>
                <Check size={15} />
                You can update your profile whenever things change.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* -------------------------------------------------------
   Reusable form components
------------------------------------------------------- */

function FormField({
  label,
  value,
  placeholder,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-field">
      <label>{label}</label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-field textarea-field">
      <label>{label}</label>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
      />
    </div>
  );
}
