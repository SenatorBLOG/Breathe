// src/pages/SessionsPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar";
import api from "../api";
import { toast } from "sonner";
import { Trash2 } from 'lucide-react';
import Footer from "../components/Footer";

interface Session {
  _id: string;
  sessionDate: string;
  moodBefore: number;
  moodAfter: number;
  focusLevel: number;
  stressLevel: number;
  breathingDepth: number;
  calmnessScore: number;
  distractionCount: number;
  timeOfDay: string;
  noiseLevel: string;
  sessionLength: number;
  cycles: number;
  notes?: string;
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchSessions();
  }, [token, navigate]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all sessions?')) {
      return;
    }

    try {
      await api.delete('/sessions');
      setSessions([]);
      toast.success('All sessions deleted');
    } catch (err) {
      console.error('Error deleting sessions:', err);
    }
  };

  return (<>
    <div className="relative bg-[#001F3F]">
      {/* Navigation Bar */}
        <NavBar />

      {/* Main Content */}
      <div className="relative px-[157px] py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[#70B8FF] text-[36px] font-normal font-montserrat">
            My Meditation Sessions
          </h1>
          <div className="flex gap-4">
            <Link 
              to="/sessions/new" 
              className="px-5 py-2.5 rounded-full bg-[#3A82F7] text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <span className="text-white text-[18px] font-normal font-roboto">New Session</span>
            </Link>
            {sessions.length > 0 && (
              <button 
                onClick={handleDeleteAll}
                className="px-5 py-2.5 rounded-full border border-red-500 text-red-500 shadow-lg hover:shadow-xl hover:bg-red-500 hover:text-white transition-all"
              >
                <span className="text-[18px] font-normal font-roboto">Delete All</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-[#88AACC] text-[20px] font-roboto">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#88AACC] text-[20px] font-roboto mb-6">
              You haven't recorded any meditation sessions yet.
            </p>
            <Link 
              to="/sessions/new" 
              className="inline-block px-5 py-2.5 rounded-full bg-[#3A82F7] text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <span className="text-white text-[20px] font-normal font-roboto">Start Your First Session</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div 
                key={session._id}
                className="bg-[rgba(255,255,255,0.04)] border border-[#70B8FF] p-6 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              >
                <div className="mb-4">
                  <p className="text-[#70B8FF] text-[14px] font-roboto">
                    {new Date(session.sessionDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-[#88AACC] text-[12px] font-roboto">
                    {session.timeOfDay} • {session.sessionLength} minutes • {session.cycles} cycles
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#88AACC] text-[14px] font-roboto">Mood:</span>
                    <span className="text-[#3A82F7] text-[14px] font-roboto">
                      {session.moodBefore} → {session.moodAfter}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#88AACC] text-[14px] font-roboto">Focus Level:</span>
                    <span className="text-[#3A82F7] text-[14px] font-roboto">{session.focusLevel}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#88AACC] text-[14px] font-roboto">Stress Level:</span>
                    <span className="text-[#3A82F7] text-[14px] font-roboto">{session.stressLevel}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#88AACC] text-[14px] font-roboto">Calmness:</span>
                    <span className="text-[#3A82F7] text-[14px] font-roboto">{session.calmnessScore}/10</span>
                  </div>
                </div>

                {session.notes && (
                  <div className="border-t border-[#70B8FF] pt-3">
                    <p className="text-[#88AACC] text-[12px] font-roboto italic">"{session.notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
        
    </div>
    <Footer /></>
  );
}