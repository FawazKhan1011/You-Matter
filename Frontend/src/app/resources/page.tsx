"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Brain, Clock3, HeartHandshake, Headphones, LogOut, Moon, PlayCircle, Sparkles, Wind } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "../../styles/resources.css";
import { useEffect } from "react";
import { trackEvent } from "@/lib/activityTracker";
const categories = [
  {
    title: "Stress & Anxiety",
    description:
      "Practical tools for calming your mind and understanding stress.",
    icon: Brain,
    color: "purple",
  },
  {
    title: "Mindfulness",
    description: "Simple exercises to reconnect with the present moment.",
    icon: Sparkles,
    color: "blue",
  },
  {
    title: "Better Sleep",
    description: "Healthy routines and habits that support restful sleep.",
    icon: Moon,
    color: "indigo",
  },
  {
    title: "Breathing & Relaxation",
    description:
      "Short guided practices you can use whenever you feel overwhelmed.",
    icon: Wind,
    color: "teal",
  },
];
const videos = [
  {
    id: 1,
    title: "Mindfulness Meditation for Beginners",
    description:
      "A gentle introduction to mindfulness for people who are new to meditation.",
    duration: "Beginner",
    category: "Mindfulness",
    embedUrl: "https://www.youtube.com/embed/inpok4MKVLM",
  },
  {
    id: 2,
    title: "Breathing Exercise for Anxiety",
    description:
      "A short breathing practice designed to help you slow down and reconnect with the present.",
    duration: "5 min",
    category: "Breathing",
    embedUrl: "https://www.youtube.com/embed/odADwWzHR24",
  },
  {
    id: 3,
    title: "Guided Body Scan Meditation",
    description:
      "A calm body-awareness practice that can help you notice physical sensations without judgment.",
    duration: "Guided",
    category: "Relaxation",
    embedUrl: "https://www.youtube.com/embed/sTpo1FuYQ9I",
  },
  {
    id: 4,
    title: "Progressive Muscle Relaxation",
    description:
      "Learn a structured relaxation technique that works through different muscle groups.",
    duration: "Guided",
    category: "Relaxation",
    embedUrl: "https://www.youtube.com/embed/1nZEdqcGVzo",
  },
];
const articles = [
  {
    id: 1,
    title: "I'm So Stressed Out! Fact Sheet",
    description:
      "Understand the difference between everyday stress and anxiety, and learn practical coping strategies.",
    source: "National Institute of Mental Health",
    category: "Stress",
    readTime: "5 min read",
    url: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet",
  },
  {
    id: 2,
    title: "Caring for Your Mental Health",
    description:
      "Evidence-informed guidance covering sleep, exercise, relaxation, social connection and self-care.",
    source: "National Institute of Mental Health",
    category: "Self-care",
    readTime: "6 min read",
    url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
  },
  {
    id: 3,
    title: "Do I Need Help?",
    description:
      "A practical guide for recognizing when symptoms may be affecting everyday life and when to seek support.",
    source: "National Institute of Mental Health",
    category: "Getting Help",
    readTime: "5 min read",
    url: "https://www.nimh.nih.gov/health/publications/my-mental-health-do-i-need-help",
  },
  {
    id: 4,
    title: "Psychotherapies",
    description:
      "Learn what psychotherapy is, how it works and the different approaches professionals may use.",
    source: "National Institute of Mental Health",
    category: "Therapy",
    readTime: "8 min read",
    url: "https://www.nimh.nih.gov/health/topics/psychotherapies",
  },
];
const blogs = [
  {
    id: 1,
    title: "Building Healthy Habits",
    description:
      "Explore practical ideas for creating small routines that support your overall well-being.",
    source: "James Clear",
    category: "Habits",
    url: "https://jamesclear.com/habits",
  },
  {
    id: 2,
    title: "Sleep Hygiene",
    description:
      "Learn how consistent routines and a supportive sleep environment can improve sleep habits.",
    source: "Sleep Foundation",
    category: "Sleep",
    url: "https://www.sleepfoundation.org/sleep-hygiene",
  },
  {
    id: 3,
    title: "Mindfulness: How to Do It",
    description:
      "A beginner-friendly introduction to practicing mindfulness in everyday life.",
    source: "Mindful",
    category: "Mindfulness",
    url: "https://www.mindful.org/mindfulness-how-to-do-it/",
  },
];
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const ResourcesPage = () => {
  useEffect(() => {
    trackEvent('page_visit', { page: 'resources' });
  }, []);

  const router = useRouter();

const exitToDashboard = () => {
  router.push("/dashboard");
};
  return (
    
    <main className="resources-page" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
        <Button variant="outline" onClick={exitToDashboard} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={16} />
          Exit
        </Button>
      </div>
      {" "}
      {/* Hero */}{" "}
      <motion.section
        className="resources-hero"
        initial="initial"
        animate="animate"
        variants={fadeUp}
        transition={{ duration: 0.5 }}
      >
        {" "}
        <div className="hero-badge">
          {" "}
          <HeartHandshake size={16} /> Your mental wellness library{" "}
        </div>{" "}
        <h1>
          {" "}
          Support for your <span> mind & well-being.</span>{" "}
        </h1>{" "}
        <p>
          {" "}
          Explore guided practices, trusted mental-health information, and
          practical resources designed to help you understand yourself and build
          healthier daily habits.{" "}
        </p>{" "}
        <div className="hero-note">
          {" "}
          <BookOpen size={17} />{" "}
          <span>
            {" "}
            Educational resources are not a substitute for professional
            mental-health care.{" "}
          </span>{" "}
        </div>{" "}
      </motion.section>{" "}
      {/* Quick navigation */}{" "}
      <section className="resources-section">
        {" "}
        <div className="section-heading">
          {" "}
          <div>
            {" "}
            <span className="eyebrow">EXPLORE</span>{" "}
            <h2>What do you need today?</h2>{" "}
          </div>{" "}
          <p>Start with a topic that feels relevant to you.</p>{" "}
        </div>{" "}
        <div className="category-grid">
          {" "}
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.a
                href={`#${category.title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`}
                className={`category-card ${category.color}`}
                key={category.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                {" "}
                <div className="category-icon">
                  {" "}
                  <Icon size={22} />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h3>{category.title}</h3> <p>{category.description}</p>{" "}
                </div>{" "}
                <ArrowUpRight className="category-arrow" size={19} />{" "}
              </motion.a>
            );
          })}{" "}
        </div>{" "}
      </section>{" "}
      {/* Guided videos */}{" "}
      <section className="resources-section" id="breathing-and-relaxation">
        {" "}
        <div className="section-heading">
          {" "}
          <div>
            {" "}
            <span className="eyebrow">WATCH & PRACTICE</span>{" "}
            <h2>Guided practices</h2>{" "}
          </div>{" "}
          <p>Take a few minutes to slow down, breathe and reset.</p>{" "}
        </div>{" "}
        <div className="video-grid">
          {" "}
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              className="video-resource-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              {" "}
              <Card>
                {" "}
                <div className="video-wrapper">
                  {" "}
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />{" "}
                  <div className="video-label">
                    {" "}
                    <PlayCircle size={15} /> Guided practice{" "}
                  </div>{" "}
                </div>{" "}
                <CardContent className="video-content">
                  {" "}
                  <div className="resource-meta">
                    {" "}
                    <span>{video.category}</span>{" "}
                    <span>
                      {" "}
                      <Clock3 size={14} /> {video.duration}{" "}
                    </span>{" "}
                  </div>{" "}
                  <h3>{video.title}</h3> <p>{video.description}</p>{" "}
                </CardContent>{" "}
              </Card>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
      </section>{" "}
      {/* Articles */}{" "}
      <section className="resources-section" id="stress-and-anxiety">
        {" "}
        <div className="section-heading">
          {" "}
          <div>
            {" "}
            <span className="eyebrow">LEARN</span>{" "}
            <h2>Trusted articles</h2>{" "}
          </div>{" "}
          <p>
            Evidence-informed information from established health sources.
          </p>{" "}
        </div>{" "}
        <div className="article-grid">
          {" "}
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
            >
              {" "}
              <Card className="article-card">
                {" "}
                <CardContent>
                  {" "}
                  <div className="article-top">
                    {" "}
                    <span className="resource-tag">
                      {article.category}
                    </span>{" "}
                    <BookOpen size={19} />{" "}
                  </div>{" "}
                  <h3>{article.title}</h3> <p>{article.description}</p>{" "}
                  <div className="article-footer">
                    {" "}
                    <div>
                      {" "}
                      <strong>{article.source}</strong>{" "}
                      <span>{article.readTime}</span>{" "}
                    </div>{" "}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Read ${article.title}`}
                    >
                      {" "}
                      <ArrowUpRight size={18} />{" "}
                    </a>{" "}
                  </div>{" "}
                </CardContent>{" "}
              </Card>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
      </section>{" "}
      {/* Blogs */}{" "}
      <section className="resources-section" id="mindfulness">
        {" "}
        <div className="section-heading">
          {" "}
          <div>
            {" "}
            <span className="eyebrow">DISCOVER</span>{" "}
            <h2>Helpful reads & blogs</h2>{" "}
          </div>{" "}
          <p>Longer-form ideas for everyday growth and well-being.</p>{" "}
        </div>{" "}
        <div className="blog-grid">
          {" "}
          {blogs.map((blog, index) => (
            <motion.a
              key={blog.id}
              href={blog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="blog-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              {" "}
              <div className="blog-icon">
                {" "}
                <Headphones size={21} />{" "}
              </div>{" "}
              <div className="blog-body">
                {" "}
                <span>{blog.category}</span> <h3>{blog.title}</h3>{" "}
                <p>{blog.description}</p>{" "}
                <strong>
                  {" "}
                  Read from {blog.source} <ArrowUpRight size={16} />{" "}
                </strong>{" "}
              </div>{" "}
            </motion.a>
          ))}{" "}
        </div>{" "}
      </section>{" "}
      {/* Better sleep anchor */}{" "}
      <section className="sleep-callout" id="better-sleep">
        {" "}
        <div className="sleep-icon">
          {" "}
          <Moon size={28} />{" "}
        </div>{" "}
        <div>
          {" "}
          <span className="eyebrow">A GENTLE REMINDER</span>{" "}
          <h2>Small habits can support your mental health.</h2>{" "}
          <p>
            {" "}
            Regular sleep, movement, relaxation, meaningful connection and
            realistic daily priorities can all contribute to mental
            well-being.{" "}
          </p>{" "}
        </div>{" "}
        <a
          href="https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-resource-button"
        >
          {" "}
          Learn more <ArrowUpRight size={17} />{" "}
        </a>{" "}
      </section>{" "}
      {/* Professional help */}{" "}
      <section className="professional-help">
        {" "}
        <div className="professional-icon">
          {" "}
          <HeartHandshake size={25} />{" "}
        </div>{" "}
        <div>
          {" "}
          <span className="eyebrow">WHEN YOU NEED MORE SUPPORT</span>{" "}
          <h2>You don't have to handle everything alone.</h2>{" "}
          <p>
            {" "}
            If difficult feelings or symptoms persist, become severe, or start
            interfering with everyday life, consider speaking with a qualified
            mental-health professional.{" "}
          </p>{" "}
        </div>{" "}
        <a
          href="https://www.nimh.nih.gov/health/find-help"
          target="_blank"
          rel="noopener noreferrer"
          className="secondary-resource-button"
        >
          {" "}
          Find help <ArrowUpRight size={17} />{" "}
        </a>{" "}
      </section>{" "}
    </main>
  );
};
export default ResourcesPage;
