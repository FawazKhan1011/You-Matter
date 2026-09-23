"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CloudRain,
  Flame,
  Headphones,
  Leaf,
  LogOut,
  Moon,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Waves,
  Wind,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import "../../styles/relaxation.css";

type SoundCategory = "All" | "Relax" | "Sleep" | "Focus" | "Nature";

type SoundPreset = {
  id: string;
  title: string;
  description: string;
  category: Exclude<SoundCategory, "All">;
  icon: React.ElementType;
  color: string;
};

const sounds: SoundPreset[] = [
  {
    id: "rain",
    title: "Gentle Rain",
    description: "Soft rainfall to create a calm, peaceful atmosphere.",
    category: "Relax",
    icon: CloudRain,
    color: "purple",
  },
  {
    id: "ocean",
    title: "Ocean Waves",
    description: "Slow, rhythmic waves for unwinding and quiet moments.",
    category: "Nature",
    icon: Waves,
    color: "blue",
  },
  {
    id: "white-noise",
    title: "White Noise",
    description: "A steady neutral sound for concentration and relaxation.",
    category: "Focus",
    icon: Radio,
    color: "indigo",
  },
  {
    id: "brown-noise",
    title: "Brown Noise",
    description: "A deeper, softer noise that can help create a restful environment.",
    category: "Sleep",
    icon: Wind,
    color: "teal",
  },
  {
    id: "forest",
    title: "Forest Breeze",
    description: "A gentle natural ambience inspired by a quiet forest.",
    category: "Nature",
    icon: Leaf,
    color: "green",
  },
  {
    id: "fireplace",
    title: "Cozy Fireplace",
    description: "A warm crackling ambience for peaceful evenings.",
    category: "Relax",
    icon: Flame,
    color: "orange",
  },
];

const TIMER_OPTIONS = [
  { label: "Off", minutes: 0 },
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "60 min", minutes: 60 },
];

export default function RelaxationPage() {
  const router = useRouter();

  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [category, setCategory] = useState<SoundCategory>("All");
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAudioNodes = useCallback(() => {
    nodesRef.current.forEach((node) => {
      try {
        if ("stop" in node && typeof node.stop === "function") {
          (node as AudioBufferSourceNode).stop();
        }
      } catch {
        // Node may already be stopped.
      }

      try {
        node.disconnect();
      } catch {
        // Node may already be disconnected.
      }
    });

    nodesRef.current = [];
  }, []);

  const createNoiseBuffer = useCallback(
    (
      context: AudioContext,
      type: "white" | "brown" | "pink"
    ): AudioBuffer => {
      const bufferSize = context.sampleRate * 4;
      const buffer = context.createBuffer(
        1,
        bufferSize,
        context.sampleRate
      );

      const output = buffer.getChannelData(0);

      let lastOut = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;

        if (type === "white") {
          output[i] = white;
        } else if (type === "brown") {
          lastOut = lastOut * 0.985 + white * 0.06;
          output[i] = lastOut * 3.5;
        } else {
          output[i] =
            (0.99765 * (lastOut = 0.86 * lastOut + white * 0.55) +
              0.0325 * white) /
            1.029;
        }
      }

      return buffer;
    },
    []
  );

  const connectNoise = useCallback(
    (
      context: AudioContext,
      destination: AudioNode,
      type: "white" | "brown" | "pink",
      gainValue: number,
      filterFrequency?: number
    ) => {
      const source = context.createBufferSource();
      source.buffer = createNoiseBuffer(context, type);
      source.loop = true;

      const gain = context.createGain();
      gain.gain.value = gainValue;

      if (filterFrequency) {
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = filterFrequency;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        nodesRef.current.push(source, filter, gain);
      } else {
        source.connect(gain);
        gain.connect(destination);

        nodesRef.current.push(source, gain);
      }

      source.start();
    },
    [createNoiseBuffer]
  );

  const startSound = useCallback(
    async (soundId: string) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();

        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.gain.value = volume;

        masterGainRef.current.connect(
          audioContextRef.current.destination
        );
      }

      const context = audioContextRef.current;
      const master = masterGainRef.current!;

      if (context.state === "suspended") {
        await context.resume();
      }

      stopAudioNodes();

      switch (soundId) {
        case "rain": {
          connectNoise(
            context,
            master,
            "pink",
            0.42,
            4200
          );

          const rumble = context.createOscillator();
          const rumbleGain = context.createGain();

          rumble.type = "sine";
          rumble.frequency.value = 75;
          rumbleGain.gain.value = 0.025;

          rumble.connect(rumbleGain);
          rumbleGain.connect(master);

          rumble.start();

          nodesRef.current.push(rumble, rumbleGain);
          break;
        }

        case "ocean": {
          connectNoise(
            context,
            master,
            "brown",
            0.23,
            1000
          );

          const wave = context.createOscillator();
          const waveGain = context.createGain();

          wave.type = "sine";
          wave.frequency.value = 0.085;

          waveGain.gain.value = 0.25;

          wave.connect(waveGain);
          waveGain.connect(master);

          wave.start();

          nodesRef.current.push(wave, waveGain);
          break;
        }

        case "white-noise": {
          connectNoise(context, master, "white", 0.32);
          break;
        }

        case "brown-noise": {
          connectNoise(context, master, "brown", 0.42);
          break;
        }

        case "forest": {
          connectNoise(
            context,
            master,
            "pink",
            0.18,
            2600
          );

          const breeze = context.createOscillator();
          const breezeGain = context.createGain();

          breeze.type = "sine";
          breeze.frequency.value = 0.11;
          breezeGain.gain.value = 0.08;

          breeze.connect(breezeGain);
          breezeGain.connect(master);

          breeze.start();

          nodesRef.current.push(
            breeze,
            breezeGain
          );
          break;
        }

        case "fireplace": {
          connectNoise(
            context,
            master,
            "pink",
            0.24,
            1800
          );

          const fire = context.createOscillator();
          const fireGain = context.createGain();

          fire.type = "sawtooth";
          fire.frequency.value = 45;
          fireGain.gain.value = 0.035;

          fire.connect(fireGain);
          fireGain.connect(master);

          fire.start();

          nodesRef.current.push(fire, fireGain);
          break;
        }

        default:
          break;
      }

      setActiveSound(soundId);
      setIsPlaying(true);
    },
    [connectNoise, stopAudioNodes, volume]
  );

  const stopSound = useCallback(() => {
    stopAudioNodes();
    setIsPlaying(false);
  }, [stopAudioNodes]);

  const toggleSound = async (soundId: string) => {
    if (activeSound === soundId && isPlaying) {
      stopSound();
      return;
    }

    await startSound(soundId);
  };

  const handleVolumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(event.target.value);

    setVolume(value);

    if (masterGainRef.current) {
      masterGainRef.current.gain.value = value;
    }
  };

  const selectTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    setTimeRemaining(minutes * 60);
  };

  const resetTimer = () => {
    setTimerMinutes(0);
    setTimeRemaining(0);
  };

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isPlaying || timeRemaining <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          stopSound();
          setTimerMinutes(0);

          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining, stopSound]);

  useEffect(() => {
    return () => {
      stopAudioNodes();

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stopAudioNodes]);

  const filteredSounds =
    category === "All"
      ? sounds
      : sounds.filter((sound) => sound.category === category);

  const activePreset = sounds.find(
    (sound) => sound.id === activeSound
  );

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const exitToDashboard = () => {
    stopSound();
    router.push("/dashboard");
  };

  return (
    <main className="relaxation-page">
      <div className="relaxation-topbar">
        <button
          className="relaxation-back"
          onClick={() => router.push("/dashboard")}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <Button
          onClick={exitToDashboard}
          className="exit-btn"
        >
          <LogOut className="btn-icon-small" />
          Exit
        </Button>
      </div>

      <section className="relaxation-hero">
        <div className="hero-icon">
          <Headphones size={27} />
        </div>

        <span className="relaxation-eyebrow">
          YOUR QUIET SPACE
        </span>

        <h1>
          Take a moment to
          <span>slow down.</span>
        </h1>

        <p>
          Choose a sound, settle in, and give yourself a few
          peaceful minutes. Everything here plays directly in
          your browser.
        </p>
      </section>

      <section className="now-playing-section">
        <div className="now-playing-card">
          <div className="now-playing-visual">
            <div className="sound-orb">
              {activePreset ? (
                React.createElement(activePreset.icon, {
                  size: 34,
                })
              ) : (
                <Moon size={34} />
              )}
            </div>

            <div
              className={`visualizer ${
                isPlaying ? "is-playing" : ""
              }`}
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="now-playing-info">
            <span className="now-playing-label">
              {isPlaying ? "NOW PLAYING" : "READY WHEN YOU ARE"}
            </span>

            <h2>
              {activePreset
                ? activePreset.title
                : "Choose a peaceful sound"}
            </h2>

            <p>
              {activePreset
                ? activePreset.description
                : "Pick something below and create your own calm space."}
            </p>
          </div>

          <button
            className={`main-play-button ${
              isPlaying ? "playing" : ""
            }`}
            onClick={() => {
              if (activeSound) {
                toggleSound(activeSound);
              } else {
                toggleSound(sounds[0].id);
              }
            }}
            aria-label={
              isPlaying
                ? "Pause current sound"
                : "Play current sound"
            }
          >
            {isPlaying ? (
              <Pause size={25} fill="currentColor" />
            ) : (
              <Play size={25} fill="currentColor" />
            )}
          </button>
        </div>
      </section>

      <section className="controls-section">
        <div className="control-card">
          <div className="control-heading">
            <div className="control-icon">
              {volume === 0 ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </div>

            <div>
              <h3>Volume</h3>
              <p>Adjust your listening level</p>
            </div>

            <strong>{Math.round(volume * 100)}%</strong>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="wellness-slider"
            aria-label="Volume"
          />
        </div>

        <div className="control-card">
          <div className="control-heading">
            <div className="control-icon timer-icon">
              <Moon size={18} />
            </div>

            <div>
              <h3>Sleep timer</h3>
              <p>
                {timeRemaining > 0
                  ? `${formatTime(timeRemaining)} remaining`
                  : "Choose how long to play"}
              </p>
            </div>

            {timeRemaining > 0 && (
              <button
                className="reset-timer"
                onClick={resetTimer}
                aria-label="Reset sleep timer"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>

          <div className="timer-options">
            {TIMER_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                className={
                  timerMinutes === option.minutes
                    ? "timer-option active"
                    : "timer-option"
                }
                onClick={() => selectTimer(option.minutes)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="library-section"
        aria-labelledby="library-title"
      >
        <div className="section-heading">
          <div>
            <span className="relaxation-eyebrow">
              SOUND LIBRARY
            </span>
            <h2 id="library-title">
              Find your kind of calm
            </h2>
          </div>

          <p>
            Explore gentle soundscapes designed for different
            moments throughout your day.
          </p>
        </div>

        <div
          className="category-tabs"
          role="tablist"
          aria-label="Sound categories"
        >
          {(
            [
              "All",
              "Relax",
              "Sleep",
              "Focus",
              "Nature",
            ] as SoundCategory[]
          ).map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={category === item}
              className={
                category === item
                  ? "category-tab active"
                  : "category-tab"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="sound-grid">
          {filteredSounds.map((sound) => {
            const Icon = sound.icon;
            const playing =
              activeSound === sound.id && isPlaying;

            return (
              <article
                key={sound.id}
                className={`sound-card ${sound.color} ${
                  playing ? "currently-playing" : ""
                }`}
              >
                <div className="sound-card-top">
                  <div className="sound-icon">
                    <Icon size={23} />
                  </div>

                  {playing && (
                    <span className="playing-pill">
                      Playing
                    </span>
                  )}
                </div>

                <div className="sound-card-content">
                  <span className="sound-category">
                    {sound.category}
                  </span>

                  <h3>{sound.title}</h3>

                  <p>{sound.description}</p>
                </div>

                <button
                  className="sound-play-button"
                  onClick={() => toggleSound(sound.id)}
                  aria-label={
                    playing
                      ? `Pause ${sound.title}`
                      : `Play ${sound.title}`
                  }
                >
                  {playing ? (
                    <>
                      <Pause size={17} fill="currentColor" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play size={17} fill="currentColor" />
                      Play
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="wellness-note">
        <div className="wellness-note-icon">
          <Leaf size={21} />
        </div>

        <div>
          <h2>A small reminder</h2>
          <p>
            You don't have to make this moment productive.
            Sometimes taking a few quiet minutes for yourself
            is enough.
          </p>
        </div>
      </section>

      <div className="bottom-navigation">
        <Button
          variant="outline"
          className="dashboard-button"
          onClick={() => {
            stopSound();
            router.push("/dashboard");
          }}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Button>
      </div>
    </main>
  );
}