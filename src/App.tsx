// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import BreathingPage from './pages/BreathingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import StatsPage from './pages/StatsPage';
import SessionsPage from './pages/SessionPage';
import NewSessionPage from './pages/NewSessionPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import './index.css';
import { GlobalAudioPlayer } from './components/AudioPlayer/GlobalAudioPlayer';
import { MusicLibrary } from './components/AudioPlayer/MusicLibrary';
import { MusicProvider } from './components/contexts/MusicContext';
import { AuthProvider } from './components/contexts/AuthContext';

export default function App() {
  return (
    <Router>
        
        <AuthProvider>
        <MusicProvider>
            <div className="min-h-screen">
            <Routes>
                {/* Rroot /home-page HomePage */}
                <Route path="/" element={<Navigate to="/home-page" replace />} />
                <Route path="/home-page" element={<HomePage />} />
                <Route path="/breathing" element={<BreathingPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/sessions/new" element={<NewSessionPage />} />
                <Route path="/statistics" element={
                <ProtectedRoute>
                    <StatsPage />
                </ProtectedRoute>
                } />
                <Route path="/faq" element={<div>FAQ Page</div>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/music-library" element={<MusicLibrary />} />

                {/* catch-all:  HomePage or 404 */}
                <Route path="*" element={<HomePage />} />
            </Routes>
            <GlobalAudioPlayer />
            </div>
        </MusicProvider>
        </AuthProvider>
    </Router>
  );
}
