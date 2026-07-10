"use client";

import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  Cloud,
  CloudOff,
  ExternalLink,
  Gem,
  Globe,
  Home,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Play,
  RefreshCw,
  Settings,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocaleStore } from "@/lib/stores";
import { avatars, badgeCatalog, subjects, type Lesson, type Subject, type SubjectId } from "./learning-data";

type Tab = "home" | "learn" | "arcade" | "badges" | "progress" | "parent";
type SyncState = "saved" | "saving" | "offline";
type Difficulty = "Easy" | "Medium" | "Hard";

type SubjectStats = { completed: number; correct: number; total: number };
type Progress = {
  xp: number;
  lessonsCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  streak: number;
  longestStreak: number;
  badges: string[];
  subjectProgress: Record<SubjectId, SubjectStats>;
  weeklyActivity: number[];
  lastPlayed: string;
};

type ParentSettings = {
  difficulty: Difficulty;
  dailyLimit: number;
  soundEnabled: boolean;
  enabledSubjects: Record<SubjectId, boolean>;
};

const subjectProgress = (): Record<SubjectId, SubjectStats> => ({
  mandarin: { completed: 0, correct: 0, total: 0 },
  math: { completed: 0, correct: 0, total: 0 },
  english: { completed: 0, correct: 0, total: 0 },
  science: { completed: 0, correct: 0, total: 0 },
  coding: { completed: 0, correct: 0, total: 0 },
});

const defaultProgress: Progress = {
  xp: 0,
  lessonsCompleted: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  streak: 0,
  longestStreak: 0,
  badges: [],
  subjectProgress: subjectProgress(),
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  lastPlayed: "",
};

const defaultSettings: ParentSettings = {
  difficulty: "Easy",
  dailyLimit: 30,
  soundEnabled: true,
  enabledSubjects: { mandarin: true, math: true, english: true, science: true, coding: true },
};

const appName = "Luth's Playground";
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const levelForXp = (xp: number) => Math.floor(xp / 150) + 1;
const nextLevelXp = (xp: number) => (Math.floor(xp / 150) + 1) * 150;
const accuracy = (correct: number, total: number) => (total ? Math.round((correct / total) * 100) : 0);
const todayKey = () => new Date().toISOString().slice(0, 10);

function playTone(kind: "correct" | "wrong" | "complete" | "bonus", enabled = true) {
  if (!enabled || typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const context = new AudioCtx();
  const notes = kind === "correct" ? [523, 659] : kind === "complete" ? [523, 659, 784, 1046] : kind === "bonus" ? [587, 784, 880] : [220, 180];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "wrong" ? "sawtooth" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.01 + index * 0.11);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18 + index * 0.11);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + index * 0.11);
    oscillator.stop(context.currentTime + 0.23 + index * 0.11);
  });
  window.setTimeout(() => void context.close(), 800);
}

function speak(text: string, language = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[🎨🐼🔢👋🧱➕🔷⚖️🏆🔤✨🎵↔️📚🦁🌱🌦️🫀🔬🔁🤖🐞🧠👾🐶💡⚡]/gu, "");
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = language;
  utterance.rate = language === "zh-CN" ? 0.72 : 0.88;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}

function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();
  return (
    <div className="lang-switcher" role="group" aria-label="Switch language">
      <button
        className={`lang-option ${locale === "en" ? "active-en" : "dimmed"}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label="Switch to English"
      >
        <span className="lang-switcher-label">EN</span>
        <span aria-hidden="true">🇬🇧</span>
      </button>
      <button
        className={`lang-option ${locale === "ms" ? "active-ms" : "dimmed"}`}
        onClick={() => setLocale("ms")}
        aria-pressed={locale === "ms"}
        aria-label="Switch to Malay"
      >
        <span className="lang-switcher-label">MS</span>
        <span aria-hidden="true">🇲🇾</span>
      </button>
    </div>
  );
}

export default function LearningApp() {
  const t = useTranslations();
  const { locale } = useLocaleStore();
  const lessonLanguage = useRef<"en" | "ms">("ms");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [settings, setSettings] = useState<ParentSettings>(defaultSettings);
  const [playerName, setPlayerName] = useState("Luth");
  const [avatar, setAvatar] = useState("🧑‍🚀");
  const [deviceId, setDeviceId] = useState("");
  const [syncState, setSyncState] = useState<SyncState>("saved");
  const [syncVersion, setSyncVersion] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [selected, setSelected] = useState<{ subject: Subject; lesson: Lesson } | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lessonScore, setLessonScore] = useState(0);
  const [lessonResult, setLessonResult] = useState<{ score: number; xp: number; perfect: boolean } | null>(null);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [pinAttempt, setPinAttempt] = useState("");
  const [pinError, setPinError] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const awardBadges = useCallback((candidate: Progress, subject?: SubjectId, perfect?: boolean) => {
    const earned = new Set(candidate.badges);
    if (candidate.lessonsCompleted >= 1) earned.add("first");
    if (perfect) earned.add("perfect");
    if (subject === "coding") earned.add("pattern");
    if (candidate.xp >= 100) earned.add("xp100");
    if (candidate.xp >= 500) earned.add("xp500");
    if (candidate.streak >= 3) earned.add("streak3");
    if (candidate.streak >= 7) earned.add("streak7");
    if (candidate.streak >= 30) earned.add("streak30");
    if (subject) {
      const completed = candidate.subjectProgress[subject].completed;
      if (completed >= 1) earned.add(`${subject}1`);
      if (completed >= 3) earned.add(`${subject}3`);
      if (completed >= 5) earned.add(`${subject}5`);
      if (subject === "science") earned.add("curious");
      if (subject === "english") earned.add("wordsmith");
      if (subject === "math") earned.add("number");
    }
    if (subjects.every((item) => candidate.subjectProgress[item.id].completed > 0)) earned.add("allround");
    return [...earned];
  }, []);

  const saveProgress = useCallback(async (next: Progress) => {
    setProgress(next);
    localStorage.setItem("luthsplayground-progress", JSON.stringify(next));
    localStorage.setItem("blockbright-progress", JSON.stringify(next));
    if (!navigator.onLine) {
      setSyncState("offline");
      return;
    }
    const id = deviceId || localStorage.getItem("luthsplayground-device") || localStorage.getItem("blockbright-device");
    if (!id) return;
    setSyncState("saving");
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: id, playerName, avatar, snapshot: next }),
      });
      if (!response.ok) throw new Error("Sync failed");
      const data = (await response.json()) as { version: number };
      setSyncVersion(data.version);
      setSyncState("saved");
    } catch {
      setSyncState("offline");
    }
  }, [avatar, deviceId, playerName]);

  const earnBonusXp = useCallback((amount: number) => {
    let next: Progress = {
      ...progress,
      xp: progress.xp + amount,
    };
    next = { ...next, badges: awardBadges(next) };
    void saveProgress(next);
    playTone("bonus", settings.soundEnabled);
  }, [progress, settings.soundEnabled, awardBadges, saveProgress]);

  useEffect(() => {
    const savedProgress = localStorage.getItem("luthsplayground-progress") || localStorage.getItem("blockbright-progress");
    const savedSettings = localStorage.getItem("luthsplayground-settings") || localStorage.getItem("blockbright-settings");
    const savedName = localStorage.getItem("luthsplayground-name") || localStorage.getItem("blockbright-name");
    const savedAvatar = localStorage.getItem("luthsplayground-avatar") || localStorage.getItem("blockbright-avatar");
    let id = localStorage.getItem("luthsplayground-device") || localStorage.getItem("blockbright-device");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("luthsplayground-device", id);
      localStorage.setItem("blockbright-device", id);
    }
    window.setTimeout(() => {
      setDeviceId(id);
      if (savedProgress) {
        try { setProgress(JSON.parse(savedProgress) as Progress); } catch { /* keep safe defaults */ }
      }
      if (savedSettings) {
        try { setSettings(JSON.parse(savedSettings) as ParentSettings); } catch { /* keep safe defaults */ }
      }
      if (savedName) setPlayerName(savedName);
      if (savedAvatar) setAvatar(savedAvatar);
      setSyncState(navigator.onLine ? "saved" : "offline");
      setHydrated(true);
    }, 0);

    const online = () => setSyncState("saved");
    const offline = () => setSyncState("offline");
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("luthsplayground-settings", JSON.stringify(settings));
    localStorage.setItem("luthsplayground-name", playerName);
    localStorage.setItem("luthsplayground-avatar", avatar);
    localStorage.setItem("blockbright-settings", JSON.stringify(settings));
    localStorage.setItem("blockbright-name", playerName);
    localStorage.setItem("blockbright-avatar", avatar);
  }, [settings, playerName, avatar, hydrated]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedMinutes((value) => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const dailyMinutes = progress.weeklyActivity[(new Date().getDay() + 6) % 7] ?? 0;
  const currentLevel = levelForXp(progress.xp);
  const levelFloor = (currentLevel - 1) * 150;
  const levelPercent = Math.min(100, ((progress.xp - levelFloor) / 150) * 100);
  const xpToNext = nextLevelXp(progress.xp) - progress.xp;

  const startLesson = (subject: Subject, lesson: Lesson) => {
    if (!settings.enabledSubjects[subject.id]) return;
    lessonLanguage.current = locale;
    setSelected({ subject, lesson });
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setLessonScore(0);
    setLessonResult(null);
    const q0 = lesson.questions[0];
    window.setTimeout(() => speak(q0.speak?.[lessonLanguage.current] || q0.prompt[lessonLanguage.current], subject.id === "mandarin" ? "zh-CN" : lessonLanguage.current === "ms" ? "ms-MY" : "en-US"), 250);
  };

  const chooseAnswer = (index: number) => {
    if (!selected || selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = index === selected.lesson.questions[questionIndex].answer;
    if (isCorrect) setLessonScore((score) => score + 1);
    playTone(isCorrect ? "correct" : "wrong", settings.soundEnabled);
  };

  const localized = <T extends { en: string; ms: string }>(obj: T, l: "en" | "ms"): string => obj[l];

  const finishLesson = () => {
    if (!selected) return;
    const total = selected.lesson.questions.length;
    const score = lessonScore;
    const perfect = score === total;
    const multiplier = settings.difficulty === "Easy" ? 1 : settings.difficulty === "Medium" ? 1.25 : 1.5;
    const earnedXp = Math.round((score * 10 + (perfect ? 20 : 5)) * multiplier);
    const today = todayKey();
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const newStreak = progress.lastPlayed === today ? Math.max(1, progress.streak) : progress.lastPlayed === yesterday ? progress.streak + 1 : 1;
    const nextWeekly = [...progress.weeklyActivity];
    const dayIndex = (new Date().getDay() + 6) % 7;
    nextWeekly[dayIndex] = Math.min(120, (nextWeekly[dayIndex] || 0) + 4);
    const oldStats = progress.subjectProgress[selected.subject.id];
    const nextStats = {
      completed: Math.min(5, oldStats.completed + 1),
      correct: oldStats.correct + score,
      total: oldStats.total + total,
    };
    let next: Progress = {
      ...progress,
      xp: progress.xp + earnedXp,
      lessonsCompleted: progress.lessonsCompleted + 1,
      correctAnswers: progress.correctAnswers + score,
      totalAnswers: progress.totalAnswers + total,
      streak: newStreak,
      longestStreak: Math.max(progress.longestStreak, newStreak),
      lastPlayed: today,
      weeklyActivity: nextWeekly,
      subjectProgress: { ...progress.subjectProgress, [selected.subject.id]: nextStats },
    };
    next = { ...next, badges: awardBadges(next, selected.subject.id, perfect) };
    void saveProgress(next);
    setLessonResult({ score, xp: earnedXp, perfect });
    playTone("complete", settings.soundEnabled);
  };

  const nextQuestion = () => {
    if (!selected) return;
    if (questionIndex === selected.lesson.questions.length - 1) {
      finishLesson();
      return;
    }
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setSelectedAnswer(null);
    const next = selected.lesson.questions[nextIndex];
    window.setTimeout(() => speak(next.speak?.[lessonLanguage.current] || next.prompt[lessonLanguage.current], selected.subject.id === "mandarin" ? "zh-CN" : lessonLanguage.current === "ms" ? "ms-MY" : "en-US"), 180);
  };

  const closeLesson = () => {
    setSelected(null);
    setLessonResult(null);
  };

  const enterPin = (digit: string) => {
    if (pinAttempt.length >= 4) return;
    const next = pinAttempt + digit;
    setPinAttempt(next);
    setPinError(false);
    if (next.length === 4) {
      window.setTimeout(() => {
        if (next === "1234") {
          setParentUnlocked(true);
          setPinAttempt("");
        } else {
          setPinError(true);
          setPinAttempt("");
        }
      }, 180);
    }
  };

  const recommendation = useMemo(() => {
    const entries = subjects.map((subject) => ({ subject, stats: progress.subjectProgress[subject.id] }));
    const attempted = entries.filter(({ stats }) => stats.total > 0);
    if (!attempted.length) return "Start with a short Math or English quest, then celebrate the effort—not just the score.";
    const focus = [...attempted].sort((a, b) => accuracy(a.stats.correct, a.stats.total) - accuracy(b.stats.correct, b.stats.total))[0];
    return `${playerName} may benefit from another ${focus.subject.title.en} activity. Try a 5-minute review with spoken hints and lots of praise.`;
  }, [progress.subjectProgress, playerName]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActiveTab("home")} aria-label="Luth's Playground! home">
          <span className="brand-cubes"><i>L</i><i>P</i></span>
          <span><b>Luth&apos;s Playground!</b><small>DARK 3D LEARNING WORLD</small></span>
        </button>
        <div className="header-actions">
          <LanguageSwitcher />
          <div className={`sync-pill ${syncState}`}>
            {syncState === "offline" ? <CloudOff size={15} /> : <Cloud size={15} />}
            <span>{syncState === "saving" ? t("sync_saving") : syncState === "offline" ? t("sync_offline") : t("sync_saved", { version: syncVersion })}</span>
          </div>
          <button className="profile-chip" onClick={() => setAvatarOpen(true)}>
            <span className="mini-avatar">{avatar}</span>
            <span><small>Level {currentLevel}</small><b>{playerName}</b></span>
            <ChevronRight size={17} />
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === "home" && (
          <HomeView
            playerName={playerName}
            avatar={avatar}
            progress={progress}
            settings={settings}
            dailyMinutes={dailyMinutes}
            levelPercent={levelPercent}
            xpToNext={xpToNext}
            onStart={startLesson}
            onTab={setActiveTab}
          />
        )}
        {activeTab === "learn" && <LearnView progress={progress} settings={settings} onStart={startLesson} />}
        {activeTab === "arcade" && <PasarApiArcadeView playerName={playerName} onEarnXp={earnBonusXp} />}
        {activeTab === "badges" && <BadgesView progress={progress} />}
        {activeTab === "progress" && <ProgressView progress={progress} currentLevel={currentLevel} elapsedMinutes={elapsedMinutes} />}
        {activeTab === "parent" && (
          parentUnlocked ? (
            <ParentDashboard
              progress={progress}
              settings={settings}
              setSettings={setSettings}
              playerName={playerName}
              setPlayerName={setPlayerName}
              recommendation={recommendation}
              onLock={() => setParentUnlocked(false)}
            />
          ) : (
            <ParentGate pin={pinAttempt} error={pinError} onDigit={enterPin} onClear={() => setPinAttempt("")} />
          )
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-top">
            <span>🎮 <b>Luth&apos;s Playground!</b></span>
            <span>•</span>
            <span>Built with ❤️ for 5-year-old Luth</span>
          </div>
          <div className="footer-credit-box">
            <span>BUILT USING FREE API</span>
            <a href="https://pasarapi.xyz" target="_blank" rel="noopener noreferrer" className="pasar-link">
              <Globe size={13} /> <b>pasarapi.xyz</b> <ExternalLink size={11} />
            </a>
          </div>
          <p className="footer-legal">
            © {new Date().getFullYear()} Luth&apos;s Playground! · 100% Ad-Free · COPPA Compliant · Offline Ready
          </p>
        </div>
      </footer>

      <nav className="bottom-nav" aria-label="Main navigation">
        <NavButton active={activeTab === "home"} icon={<Home />} label={t("nav_home")} onClick={() => setActiveTab("home")} />
        <NavButton active={activeTab === "learn"} icon={<BookOpen />} label={t("nav_quests")} onClick={() => setActiveTab("learn")} />
        <NavButton active={activeTab === "arcade"} icon={<Sparkles />} label={t("nav_arcade")} badge="Live" onClick={() => setActiveTab("arcade")} />
        <NavButton active={activeTab === "badges"} icon={<Award />} label={t("nav_badges")} count={progress.badges.length} onClick={() => setActiveTab("badges")} />
        <NavButton active={activeTab === "progress"} icon={<BarChart3 />} label={t("nav_progress")} onClick={() => setActiveTab("progress")} />
        <NavButton active={activeTab === "parent"} icon={<LockKeyhole />} label={t("nav_parents")} onClick={() => setActiveTab("parent")} />
      </nav>

      {avatarOpen && (
        <div className="modal-backdrop" onMouseDown={() => setAvatarOpen(false)}>
          <section className="avatar-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-x" onClick={() => setAvatarOpen(false)} aria-label="Close"><X /></button>
            <p className="eyebrow">YOUR CHARACTER</p>
            <h2>Choose your hero!</h2>
            <div className="avatar-grid">
              {avatars.map((item) => <button key={item} className={item === avatar ? "selected" : ""} onClick={() => { setAvatar(item); setAvatarOpen(false); }}>{item}</button>)}
            </div>
          </section>
        </div>
      )}

      {selected && (
        <LessonPlayer
          selected={selected}
          questionIndex={questionIndex}
          selectedAnswer={selectedAnswer}
          result={lessonResult}
          difficulty={settings.difficulty}
          lang={lessonLanguage.current}
          onAnswer={chooseAnswer}
          onNext={nextQuestion}
          onClose={closeLesson}
        />
      )}
    </div>
  );
}

function NavButton({ active, icon, label, count, badge, onClick }: { active: boolean; icon: React.ReactNode; label: string; count?: number; badge?: string; onClick: () => void }) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      {icon}
      {count ? <i>{count}</i> : null}
      {badge ? <em className="nav-badge">{badge}</em> : null}
      <span>{label}</span>
    </button>
  );
}

function HomeView({
  playerName, avatar, progress, settings, dailyMinutes, levelPercent, xpToNext, onStart, onTab,
}: {
  playerName: string; avatar: string; progress: Progress; settings: ParentSettings; dailyMinutes: number; levelPercent: number; xpToNext: number;
  onStart: (subject: Subject, lesson: Lesson) => void; onTab: (tab: Tab) => void;
}) {
  const t = useTranslations();
  const { locale } = useLocaleStore();
  const continueSubject = subjects.find((subject) => settings.enabledSubjects[subject.id]) || subjects[0];
  const completed = progress.subjectProgress[continueSubject.id].completed;
  const continueLesson = continueSubject.lessons[Math.min(completed, continueSubject.lessons.length - 1)];
  const dailyPercent = Math.min(100, (dailyMinutes / settings.dailyLimit) * 100);
  return (
    <>
      <section className="welcome-grid">
        <div className="welcome-copy">
          <p className="eyebrow coral"><Sparkles size={15} /> {t("home_todaysAdventure")}</p>
          <h1>{t("home_greeting")}<br /><em>, {playerName}?</em></h1>
          <p>{t("home_subtitle")}</p>
          <button className="primary-btn" onClick={() => onStart(continueSubject, continueLesson)}><Play size={20} fill="currentColor" /> {t("home_continueQuest")}</button>
        </div>
        <div className="hero-scene" aria-hidden="true">
          <div className="sun-spark">✦</div><div className="hero-cloud cloud-one" /><div className="hero-cloud cloud-two" />
          <div className="pixel-island"><span className="big-avatar">{avatar}</span><i className="block b1" /><i className="block b2" /><i className="block b3" /><i className="block b4" /><i className="grass" /></div>
          <span className="floating-cube cube-a">L</span><span className="floating-cube cube-b">中</span><span className="floating-cube cube-c">P</span>
        </div>
        <div className="side-stats">
          <div className="stat-box flame"><span><span className="stat-icon">🔥</span><small>{t("home_dayStreak")}</small></span><b>{progress.streak}<em>days</em></b></div>
          <div className="stat-box xp"><span><span className="stat-icon">💎</span><small>{t("home_totalXp")}</small></span><b>{progress.xp}<em>points</em></b></div>
          <div className="level-box"><span><b>{t("home_level")} {levelForXp(progress.xp)}</b><small>{xpToNext} {t("home_xpToNext")}</small></span><strong>{Math.round(levelPercent)}%</strong><div><i style={{ width: `${levelPercent}%` }} /></div></div>
        </div>
      </section>

      <section className="pasar-feature-banner" onClick={() => onTab("arcade")}>
        <div className="pasar-banner-icon">⚡</div>
        <div className="pasar-banner-copy">
          <span className="pasar-tag">NEW FEATURE</span>
          <h3>PasarAPI Free API Playground</h3>
          <p>Fetch live random dog pictures, kid-friendly fun facts & interactive rhymes! Built using <b>pasarapi.xyz</b>.</p>
        </div>
        <button className="pasar-banner-btn">{t("home_playNow")} <ChevronRight /></button>
      </section>

      <section className="daily-strip">
        <div className="daily-icon">🎯</div>
        <div><small>{t("home_dailyMission")}</small><b>{t("home_learnFor", { minutes: settings.dailyLimit })}</b></div>
        <div className="daily-progress"><span><i style={{ width: `${dailyPercent}%` }} /></span><b>{dailyMinutes} / {settings.dailyLimit} {t("home_min")}</b></div>
        <div className="daily-reward"><span>+50</span> XP</div>
      </section>

      <div className="section-heading">
        <div><p className="eyebrow">{t("home_chooseYourWorld")}</p><h2>{t("home_whatWillYouDiscover")}</h2></div>
        <button className="text-btn" onClick={() => onTab("learn")}>{t("home_viewAll")} <ChevronRight /></button>
      </div>
      <section className="subject-grid">
        {subjects.map((subject) => {
          const stats = progress.subjectProgress[subject.id];
          const disabled = !settings.enabledSubjects[subject.id];
          const nextLesson = subject.lessons[Math.min(stats.completed, 4)];
          return (
            <button key={subject.id} className={`subject-card ${disabled ? "disabled" : ""}`} style={{ "--subject": subject.color, "--subject-light": subject.light } as React.CSSProperties} onClick={() => onStart(subject, nextLesson)}>
              <span className="subject-top"><span className="subject-icon">{subject.icon}</span><span className="lesson-count">{disabled ? t("home_paused") : `${stats.completed}/5 ${t("home_lessons")}`}</span></span>
              <span className="subject-title">{subject.title[locale]}</span><span className="subject-desc">{disabled ? t("home_askParent") : subject.description[locale]}</span>
              <span className="subject-progress"><i style={{ width: `${stats.completed * 20}%` }} /></span>
              <span className="subject-play"><Play size={15} fill="currentColor" /> {stats.completed ? t("home_keepGoing") : t("home_startWorld")}</span>
              <span className="card-blocks">■ ■</span>
            </button>
          );
        })}
      </section>

      <section className="lower-grid">
        <div className="continue-card">
          <div className="continue-art"><span>{continueLesson.icon}</span><i>+{continueLesson.questions.length * 10} XP</i></div>
          <div><p className="eyebrow">{t("home_nextUp")}</p><h3>{continueLesson.title[locale]}</h3><p>{continueSubject.title[locale]} · Lesson {Math.min(completed + 1, 5)} of 5</p><button onClick={() => onStart(continueSubject, continueLesson)}>{t("home_playNow")} <ChevronRight /></button></div>
        </div>
        <div className="safe-card"><ShieldCheck /><div><b>{t("home_madeForExplorers")}</b><span>{t("home_safetyTag")}</span></div><ChevronRight /></div>
      </section>
    </>
  );
}

function LearnView({ progress, settings, onStart }: { progress: Progress; settings: ParentSettings; onStart: (subject: Subject, lesson: Lesson) => void }) {
  const t = useTranslations();
  const { locale } = useLocaleStore();
  const [filter, setFilter] = useState<SubjectId | "all">("all");
  const visible = filter === "all" ? subjects : subjects.filter((subject) => subject.id === filter);
  return (
    <section className="page-section">
      <div className="page-hero learn-hero"><div><p className="eyebrow">{t("learn_eyebrow")}</p><h1>{t("learn_title")}</h1><p>{t("learn_subtitle")}</p></div><span>🗺️</span></div>
      <div className="filter-row">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>{t("learn_allWorlds")}</button>
        {subjects.map((subject) => <button key={subject.id} className={filter === subject.id ? "active" : ""} onClick={() => setFilter(subject.id)}>{subject.icon} {subject.title[locale]}</button>)}
      </div>
      <div className="lesson-worlds">
        {visible.map((subject) => {
          const stats = progress.subjectProgress[subject.id];
          const disabled = !settings.enabledSubjects[subject.id];
          return (
            <section key={subject.id} className={`world-panel ${disabled ? "paused" : ""}`} style={{ "--subject": subject.color, "--subject-light": subject.light } as React.CSSProperties}>
              <div className="world-heading"><span className="subject-icon">{subject.icon}</span><div><h2>{subject.title[locale]}</h2><p>{disabled ? "This world is paused by a parent." : subject.description[locale]}</p></div><b>{stats.completed}/5</b></div>
              <div className="lesson-list">
                {subject.lessons.map((lesson, index) => {
                  const done = index < stats.completed;
                  return <button key={lesson.id} disabled={disabled} onClick={() => onStart(subject, lesson)}><span className="lesson-number">{done ? <Check /> : index + 1}</span><span className="lesson-emoji">{lesson.icon}</span><span><b>{lesson.title[locale]}</b><small>{lesson.subtitle[locale]} · {t("learn_questions", { count: 4 })}</small></span><span className="lesson-xp">+{done ? t("learn_replay") : t("learn_xp", { xp: 40 })}</span><ChevronRight /></button>;
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function PasarApiArcadeView({ playerName, onEarnXp }: { playerName: string; onEarnXp: (amount: number) => void }) {
  const t = useTranslations();
  const [dogImg, setDogImg] = useState<string | null>("https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg");
  const [dogBreed, setDogBreed] = useState("Golden Retriever");
  const [fetchingDog, setFetchingDog] = useState(false);
  const [dogsFound, setDogsFound] = useState(1);

  const [randomFact, setRandomFact] = useState("Did you know? A strawberry is not actually a berry, but a banana is!");
  const [fetchingFact, setFetchingFact] = useState(false);

  const [rhymeWord, setRhymeWord] = useState("cat");
  const [rhymes, setRhymes] = useState<string[]>(["bat", "hat", "mat", "rat", "sat", "flat"]);
  const [fetchingRhymes, setFetchingRhymes] = useState(false);

  const fetchNewDog = async () => {
    setFetchingDog(true);
    try {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      if (!res.ok) throw new Error("API Error");
      const data = (await res.json()) as { message: string; status: string };
      setDogImg(data.message);
      const parts = data.message.split("/");
      const rawBreed = parts[parts.length - 2] || "Cool Dog";
      const formatted = rawBreed.split("-").reverse().map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      setDogBreed(formatted);
      setDogsFound((f) => {
        const next = f + 1;
        if (next % 3 === 0) onEarnXp(25);
        return next;
      });
      speak(`Wow! Look at this ${formatted}!`, "en-US");
    } catch {
      setDogImg("https://images.dog.ceo/breeds/pug/n02110958_13114.jpg");
      setDogBreed("Happy Pug (Offline mode)");
      speak("Here is a Happy Pug!", "en-US");
    } finally {
      setFetchingDog(false);
    }
  };

  const fetchNewFact = async () => {
    setFetchingFact(true);
    try {
      const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
      if (!res.ok) throw new Error("API Error");
      const data = (await res.json()) as { text: string };
      setRandomFact(data.text);
      onEarnXp(10);
      speak(data.text, "en-US");
    } catch {
      const fallback = "Did you know? Butterflies taste food with their feet!";
      setRandomFact(fallback);
      speak(fallback, "en-US");
    } finally {
      setFetchingFact(false);
    }
  };

  const findRhymes = async (word: string) => {
    setRhymeWord(word);
    setFetchingRhymes(true);
    try {
      const res = await fetch(`https://api.datamuse.com/words?rel_rhy=${word}&max=10`);
      if (!res.ok) throw new Error("API Error");
      const data = (await res.json()) as Array<{ word: string }>;
      const matches = data.map((d) => d.word);
      if (matches.length) {
        setRhymes(matches);
        onEarnXp(15);
        speak(`Rhyming words for ${word}: ${matches.slice(0, 4).join(", ")}`, "en-US");
      } else {
        setRhymes(["Super word!", "Amazing", "Sparkle"]);
      }
    } catch {
      setRhymes(["star", "car", "far", "jar"]);
    } finally {
      setFetchingRhymes(false);
    }
  };

  return (
    <section className="page-section pasar-arcade-page">
      <div className="page-hero pasar-hero">
        <div>
          <p className="eyebrow">{t("arcade_eyebrow")}</p>
          <h1>{t("arcade_title")}</h1>
          <p>{t("arcade_subtitle")}</p>
        </div>
        <span>⚡</span>
      </div>

      <div className="pasar-intro-card">
        <Globe className="pasar-globe-icon" />
        <div>
          <b>What is PasarAPI?</b>
          <span>Southeast Asia&apos;s #1 API Directory for builders in Malaysia, Singapore, Indonesia & beyond. Click below to trigger real 100% free commercial & open APIs!</span>
        </div>
        <a href="https://pasarapi.xyz" target="_blank" rel="noopener noreferrer" className="pasar-btn">Visit PasarAPI.xyz <ExternalLink size={14} /></a>
      </div>

      <div className="arcade-grid">
        {/* Dog Explorer */}
        <article className="arcade-card dog-arcade">
          <div className="arcade-card-top">
            <span className="arcade-icon bg-orange">🐶</span>
            <div><h3>{t("arcade_dogExplorer")}</h3><small>Dog CEO Free Open API</small></div>
            <button className="speak-btn" onClick={() => speak(`This is a ${dogBreed}`, "en-US")}><Volume2 size={16} /></button>
          </div>
          <div className="dog-img-container">
            {dogImg ? <img src={dogImg} alt={dogBreed} className="live-dog-img" /> : <div className="dog-skeleton" />}
            <span className="dog-breed-badge">{dogBreed}</span>
          </div>
          <p className="arcade-card-note">{t("arcade_dogsFoundNote")}</p>
          <button className="primary-btn dog-btn" disabled={fetchingDog} onClick={fetchNewDog}>
            {fetchingDog ? <RefreshCw className="animate-spin" size={18} /> : "🦴"} {t("arcade_fetchNewDog")}
          </button>
        </article>

        {/* Random Fact */}
        <article className="arcade-card fact-arcade">
          <div className="arcade-card-top">
            <span className="arcade-icon bg-green">💡</span>
            <div><h3>{t("arcade_funFacts")}</h3><small>Random Useless Facts Free API</small></div>
            <button className="speak-btn" onClick={() => speak(randomFact, "en-US")}><Volume2 size={16} /></button>
          </div>
          <div className="fact-display-box">
            <Bot className="bot-watermark" />
            <p>&ldquo;{randomFact}&rdquo;</p>
          </div>
          <p className="arcade-card-note">{t("arcade_earnXpNote")}</p>
          <button className="primary-btn fact-btn" disabled={fetchingFact} onClick={fetchNewFact}>
            {fetchingFact ? <RefreshCw className="animate-spin" size={18} /> : "✨"} {t("arcade_giveFact")}
          </button>
        </article>

        {/* Rhyme Finder */}
        <article className="arcade-card rhyme-arcade">
          <div className="arcade-card-top">
            <span className="arcade-icon bg-purple">🎵</span>
            <div><h3>{t("arcade_rhymeWizard")}</h3><small>Datamuse Free English API</small></div>
            <button className="speak-btn" onClick={() => speak(`Rhyming words for ${rhymeWord}`, "en-US")}><Volume2 size={16} /></button>
          </div>
          <p className="rhyme-instruction">Tap a word below to fetch live rhyming words from the Datamuse API:</p>
          <div className="rhyme-word-pills">
            {["cat", "star", "play", "book", "sun", "jump"].map((w) => (
              <button key={w} className={`rhyme-pill-btn ${rhymeWord === w ? "active" : ""}`} onClick={() => findRhymes(w)}>
                {w}
              </button>
            ))}
          </div>
          <div className="rhyme-results-box">
            <small>Words that rhyme with <b>&ldquo;{rhymeWord}&rdquo;</b>:</small>
            {fetchingRhymes ? (
              <div className="loading-rhymes"><RefreshCw className="animate-spin" size={16} /> Fetching live rhymes…</div>
            ) : (
              <div className="rhymes-list">
                {rhymes.map((r) => (
                  <span key={r} className="rhyme-output-tag" onClick={() => speak(r, "en-US")}>
                    <Smile size={12} /> {r}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="arcade-card-note">Tap any rhyming word pill to hear it read aloud!</p>
        </article>
      </div>
    </section>
  );
}

function BadgesView({ progress }: { progress: Progress }) {
  const t = useTranslations();
  return (
    <section className="page-section">
      <div className="page-hero badge-hero"><div><p className="eyebrow">TROPHY ROOM</p><h1>{t("badges_title")}</h1><p>{progress.badges.length} of {badgeCatalog.length} Luth profile badges unlocked. Keep exploring!</p></div><span>🏆</span></div>
      <div className="badge-summary"><div><Trophy /><span><b>{progress.badges.length}</b><small>{t("badges_unlocked")}</small></span></div><div><Star /><span><b>{badgeCatalog.length - progress.badges.length}</b><small>{t("badges_stillToFind")}</small></span></div><div><Gem /><span><b>{progress.xp}</b><small>{t("badges_totalXp")}</small></span></div></div>
      <div className="badge-grid">
        {badgeCatalog.map((badge) => {
          const earned = progress.badges.includes(badge.id);
          return <article key={badge.id} className={earned ? "earned" : "locked"}><span>{earned ? badge.icon : "?"}</span><b>{badge.name}</b><small>{badge.note}</small>{earned && <i><Check /> {t("badges_earned")}</i>}</article>;
        })}
      </div>
    </section>
  );
}

function ProgressView({ progress, currentLevel, elapsedMinutes }: { progress: Progress; currentLevel: number; elapsedMinutes: number }) {
  const t = useTranslations();
  const { locale } = useLocaleStore();
  const maxDay = Math.max(...progress.weeklyActivity, 10);
  return (
    <section className="page-section">
      <div className="page-hero progress-hero"><div><p className="eyebrow">YOUR ADVENTURE</p><h1>{t("progress_title")}</h1><p>{t("progress_subtitle")}</p></div><span>📈</span></div>
      <div className="metric-grid">
        <article><span className="metric-icon purple"><Gem /></span><span><small>{t("progress_totalXp")}</small><b>{progress.xp}</b><em>Level {currentLevel}</em></span></article>
        <article><span className="metric-icon orange"><BookOpen /></span><span><small>{t("progress_lessons")}</small><b>{progress.lessonsCompleted}</b><em>completed</em></span></article>
        <article><span className="metric-icon green"><Trophy /></span><span><small>{t("progress_accuracy")}</small><b>{accuracy(progress.correctAnswers, progress.totalAnswers)}%</b><em>{progress.correctAnswers} correct</em></span></article>
        <article><span className="metric-icon pink"><Clock3 /></span><span><small>{t("progress_timeLearning")}</small><b>{progress.lessonsCompleted * 4 + elapsedMinutes}m</b><em>all time</em></span></article>
      </div>
      <div className="analytics-grid">
        <article className="chart-card"><div className="card-heading"><div><p className="eyebrow">{t("progress_thisWeek")}</p><h2>{t("progress_learningActivity")}</h2></div><span>🔥 {progress.streak} day streak</span></div><div className="bar-chart">{progress.weeklyActivity.map((minutes, index) => <div key={dayLabels[index]}><span><i style={{ height: `${Math.max(5, (minutes / maxDay) * 100)}%` }} data-value={`${minutes}m`} /></span><small>{dayLabels[index]}</small></div>)}</div></article>
        <article className="subject-breakdown"><div className="card-heading"><div><p className="eyebrow">{t("progress_byWorld")}</p><h2>{t("progress_subjectSkills")}</h2></div></div>{subjects.map((subject) => { const stats = progress.subjectProgress[subject.id]; const value = accuracy(stats.correct, stats.total); return <div className="skill-row" key={subject.id}><span style={{ background: subject.light, color: subject.dark }}>{subject.icon}</span><div><b>{subject.title[locale]}<em>{stats.total ? `${value}%` : t("progress_new")}</em></b><i><u style={{ width: `${stats.total ? value : 2}%`, background: subject.color }} /></i></div></div>; })}</article>
      </div>
    </section>
  );
}

function ParentGate({ pin, error, onDigit, onClear }: { pin: string; error: boolean; onDigit: (digit: string) => void; onClear: () => void }) {
  const t = useTranslations();
  return (
    <section className="parent-gate">
      <div className="lock-illustration"><LockKeyhole /></div><p className="eyebrow">GROWN-UPS ONLY</p><h1>{t("parent_title")}</h1><p>{t("parent_enterPin")}</p>
      <div className="pin-dots">{[0, 1, 2, 3].map((index) => <i key={index} className={index < pin.length ? "filled" : ""} />)}</div>
      {error && <span className="pin-error">{t("parent_wrongPin")}</span>}
      <div className="pin-pad">{["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => <button key={digit} onClick={() => onDigit(digit)}>{digit}</button>)}<button className="pin-clear" onClick={onClear}>Clear</button><button onClick={() => onDigit("0")}>0</button><span /></div>
      <small className="pin-help">{t("parent_pinHelper")} {t("parent_defaultPin")}</small>
    </section>
  );
}

function ParentDashboard({ progress, settings, setSettings, playerName, setPlayerName, recommendation, onLock }: {
  progress: Progress; settings: ParentSettings; setSettings: React.Dispatch<React.SetStateAction<ParentSettings>>; playerName: string; setPlayerName: (name: string) => void; recommendation: string; onLock: () => void;
}) {
  const t = useTranslations();
  const { locale } = useLocaleStore();
  return (
    <section className="page-section parent-dashboard">
      <div className="parent-heading"><div><p className="eyebrow">{t("parent_dashboard")}</p><h1>{t("parent_learningAtGlance")}</h1><p>Safe, simple controls for 5-year-old Luth.</p></div><button onClick={onLock}><LogOut /> {t("parent_lockDashboard")}</button></div>
      <div className="privacy-note"><ShieldCheck /><div><b>{t("parent_privateByDesign")}</b><span>No ads, purchases, chat, tracking, or contact details. Only the first name below is saved.</span></div></div>
      <div className="parent-metrics">
        <article><span>💎</span><div><small>{t("parent_totalXp")}</small><b>{progress.xp}</b></div></article><article><span>📚</span><div><small>{t("parent_lessons")}</small><b>{progress.lessonsCompleted}</b></div></article><article><span>🎯</span><div><small>{t("parent_accuracy")}</small><b>{accuracy(progress.correctAnswers, progress.totalAnswers)}%</b></div></article><article><span>🏅</span><div><small>{t("parent_badges")}</small><b>{progress.badges.length}/27</b></div></article>
      </div>
      <div className="parent-grid">
        <article className="settings-card">
          <div className="card-heading"><div><p className="eyebrow">{t("parent_learningSettings")}</p><h2>{t("parent_questControls")}</h2></div><Settings /></div>
          <label className="name-field"><span>{t("parent_nameField")}</span><input value={playerName} maxLength={18} onChange={(event) => setPlayerName(event.target.value.replace(/[^a-zA-ZÀ-ž '-]/g, ""))} /></label>
          <div className="control-group"><b>{t("parent_difficulty")}</b><span>Changes the challenge reward</span><div className="segmented">{(["Easy", "Medium", "Hard"] as Difficulty[]).map((item) => <button key={item} className={settings.difficulty === item ? "active" : ""} onClick={() => setSettings((old) => ({ ...old, difficulty: item }))}>{item}</button>)}</div></div>
          <div className="control-group"><b>{t("parent_dailyGoal")} <em>{settings.dailyLimit} min</em></b><span>Choose a comfortable session length</span><input type="range" min="10" max="120" step="10" value={settings.dailyLimit} onChange={(event) => setSettings((old) => ({ ...old, dailyLimit: Number(event.target.value) }))} /><div className="range-labels"><small>10 min</small><small>120 min</small></div></div>
          <div className="control-group"><b>{t("parent_soundEffects")} <em>{settings.soundEnabled ? "On" : "Off"}</em></b><span>Local AudioContext sounds; no child audio is recorded.</span><div className="segmented"><button className={settings.soundEnabled ? "active" : ""} onClick={() => setSettings((old) => ({ ...old, soundEnabled: true }))}>Sound On</button><button className={!settings.soundEnabled ? "active" : ""} onClick={() => setSettings((old) => ({ ...old, soundEnabled: false }))}>Sound Off</button></div></div>
          <div className="control-group"><b>{t("parent_learningWorlds")}</b><span>Pause or enable each subject</span><div className="toggle-list">{subjects.map((subject) => <label key={subject.id}><span><i style={{ background: subject.light, color: subject.dark }}>{subject.icon}</i>{subject.title[locale]}</span><input type="checkbox" checked={settings.enabledSubjects[subject.id]} onChange={() => setSettings((old) => ({ ...old, enabledSubjects: { ...old.enabledSubjects, [subject.id]: !old.enabledSubjects[subject.id] } }))} /><u /></label>)}</div></div>
        </article>
        <div className="parent-side">
          <article className="tip-card"><span><Lightbulb /></span><div><p className="eyebrow">{t("parent_smartRecommendation")}</p><h3>{t("parent_tryThisNext")}</h3><p>{recommendation}</p></div></article>
          <article className="streak-card"><div><span>🔥</span><b>{progress.streak}<small>current streak</small></b></div><div><span>⚡</span><b>{progress.longestStreak}<small>longest streak</small></b></div></article>
          <article className="safety-list"><h3><ShieldCheck /> {t("parent_safetyPromises")}</h3><p><Check /> 100% ad-free & COPPA conscious</p><p><Check /> No in-app purchases</p><p><Check /> No social features or chat</p><p><Check /> Works offline during travel</p><p><Check /> Built using Free API from pasarapi.xyz</p></article>
        </div>
      </div>
    </section>
  );
}

function LessonPlayer({ selected, questionIndex, selectedAnswer, result, difficulty, lang, onAnswer, onNext, onClose }: {
  selected: { subject: Subject; lesson: Lesson }; questionIndex: number; selectedAnswer: number | null; result: { score: number; xp: number; perfect: boolean } | null; difficulty: Difficulty; lang: "en" | "ms"; onAnswer: (index: number) => void; onNext: () => void; onClose: () => void;
}) {
  const t = useTranslations();
  const question = selected.lesson.questions[questionIndex];
  const language = selected.subject.id === "mandarin" ? "zh-CN" : lang === "ms" ? "ms-MY" : "en-US";
  if (result) {
    return (
      <div className="lesson-overlay" style={{ "--subject": selected.subject.color, "--subject-light": selected.subject.light } as React.CSSProperties}>
        {result.perfect && <div className="confetti">{Array.from({ length: 32 }, (_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, background: ["#ff5a79", "#6b62e8", "#ffd45d", "#20ae78", "#3d91e8"][index % 5], animationDelay: `${(index % 8) * 0.12}s` }} />)}</div>}
        <div className="result-card"><div className="result-burst">{result.perfect ? "🏆" : result.score >= 3 ? "🌟" : "💪"}</div><p className="eyebrow">{t("results_questComplete")}</p><h1>{result.perfect ? t("results_blockTastic") : result.score >= 3 ? t("results_amazingWork") : t("results_greatTry")}</h1><p>{result.perfect ? "A perfect score—you found every answer!" : "Every try makes your brain stronger."}</p><div className="result-score"><span><b>{result.score}/4</b><small>{t("results_score")}</small></span><span><b>+{result.xp}</b><small>{t("results_xpEarned", { xp: result.xp })}</small></span></div><button className="primary-btn" onClick={onClose}>{t("results_backToWorlds")} <ChevronRight /></button></div>
      </div>
    );
  }
  return (
    <div className="lesson-overlay" style={{ "--subject": selected.subject.color, "--subject-light": selected.subject.light } as React.CSSProperties}>
      <header className="lesson-header"><button onClick={onClose}><ArrowLeft /> {t("lesson_exit")}</button><div><span><i style={{ width: `${((questionIndex + 1) / selected.lesson.questions.length) * 100}%` }} /></span><small>{questionIndex + 1} {t("lesson_of")} {selected.lesson.questions.length}</small></div><b>{selected.lesson.icon} {selected.lesson.title[lang]}</b></header>
      <main className="question-card">
        <div className="question-meta"><span>{selected.subject.icon} {selected.subject.title[lang]}</span><b>{difficulty} · +10 XP</b></div>
        <div className="question-visual">{question.visual[lang]}</div>
        <div className="question-title"><h1>{question.prompt[lang]}</h1><button onClick={() => speak(question.speak?.[lang] || question.prompt[lang], language)} aria-label={t("lesson_readAloud")}><Volume2 /></button></div>
        {question.hint?.[lang] && <p className="question-hint"><Lightbulb /> {question.hint[lang]}</p>}
        <div className="answer-list">{question.options[lang].map((option: string, index: number) => {
          const isCorrect = index === question.answer;
          const chosen = selectedAnswer === index;
          const state = selectedAnswer === null ? "" : isCorrect ? "correct" : chosen ? "wrong" : "muted";
          return <button key={option} className={state} onClick={() => onAnswer(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><b>{option}</b><span className="speak-option" onClick={(event) => { event.stopPropagation(); speak(option, language); }}><Volume2 /></span>{state === "correct" && <Check className="state-icon" />}{state === "wrong" && <X className="state-icon" />}</button>;
        })}</div>
        {selectedAnswer !== null && <div className={`feedback-box ${selectedAnswer === question.answer ? "correct" : "wrong"}`}><span>{selectedAnswer === question.answer ? "🎉" : "🌱"}</span><div><b>{selectedAnswer === question.answer ? t("feedback_correct") : t("feedback_wrong")}</b><small>{selectedAnswer === question.answer ? t("feedback_correctDetail") : `${t("lesson_answerIs")} ${question.options[lang][question.answer]}.`}</small></div><button onClick={onNext}>{questionIndex === selected.lesson.questions.length - 1 ? t("lesson_finish") : t("lesson_next")} <ChevronRight /></button></div>}
      </main>
    </div>
  );
}
