import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

export default function NavBar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/breathing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-20 bg-[#1A2A4F]/95 backdrop-blur-sm border-b px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <a href="/breathing" onClick={onLogoClick} className="text-[#BCDDFF] text-2xl font-medium">Breathe</a>
        <Link to="/home-page" className="text-[#9CCBFF]">Home</Link>
        <Link to="/music-library" className="text-[#9CCBFF]">Music</Link>
        {isAuthenticated && (<Link to="/sessions" className="text-[#9CCBFF]">Sessions</Link>)
          
         }
        {/* Statistics link intentionally removed per request */}
      </div>

      <div className="flex items-center gap-3">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="px-4 py-2 rounded-full bg-[#98CCFF] text-black">Login</Link>
            <Link to="/signup" className="px-4 py-2 rounded-full bg-[#3A82F7] text-white">Sign Up</Link>
          </>
        ) : (
          <>
            {/* Profile button now navigates to statistics page */}
            <button
              onClick={() => navigate('/statistics')}
              className="px-4 py-2 rounded-full bg-white/10 text-white"
              aria-label="Open statistics"
            >
              {user?.name ? user.name : 'Profile'}
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/breathing');
              }}
              className="px-4 py-2 rounded-full bg-[#FF6B6B] text-white"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
