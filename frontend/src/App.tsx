// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

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

import { ThemeProvider } from './contexts/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AICoachButton from './components/AICoach/AICoachButton';
import ScrollToTopButton from './components/ScrollToTopButton';
import PWAInstallBanner from './components/PWAInstallBanner';
import OfflineIndicator from './components/OfflineIndicator';
import ChallengeNudge from './components/ChallengeNudge';

import './index.css';
import { GlobalAudioPlayer } from './components/AudioPlayer/GlobalAudioPlayer';
import { MusicLibrary } from './components/AudioPlayer/MusicLibrary';
import { MusicProvider } from './components/contexts/MusicContext';
import { AuthProvider } from './components/contexts/AuthContext';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
    <Router>
      <ThemeProvider>
      <AuthProvider>
        <MusicProvider>
          <div className="min-h-screen">
            <ScrollToTop />
            <Routes>
              <Route path="/"             element={<Navigate to="/home-page" replace />} />
              <Route path="/home-page"    element={<HomePage />} />
              <Route path="/breathing"    element={<BreathingPage />} />
              <Route path="/sessions"     element={<Navigate to="/profile" replace />} />
              <Route path="/sessions/new" element={<NewSessionPage />} />
              <Route path="/statistics"   element={<Navigate to="/profile" replace />} />
              <Route path="/faq"           element={<FAQPage />} />
              <Route path="/community"     element={<CommunityPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/signup"        element={<SignUpPage />} />
              <Route path="/support"      element={<SupportPage />} />
              <Route path="/breathing/box-breathing" element={<BoxBreathingPage />} />
              <Route path="/breathing/4-7-8"         element={<Breathing478Page />} />
              <Route path="/breathing/wim-hof"        element={<WimHofPage />} />
              <Route path="/breathing/anxiety"        element={<BreathingAnxietyPage />} />
              <Route path="/profile"               element={<ProfilePage />} />
              <Route path="/data-consent"           element={<DataConsentPage />} />
              <Route path="/music-library" element={<MusicLibrary />} />
              <Route path="/onboarding"   element={<OnboardingPage />} />
              <Route path="/globe"         element={<GlobePage />} />
              <Route path="/sleep/what-is-sleep-apnea"        element={<SleepApneaPage />} />
              <Route path="/sleep/why-sleep-is-important"    element={<WhySleepPage />} />
              <Route path="/sleep/breathwork-for-deep-sleep" element={<BreathworkSleepPage />} />
              <Route path="/sleep/story"                   element={<SleepStoryPage />} />
              <Route path="/science/slow-breathing"          element={<SlowBreathingPage />} />
              <Route path="/breathing/morning-ritual"        element={<MorningRitualPage />} />
              <Route path="/challenges"                      element={<Navigate to="/profile" replace />} />
              <Route path="*"              element={<HomePage />} />
            </Routes>
            <AICoachButton variant="floating" />
            <ScrollToTopButton />
            <GlobalAudioPlayer />
            <PWAInstallBanner />
            <OfflineIndicator />
            <ChallengeNudge />
          </div>
        </MusicProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
    </GoogleOAuthProvider>
  );
}