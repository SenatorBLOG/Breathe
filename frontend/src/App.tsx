// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

import HomePage from './pages/HomePage.tsx';
import BreathingPage from './pages/BreathingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import NewSessionPage from './pages/NewSessionPage';
import CommunityPage from './pages/CommunityPage';
import FAQPage from './pages/FaqPage';
import SupportPage from './pages/SupportPage';
import BoxBreathingPage from './pages/techniques/BoxBreathingPage';
import Breathing478Page from './pages/techniques/Breathing478Page';
import WimHofPage from './pages/techniques/WimHofPage';
import BreathingAnxietyPage from './pages/techniques/BreathingAnxietyPage';
import ProfilePage from './pages/ProfilePage';
import DataConsentPage from './pages/DataConsentPage';
import OnboardingPage from './pages/OnboardingPage';
import GlobePage from './pages/GlobePage';
import SleepApneaPage from './pages/sleep/SleepApneaPage';
import WhySleepPage from './pages/sleep/WhySleepPage';
import BreathworkSleepPage from './pages/sleep/BreathworkSleepPage';
import SleepStoryPage from './pages/sleep/SleepStoryPage';
import SlowBreathingPage from './pages/science/SlowBreathingPage';
import MorningRitualPage from './pages/techniques/MorningRitualPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AICoachButton from './components/AICoach/AICoachButton';
import ScrollToTopButton from './components/ScrollToTopButton';
import PWAInstallBanner from './components/PWAInstallBanner';
import OfflineIndicator from './components/OfflineIndicator';
import ChallengeNudge from './components/ChallengeNudge';
import OnboardingTour from './components/OnboardingTour';
import LeaderboardPage from './pages/LeaderboardPage';

import './index.css';
import { GlobalAudioPlayer } from './components/AudioPlayer/GlobalAudioPlayer';
import { MusicLibrary } from './components/AudioPlayer/MusicLibrary';
import { MusicProvider } from './components/contexts/MusicContext';
import { AuthProvider } from './components/contexts/AuthContext';

// ─── Page transition wrapper ─────────────────────────────────────────────────
const pageVariants = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit:     { opacity: 0, transition: { duration: 0.16, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

// ─── Animated routes — needs location key for AnimatePresence ────────────────
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"             element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/home-page"    element={<Navigate to="/" replace />} />
        <Route path="/breathing"    element={<PageWrapper><BreathingPage /></PageWrapper>} />
        <Route path="/sessions"     element={<Navigate to="/profile" replace />} />
        <Route path="/sessions/new" element={<PageWrapper><NewSessionPage /></PageWrapper>} />
        <Route path="/statistics"   element={<Navigate to="/profile" replace />} />
        <Route path="/faq"           element={<PageWrapper><FAQPage /></PageWrapper>} />
        <Route path="/community"     element={<PageWrapper><CommunityPage /></PageWrapper>} />
        <Route path="/login"         element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/signup"        element={<PageWrapper><SignUpPage /></PageWrapper>} />
        <Route path="/support"      element={<PageWrapper><SupportPage /></PageWrapper>} />
        <Route path="/breathing/box-breathing" element={<PageWrapper><BoxBreathingPage /></PageWrapper>} />
        <Route path="/breathing/4-7-8"         element={<PageWrapper><Breathing478Page /></PageWrapper>} />
        <Route path="/breathing/wim-hof"        element={<PageWrapper><WimHofPage /></PageWrapper>} />
        <Route path="/breathing/anxiety"        element={<PageWrapper><BreathingAnxietyPage /></PageWrapper>} />
        <Route path="/profile"               element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/data-consent"           element={<PageWrapper><DataConsentPage /></PageWrapper>} />
        <Route path="/music-library" element={<PageWrapper><MusicLibrary /></PageWrapper>} />
        <Route path="/onboarding"   element={<PageWrapper><OnboardingPage /></PageWrapper>} />
        <Route path="/globe"         element={<PageWrapper><GlobePage /></PageWrapper>} />
        <Route path="/sleep/what-is-sleep-apnea"        element={<PageWrapper><SleepApneaPage /></PageWrapper>} />
        <Route path="/sleep/why-sleep-is-important"    element={<PageWrapper><WhySleepPage /></PageWrapper>} />
        <Route path="/sleep/breathwork-for-deep-sleep" element={<PageWrapper><BreathworkSleepPage /></PageWrapper>} />
        <Route path="/sleep/story"                   element={<PageWrapper><SleepStoryPage /></PageWrapper>} />
        <Route path="/science/slow-breathing"          element={<PageWrapper><SlowBreathingPage /></PageWrapper>} />
        <Route path="/breathing/morning-ritual"        element={<PageWrapper><MorningRitualPage /></PageWrapper>} />
        <Route path="/privacy"                         element={<PageWrapper><PrivacyPolicyPage /></PageWrapper>} />
        <Route path="/challenges"                      element={<Navigate to="/profile" replace />} />
        <Route path="/leaderboard"                     element={<PageWrapper><LeaderboardPage /></PageWrapper>} />
        <Route path="*"              element={<PageWrapper><HomePage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
    <Router>
      <ThemeProvider>
      <AuthProvider>
        <MusicProvider>
          <div className="min-h-screen">
            <ScrollToTop />
            <AnimatedRoutes />
            <AICoachButton variant="floating" />
            <ScrollToTopButton />
            <GlobalAudioPlayer />
            <PWAInstallBanner />
            <OfflineIndicator />
            <ChallengeNudge />
            <OnboardingTour />
          </div>
        </MusicProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
    </GoogleOAuthProvider>
    </HelmetProvider>
  );
}
