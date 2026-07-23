// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Eagerly load the home page — it's the landing page and must render fast
import HomePage from './pages/HomePage.tsx';

// All other pages are lazy-loaded — they only download when the route is visited
const BreathingPage        = lazy(() => import('./pages/BreathingPage'));
const LoginPage            = lazy(() => import('./pages/LoginPage'));
const SignUpPage           = lazy(() => import('./pages/SignUpPage'));
const NewSessionPage       = lazy(() => import('./pages/NewSessionPage'));
const CommunityPage        = lazy(() => import('./pages/CommunityPage'));
const CommunityPostPage    = lazy(() => import('./pages/CommunityPostPage'));
const FAQPage              = lazy(() => import('./pages/FaqPage'));
const SupportPage          = lazy(() => import('./pages/SupportPage'));
const BoxBreathingPage     = lazy(() => import('./pages/techniques/BoxBreathingPage'));
const Breathing478Page     = lazy(() => import('./pages/techniques/Breathing478Page'));
const WimHofPage           = lazy(() => import('./pages/techniques/WimHofPage'));
const BreathingAnxietyPage = lazy(() => import('./pages/techniques/BreathingAnxietyPage'));
const CoherentBreathingPage = lazy(() => import('./pages/techniques/CoherentBreathingPage'));
const PhysiologicalSighPage = lazy(() => import('./pages/techniques/PhysiologicalSighPage'));
const BellyBreathingPage   = lazy(() => import('./pages/techniques/BellyBreathingPage'));
const PublicSpeakingPage   = lazy(() => import('./pages/techniques/PublicSpeakingPage'));
const BloodPressurePage    = lazy(() => import('./pages/techniques/BloodPressurePage'));
const ProfilePage          = lazy(() => import('./pages/ProfilePage'));
const DataConsentPage      = lazy(() => import('./pages/DataConsentPage'));
const OnboardingPage       = lazy(() => import('./pages/OnboardingPage'));
const GlobePage            = lazy(() => import('./pages/GlobePage'));
const SleepApneaPage       = lazy(() => import('./pages/sleep/SleepApneaPage'));
const WhySleepPage         = lazy(() => import('./pages/sleep/WhySleepPage'));
const BreathworkSleepPage  = lazy(() => import('./pages/sleep/BreathworkSleepPage'));
const SleepStoryPage       = lazy(() => import('./pages/sleep/SleepStoryPage'));
const SlowBreathingPage    = lazy(() => import('./pages/science/SlowBreathingPage'));
const FightOrFlightPage    = lazy(() => import('./pages/science/FightOrFlightPage'));
const MorningRitualPage    = lazy(() => import('./pages/techniques/MorningRitualPage'));
const PrivacyPolicyPage    = lazy(() => import('./pages/PrivacyPolicyPage'));
const ForgotPasswordPage   = lazy(() => import('./pages/ForgotPasswordPage'));
const TermsPage            = lazy(() => import('./pages/TermsPage'));
const LeaderboardPage      = lazy(() => import('./pages/LeaderboardPage'));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'));
const MusicLibrary         = lazy(() => import('./components/AudioPlayer/MusicLibrary').then(m => ({ default: m.MusicLibrary })));

import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import AICoachButton from './components/AICoach/AICoachButton';
import ScrollToTopButton from './components/ScrollToTopButton';
import PWAInstallBanner from './components/PWAInstallBanner';
import OfflineIndicator from './components/OfflineIndicator';
import ChallengeNudge from './components/ChallengeNudge';
import OnboardingTour from './components/OnboardingTour';
import CookieConsent from './components/CookieConsent';
import { Toaster } from 'sonner';
import './index.css';
import { GlobalAudioPlayer } from './components/AudioPlayer/GlobalAudioPlayer';
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
        <Route path="/sessions"     element={<Navigate to="/profile?tab=sessions" replace />} />
        <Route path="/sessions/new" element={<PageWrapper><NewSessionPage /></PageWrapper>} />
        <Route path="/statistics"   element={<Navigate to="/profile?tab=progress" replace />} />
        <Route path="/faq"           element={<PageWrapper><FAQPage /></PageWrapper>} />
        <Route path="/community"          element={<PageWrapper><CommunityPage /></PageWrapper>} />
        <Route path="/community/post/:id" element={<PageWrapper><CommunityPostPage /></PageWrapper>} />
        <Route path="/login"         element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/signup"        element={<PageWrapper><SignUpPage /></PageWrapper>} />
        <Route path="/support"      element={<PageWrapper><SupportPage /></PageWrapper>} />
        <Route path="/breathing/box-breathing" element={<PageWrapper><BoxBreathingPage /></PageWrapper>} />
        <Route path="/breathing/coherent"      element={<PageWrapper><CoherentBreathingPage /></PageWrapper>} />
        <Route path="/breathing/physiological-sigh" element={<PageWrapper><PhysiologicalSighPage /></PageWrapper>} />
        <Route path="/breathing/belly-breathing" element={<PageWrapper><BellyBreathingPage /></PageWrapper>} />
        <Route path="/breathing/public-speaking" element={<PageWrapper><PublicSpeakingPage /></PageWrapper>} />
        <Route path="/breathing/high-blood-pressure" element={<PageWrapper><BloodPressurePage /></PageWrapper>} />
        <Route path="/breathing/4-7-8"         element={<PageWrapper><Breathing478Page /></PageWrapper>} />
        <Route path="/breathing/wim-hof"        element={<PageWrapper><WimHofPage /></PageWrapper>} />
        <Route path="/breathing/anxiety"        element={<PageWrapper><BreathingAnxietyPage /></PageWrapper>} />
        <Route path="/profile"               element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/data-consent"           element={<PageWrapper><DataConsentPage /></PageWrapper>} />
        <Route path="/music-library" element={<PageWrapper><MusicLibrary /></PageWrapper>} />
        <Route path="/sounds"        element={<Navigate to="/music-library" replace />} />
        <Route path="/onboarding"   element={<PageWrapper><OnboardingPage /></PageWrapper>} />
        <Route path="/globe"         element={<PageWrapper><GlobePage /></PageWrapper>} />
        <Route path="/sleep/what-is-sleep-apnea"        element={<PageWrapper><SleepApneaPage /></PageWrapper>} />
        <Route path="/sleep/why-sleep-is-important"    element={<PageWrapper><WhySleepPage /></PageWrapper>} />
        <Route path="/sleep/breathwork-for-deep-sleep" element={<PageWrapper><BreathworkSleepPage /></PageWrapper>} />
        <Route path="/sleep/story"                   element={<PageWrapper><SleepStoryPage /></PageWrapper>} />
        <Route path="/science/slow-breathing"          element={<PageWrapper><SlowBreathingPage /></PageWrapper>} />
        <Route path="/science/fight-or-flight"         element={<PageWrapper><FightOrFlightPage /></PageWrapper>} />
        <Route path="/breathing/morning-ritual"        element={<PageWrapper><MorningRitualPage /></PageWrapper>} />
        <Route path="/privacy"                         element={<PageWrapper><PrivacyPolicyPage /></PageWrapper>} />
        <Route path="/challenges"                      element={<Navigate to="/profile" replace />} />
        <Route path="/leaderboard"                     element={<PageWrapper><LeaderboardPage /></PageWrapper>} />
        {/* Auth-flow placeholders — full reset-by-email pipeline is on the roadmap */}
        <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
        <Route path="/reset-password"  element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
        <Route path="/verify-email"    element={<Navigate to="/login" replace />} />
        <Route path="/terms"           element={<PageWrapper><TermsPage /></PageWrapper>} />
        <Route path="/tos"             element={<Navigate to="/terms" replace />} />
        {/* Aliases for URLs users might type from menu labels */}
        <Route path="/contact"   element={<Navigate to="/support" replace />} />
        <Route path="/meditate"  element={<Navigate to="/breathing" replace />} />
        <Route path="/account"   element={<Navigate to="/profile" replace />} />
        <Route path="/settings"  element={<Navigate to="/profile" replace />} />
        <Route path="*"              element={<PageWrapper><NotFoundPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
    <Router>
      <ThemeProvider>
      <AuthProvider>
        <MusicProvider>
          <ErrorBoundary>
          <div className="min-h-screen">
            <ScrollToTop />
            {/* Skip link — first focusable element so keyboard users can
                bypass the whole header/navigation. WCAG 2.4.1 Bypass Blocks. */}
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1000] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-black focus:text-white focus:shadow-2xl"
            >
              Skip to main content
            </a>
            <Suspense fallback={<PageLoader />}>
              {/* `id="main"` is the skip-link target. tabIndex=-1 lets focus
                  land here without making it part of normal tab order. */}
              <div id="main" tabIndex={-1}>
                <AnimatedRoutes />
              </div>
            </Suspense>
            <AICoachButton variant="floating" />
            <ScrollToTopButton />
            <GlobalAudioPlayer />
            <PWAInstallBanner />
            <OfflineIndicator />
            <ChallengeNudge />
            <OnboardingTour />
            <CookieConsent />
            {/* Toast notifications — `richColors` keeps semantic colour
                contrast, and sonner already emits aria-live="polite" plus
                role="status" on each toast for screen-reader users. */}
            <Toaster richColors position="top-center" closeButton />
          </div>
          </ErrorBoundary>
        </MusicProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
    </HelmetProvider>
  );
}
