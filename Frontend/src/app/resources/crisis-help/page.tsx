"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Globe2,
  HeartHandshake,
  Info,
  LifeBuoy,
  LogOut,
  MessageCircleHeart,
  Phone,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import "../../../styles/crisis-help.css";

const crisisResources = [
  {
    country: "United States",
    region: "988 Suicide & Crisis Lifeline",
    number: "988",
    description:
      "Call or text 988 to reach the Suicide & Crisis Lifeline for crisis support in the United States.",
    actionLabel: "Call 988",
    type: "mental-health",
    icon: HeartHandshake,
  },
  {
    country: "United Kingdom",
    region: "Emergency services",
    number: "999",
    description:
      "Use 999 when there is an immediate emergency requiring police, ambulance, or other emergency assistance.",
    actionLabel: "Call 999",
    type: "emergency",
    icon: Siren,
  },
  {
    country: "Australia",
    region: "Emergency services",
    number: "000",
    description:
      "Use 000 for emergency police, fire, or ambulance assistance.",
    actionLabel: "Call 000",
    type: "emergency",
    icon: Siren,
  },
  {
    country: "Canada",
    region: "Emergency services",
    number: "911",
    description:
      "Use 911 for immediate emergency assistance in Canada.",
    actionLabel: "Call 911",
    type: "emergency",
    icon: Siren,
  },
];

const safetySteps = [
  {
    number: "01",
    title: "Move somewhere safer",
    description:
      "If possible, move away from anything you could use to hurt yourself and stay near a trusted person.",
  },
  {
    number: "02",
    title: "Reach out now",
    description:
      "Call an appropriate emergency service or crisis line. You do not need to wait until things become worse.",
  },
  {
    number: "03",
    title: "Tell someone you trust",
    description:
      "A friend, family member, teacher, counsellor, or healthcare professional can help you stay supported.",
  },
];

const CrisisHelpPage = () => {
  const router = useRouter();

  const exitToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <main className="crisis-page">
      {/* ========================= TOP BAR ========================= */}

      <div className="crisis-topbar">
        <Button onClick={exitToDashboard} className="exit-btn">
          <LogOut className="btn-icon-small" />
          <span>Exit</span>
        </Button>
      </div>

      {/* ========================= HERO ========================= */}

      <motion.section
        className="crisis-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="crisis-hero-icon" aria-hidden="true">
          <LifeBuoy size={30} />
        </div>

        <span className="crisis-eyebrow">
          SUPPORT WHEN YOU NEED IT
        </span>

        <h1>
          You deserve support.
          <span>Help is available.</span>
        </h1>

        <p>
          If you or someone around you is in immediate danger, use
          emergency services. If you are experiencing emotional distress,
          crisis, or thoughts of harming yourself, a crisis or
          mental-health service can help you take the next step.
        </p>
      </motion.section>

      {/* ========================= IMMEDIATE DANGER ========================= */}

      <motion.section
        className="immediate-help"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        aria-labelledby="immediate-help-title"
      >
        <div className="immediate-icon" aria-hidden="true">
          <ShieldAlert size={25} />
        </div>

        <div className="immediate-content">
          <span className="crisis-eyebrow">
            IF THERE IS IMMEDIATE DANGER
          </span>

          <h2 id="immediate-help-title">
            Contact your local emergency service now.
          </h2>

          <p>
            If someone is seriously injured, in immediate danger, or
            cannot keep themselves safe, call the emergency number for
            your location or go to the nearest emergency department.
          </p>
        </div>
      </motion.section>

      {/* ========================= INDIA SUPPORT ========================= */}

      <section
        className="featured-crisis-section"
        aria-labelledby="india-support-title"
      >
        <div className="section-heading">
          <div>
            <span className="crisis-eyebrow">FOR INDIA</span>

            <h2 id="india-support-title">
              Mental-health support
            </h2>
          </div>

          <p>
            A national service for people seeking mental-health support.
          </p>
        </div>

        <Card className="featured-crisis-card">
          <CardContent>
            <div className="featured-left">
              <div className="featured-icon" aria-hidden="true">
                <MessageCircleHeart size={27} />
              </div>

              <div className="featured-information">
                <div className="verified-label">
                  <CheckCircle2 size={15} />
                  <span>Government mental-health programme</span>
                </div>

                <h3>Tele-MANAS</h3>

                <p>
                  Tele-MANAS is India&apos;s national tele-mental-health
                  programme. The Government of India states that the
                  service is available 24×7 and provides counselling
                  with links to additional mental-health services.
                </p>

                <div className="phone-options">
                  <a
                    href="tel:14416"
                    className="primary-call-button"
                    aria-label="Call Tele-MANAS at 14416"
                  >
                    <Phone size={19} />

                    <span>
                      <small>Call now</small>
                      14416
                    </span>
                  </a>

                  <a
                    href="tel:18008914416"
                    className="secondary-call-button"
                    aria-label="Call Tele-MANAS alternate number 1800 89 14416"
                  >
                    <Phone size={17} />

                    <span>
                      <small>Alternate number</small>
                      1800-89-14416
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <div className="featured-note">
              <Info size={17} aria-hidden="true" />

              <span>
                You can reach out even if you are unsure whether your
                situation is a crisis.
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ========================= OTHER LOCATIONS ========================= */}

      <section
        className="country-section"
        aria-labelledby="country-resources-title"
      >
        <div className="section-heading">
          <div>
            <span className="crisis-eyebrow">OTHER LOCATIONS</span>

            <h2 id="country-resources-title">
              Crisis &amp; emergency numbers
            </h2>
          </div>

          <p>
            Choose the resource that matches your current location.
          </p>
        </div>

        <div className="crisis-grid">
          {crisisResources.map((resource, index) => {
            const Icon = resource.icon;

            return (
              <motion.div
                key={resource.country}
                className="country-card-wrapper"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.07,
                  duration: 0.35,
                }}
              >
                <Card className="country-card">
                  <CardContent>
                    <div className="country-card-top">
                      <div className="country-icon" aria-hidden="true">
                        <Icon size={21} />
                      </div>

                      <span
                        className={
                          resource.type === "emergency"
                            ? "resource-type emergency-type"
                            : "resource-type mental-type"
                        }
                      >
                        {resource.type === "emergency"
                          ? "Emergency"
                          : "Mental health"}
                      </span>
                    </div>

                    <h3>{resource.country}</h3>

                    <span className="country-region">
                      {resource.region}
                    </span>

                    <p>{resource.description}</p>

                    <a
                      href={`tel:${resource.number}`}
                      className="country-call-button"
                      aria-label={`${resource.actionLabel}, ${resource.number}`}
                    >
                      <Phone size={17} />

                      <span>{resource.actionLabel}</span>

                      <strong>{resource.number}</strong>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================= INTERNATIONAL RESOURCE ========================= */}

      <section
        className="international-card"
        aria-labelledby="international-title"
      >
        <div className="international-icon" aria-hidden="true">
          <Globe2 size={24} />
        </div>

        <div className="international-content">
          <span className="crisis-eyebrow">
            OUTSIDE THESE LOCATIONS?
          </span>

          <h2 id="international-title">
            Find a crisis centre in your country
          </h2>

          <p>
            The International Association for Suicide Prevention
            maintains a directory of crisis centres and services in
            different countries.
          </p>
        </div>

        <a
          href="https://www.iasp.info/resources/Crisis_Centres/"
          target="_blank"
          rel="noopener noreferrer"
          className="international-button"
        >
          <span>Find local support</span>
          <ArrowUpRight size={17} />
        </a>
      </section>

      {/* ========================= SAFETY STEPS ========================= */}

      <section
        className="safety-section"
        aria-labelledby="safety-title"
      >
        <div className="section-heading">
          <div>
            <span className="crisis-eyebrow">RIGHT NOW</span>

            <h2 id="safety-title">
              If you&apos;re struggling, start small.
            </h2>
          </div>

          <p>
            You only need to focus on the next safe step.
          </p>
        </div>

        <div className="safety-grid">
          {safetySteps.map((step, index) => (
            <motion.div
              key={step.number}
              className="safety-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
                duration: 0.35,
              }}
            >
              <span className="safety-number">
                {step.number}
              </span>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================= IMPORTANT NOTE ========================= */}

      <section
        className="crisis-disclaimer"
        aria-labelledby="important-note-title"
      >
        <div className="disclaimer-icon" aria-hidden="true">
          <AlertTriangle size={21} />
        </div>

        <div>
          <h2 id="important-note-title">
            Important
          </h2>

          <p>
            This page provides general information and links to support
            services. It is not a substitute for assessment, diagnosis,
            or treatment from a qualified professional. If you are in
            immediate danger, contact emergency services rather than
            relying on this website.
          </p>
        </div>
      </section>

      {/* ========================= BOTTOM NAVIGATION ========================= */}

      <div className="crisis-bottom-nav">
        <Button
          onClick={exitToDashboard}
          variant="outline"
          className="dashboard-button"
        >
          <ArrowLeft size={17} />
          <span>Back to Dashboard</span>
        </Button>
      </div>
    </main>
  );
};

export default CrisisHelpPage;